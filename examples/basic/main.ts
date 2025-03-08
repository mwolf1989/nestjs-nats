import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('Basic example is running on: http://localhost:3000');
  } catch (error) {
    console.error('Failed to start basic example:', error);
    process.exit(1);
  }
}
bootstrap(); 