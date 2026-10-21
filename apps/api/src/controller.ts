import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Response } from "express";
import { AuthGuard, AuthRequest, requireRole } from "./auth";
import { Store } from "./store";
import { Ai } from "./ai";
import {
  ApplyDto,
  DocumentDto,
  OpportunityDto,
  ProfileDto,
  StatusDto,
} from "./dto";
import { cleanSkills, match } from "./matching";
@Injectable()
export class Files {
  client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "talentmatch",
      secretAccessKey: process.env.S3_SECRET_KEY || "talentmatch-local-files",
    },
  });
  bucket = "talentmatch-documents";
  async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      if ((error as any).$metadata?.httpStatusCode !== 404) throw error;
      try {
        await this.client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
      } catch (e) {
        if (
          !["BucketAlreadyOwnedByYou", "BucketAlreadyExists"].includes(
            (e as Error).name,
          )
        )
          throw e;
      }
    }
  }
}
@Controller("api")
export class HealthController {
  constructor(private db: Store) {}
  @Get("health") async health() {
    await this.db.query("SELECT 1");
    return { status: "ok", service: "TalentMatch API" };
  }
}
@Controller("api")
@UseGuards(AuthGuard)
export class AppController {
  constructor(
    private db: Store,
    private ai: Ai,
    private files: Files,
  ) {}
  @Get("me") me(@Req() req: AuthRequest) {
    return this.db.profile(req.identity);
  }
  @Put("me") async update(@Req() req: AuthRequest, @Body() body: ProfileDto) {
    await this.db.profile(req.identity);
    return (
      await this.db.query(
        "UPDATE profiles SET name=$2,career=$3,semester=$4,bio=$5,skills=$6,projects=$7,certifications=$8,updated_at=now() WHERE id=$1 RETURNING *",
        [
          req.identity.id,
          body.name.trim(),
          body.career.trim(),
          body.semester,
          body.bio,
          cleanSkills(body.skills),
          body.projects,
          body.certifications,
        ],
      )
    )[0];
  }
  @Get("opportunities") async list(@Req() req: AuthRequest) {
    const profile = await this.db.profile(req.identity);
    const rows = await this.db.query(
      `SELECT o.*,p.name AS company_name,(SELECT count(*)::int FROM applications a WHERE a.opportunity_id=o.id) AS applicant_count FROM opportunities o JOIN profiles p ON p.id=o.company_id WHERE ${req.identity.role === "company" ? "o.company_id=$1" : "o.active=true"} ORDER BY o.created_at DESC`,
      req.identity.role === "company" ? [req.identity.id] : [],
    );
    return rows
      .map((o) => ({ ...o, ...match(profile.skills, o.skills) }))
      .sort((a, b) =>
        req.identity.role === "student" ? b.score - a.score : 0,
      );
  }
  @Post("opportunities") async create(
    @Req() req: AuthRequest,
    @Body() body: OpportunityDto,
  ) {
    requireRole(req.identity, "company");
    await this.db.profile(req.identity);
    const skills = cleanSkills(body.skills);
    if (!skills.length)
      throw new BadRequestException("Agrega al menos una habilidad.");
    return (
      await this.db.query(
        "INSERT INTO opportunities(company_id,title,description,area,modality,location,skills) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          req.identity.id,
          body.title,
          body.description,
          body.area,
          body.modality,
          body.location,
          skills,
        ],
      )
    )[0];
  }
  @Post("opportunities/:id/toggle") async toggle(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    requireRole(req.identity, "company");
    const rows = await this.db.query(
      "UPDATE opportunities SET active=NOT active WHERE id=$1 AND company_id=$2 RETURNING *",
      [id, req.identity.id],
    );
    if (!rows.length) throw new NotFoundException("Práctica no encontrada.");
    return rows[0];
  }
  private async recommendationData(req: AuthRequest, id: string) {
    requireRole(req.identity, "student");
    const profile = await this.db.profile(req.identity);
    const [op] = await this.db.query(
      "SELECT * FROM opportunities WHERE id=$1 AND active=true",
      [id],
    );
    if (!op) throw new NotFoundException("Práctica no disponible.");
    return { op, comparison: match(profile.skills, op.skills) };
  }
  @Post("opportunities/:id/plan") async plan(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const { op, comparison } = await this.recommendationData(req, id);
    return {
      ...comparison,
      ...(await this.ai.plan(comparison.missing, op.title)),
    };
  }
  @Get("documents") async documents(@Req() req: AuthRequest) {
    return this.db.query(
      "SELECT id,name,kind,size,created_at FROM documents WHERE owner_id=$1 ORDER BY created_at DESC",
      [req.identity.id],
    );
  }
  @Post("documents")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  async upload(
    @Req() req: AuthRequest,
    @Body() body: DocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    requireRole(req.identity, "student");
    await this.db.profile(req.identity);
    if (
      !file ||
      file.mimetype !== "application/pdf" ||
      file.buffer.subarray(0, 5).toString() !== "%PDF-"
    )
      throw new BadRequestException(
        "Carga un documento PDF válido de hasta 5 MB.",
      );
    const key = `${req.identity.id}/${randomUUID()}.pdf`;
    const name =
      file.originalname.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 200) ||
      "documento.pdf";
    try {
      await this.files.ensureBucket();
      await this.files.client.send(
        new PutObjectCommand({
          Bucket: this.files.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: "application/pdf",
        }),
      );
    } catch {
      throw new ServiceUnavailableException(
        "No se pudo guardar el archivo en MinIO. Intenta nuevamente.",
      );
    }
    try {
      return (
        await this.db.query(
          "INSERT INTO documents(owner_id,name,object_key,kind,size) VALUES($1,$2,$3,$4,$5) RETURNING id,name,kind,size,created_at",
          [req.identity.id, name, key, body.kind, file.size],
        )
      )[0];
    } catch (error) {
      await this.files.client
        .send(new DeleteObjectCommand({ Bucket: this.files.bucket, Key: key }))
        .catch(() => {});
      throw error;
    }
  }
  @Get("documents/:id/download") async download(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const [doc] = await this.db.query(
      `SELECT d.* FROM documents d WHERE d.id=$1 AND (d.owner_id=$2 OR EXISTS(SELECT 1 FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE a.document_id=d.id AND o.company_id=$2))`,
      [id, req.identity.id],
    );
    if (!doc) throw new NotFoundException("Documento no encontrado.");
    let data;
    try {
      data = await this.files.client.send(
        new GetObjectCommand({
          Bucket: this.files.bucket,
          Key: doc.object_key,
        }),
      );
    } catch {
      throw new ServiceUnavailableException(
        "El archivo no está disponible. Intenta nuevamente.",
      );
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    );
    res.setHeader("Cache-Control", "no-store");
    try {
      res.send(Buffer.from(await data.Body!.transformToByteArray()));
    } catch {
      res.destroy();
    }
  }
  @Post("applications") async apply(
    @Req() req: AuthRequest,
    @Body() body: ApplyDto,
  ) {
    requireRole(req.identity, "student");
    await this.db.profile(req.identity);
    // INSERT SELECT comprueba titularidad del CV y que la práctica siga abierta.
    try {
      const rows = await this.db.query(
        `INSERT INTO applications(student_id,opportunity_id,document_id) SELECT $1,o.id,d.id FROM opportunities o CROSS JOIN documents d WHERE o.id=$2 AND o.active=true AND d.id=$3 AND d.owner_id=$1 AND d.kind='cv' RETURNING *`,
        [req.identity.id, body.opportunityId, body.documentId],
      );
      if (!rows.length)
        throw new BadRequestException(
          "Selecciona una práctica abierta y un CV propio.",
        );
      return rows[0];
    } catch (error) {
      if ((error as any).code === "23505")
        throw new ConflictException("Ya te postulaste a esta práctica.");
      throw error;
    }
  }
  @Get("applications") async applications(@Req() req: AuthRequest) {
    return this.db.query(
      `SELECT a.*,o.title,o.company_id,p.name AS company_name,s.name AS student_name,s.career,s.semester,s.skills,s.projects,s.certifications,d.name AS document_name FROM applications a JOIN opportunities o ON o.id=a.opportunity_id JOIN profiles p ON p.id=o.company_id JOIN profiles s ON s.id=a.student_id JOIN documents d ON d.id=a.document_id WHERE ${req.identity.role === "company" ? "o.company_id" : "a.student_id"}=$1 ORDER BY a.created_at DESC`,
      [req.identity.id],
    );
  }
  @Put("applications/:id/status") async status(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: StatusDto,
  ) {
    requireRole(req.identity, "company");
    const rows = await this.db.query(
      "UPDATE applications a SET status=$3 FROM opportunities o WHERE a.id=$1 AND o.id=a.opportunity_id AND o.company_id=$2 RETURNING a.*",
      [id, req.identity.id, body.status],
    );
    if (!rows.length) throw new NotFoundException("Postulación no encontrada.");
    return rows[0];
  }
}
