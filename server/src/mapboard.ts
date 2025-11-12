import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export class MapBoard {
  static async run(config?: { port?: number; env?: Record<string, string> }) {
    if (config?.env) {
      for (const key in config.env) {
        process.env[key] = config.env[key];
      }
    }

    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const port = config?.port || Number(process.env.PORT) || 8083;
    await app.listen(port);
    console.log(`Server started at http://localhost:${port}`);
  }
}
