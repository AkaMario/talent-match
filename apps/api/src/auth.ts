import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Request } from "express";
export type Identity = {
  id: string;
  role: "student" | "company";
  name: string;
  email: string;
};
export type AuthRequest = Request & { identity: Identity };
@Injectable()
export class AuthGuard implements CanActivate {
  private jwks = createRemoteJWKSet(
    new URL(
      process.env.KEYCLOAK_JWKS ||
        "http://localhost:8080/realms/talentmatch/protocol/openid-connect/certs",
    ),
  );
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token)
      throw new UnauthorizedException("Inicia sesión para continuar.");
    let payload;
    try {
      ({ payload } = await jwtVerify(token, this.jwks, {
        issuer:
          process.env.KEYCLOAK_ISSUER ||
          "http://localhost:8080/realms/talentmatch",
        audience: "talentmatch-api",
        algorithms: ["RS256"],
      }));
    } catch {
      throw new UnauthorizedException(
        "La sesión expiró o no es válida. Vuelve a ingresar.",
      );
    }
    const roles = (payload.realm_access as { roles?: string[] })?.roles || [];
    const role = roles.includes("company")
      ? "company"
      : roles.includes("student")
        ? "student"
        : null;
    if (!role || !payload.sub || !/^[0-9a-f-]{36}$/i.test(payload.sub))
      throw new ForbiddenException("La cuenta no tiene un rol válido.");
    request.identity = {
      id: payload.sub,
      role,
      name: String(payload.name || payload.preferred_username || "Mi perfil"),
      email: String(payload.email || ""),
    };
    return true;
  }
}
export function requireRole(user: Identity, role: Identity["role"]) {
  if (user.role !== role)
    throw new ForbiddenException("Tu cuenta no tiene acceso a esta función.");
}
