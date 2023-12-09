import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { config } from './common/config'
import metadata from './metadata'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const openApiConfig = new DocumentBuilder()
    .setTitle('BackTix API')
    .setDescription('The BackTix API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, openApiConfig)
  await SwaggerModule.loadPluginMetadata(metadata)
  SwaggerModule.setup('api', app, document)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  await app.listen(config.server.port, config.server.host)
}
bootstrap()
