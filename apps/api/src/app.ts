import "reflect-metadata";
import { Module, ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppController, Files, HealthController } from "./controller";
import { Store } from "./store";
import { Ai } from "./ai";
import { AuthGuard } from "./auth";
@Module({
  controllers: [AppController, HealthController],
  providers: [Store, Ai, Files, AuthGuard],
})
export class AppModule {}
export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
  return app;
}
