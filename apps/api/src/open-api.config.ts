import { DocumentBuilder } from '@nestjs/swagger'

export const openApiConfig = new DocumentBuilder()
  .setTitle('BackTix API')
  .setDescription('The BackTix API docs')
  .setVersion('1.0')
  .addBearerAuth()
  .build()
