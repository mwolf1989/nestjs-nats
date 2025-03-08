import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3001);
    console.log('JetStream example is running on: http://localhost:3001');
  } catch (error) {
    console.error('Failed to start JetStream example:', error);
    process.exit(1);
  }
}
bootstrap(); 