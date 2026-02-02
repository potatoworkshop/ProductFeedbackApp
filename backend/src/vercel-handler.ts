import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import type { Handler } from 'serverless-http';
import express, { type Request, type Response } from 'express';
import { AppModule } from './app.module';

let cachedHandler: Handler | null = null;

async function createHandler(): Promise<Handler> {
  if (cachedHandler) {
    return cachedHandler;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: ['http://localhost:3000', process.env.WEB_ORIGIN],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();
  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

export default async function handler(req: Request, res: Response) {
  const resolvedHandler = await createHandler();
  return resolvedHandler(req, res);
}
