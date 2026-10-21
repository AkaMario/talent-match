import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  Matches,
} from "class-validator";
export class ProfileDto {
  @IsString() @MinLength(2) @Matches(/\S/) @MaxLength(120) name!: string;
  @IsString() @MaxLength(160) career!: string;
  @IsInt() @Min(1) @Max(16) semester!: number;
  @IsString() @MaxLength(2000) bio!: string;
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  skills!: string[];
  @IsString() @MaxLength(3000) projects!: string;
  @IsString() @MaxLength(2000) certifications!: string;
}
export class OpportunityDto {
  @IsString() @MinLength(4) @Matches(/\S/) @MaxLength(160) title!: string;
  @IsString()
  @MinLength(30)
  @Matches(/\S/)
  @MaxLength(5000)
  description!: string;
  @IsString() @MinLength(2) @Matches(/\S/) @MaxLength(80) area!: string;
  @IsIn(["Remoto", "Híbrido", "Presencial"]) modality!: string;
  @IsString() @MinLength(2) @Matches(/\S/) @MaxLength(120) location!: string;
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  skills!: string[];
}
export class ApplyDto {
  @IsUUID() opportunityId!: string;
  @IsUUID() documentId!: string;
}
export class StatusDto {
  @IsIn(["En revisión", "Entrevista", "Aceptada", "No seleccionada"])
  status!: string;
}
export class DocumentDto {
  @IsIn(["cv", "certificate", "project"]) kind!: string;
}
