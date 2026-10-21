import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool } from "pg";
import { Identity } from "./auth";
@Injectable()
export class Store implements OnModuleInit, OnModuleDestroy {
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://talentmatch:talentmatch-local-db@localhost:5432/talentmatch",
    max: 10,
  });
  async onModuleInit() {
    await this.pool.query("SELECT 1");
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
  async query(sql: string, params: unknown[] = []) {
    return (await this.pool.query(sql, params)).rows;
  }
  async profile(user: Identity) {
    await this.query(
      "INSERT INTO profiles(id,role,name,email) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET role=EXCLUDED.role,email=EXCLUDED.email",
      [user.id, user.role, user.name, user.email],
    );
    return (
      await this.query("SELECT * FROM profiles WHERE id=$1", [user.id])
    )[0];
  }
}
