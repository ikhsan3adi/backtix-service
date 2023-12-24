import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { config } from './common/config'
import metadata from './metadata'
import { openApiConfig } from './open-api.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const document = SwaggerModule.createDocument(app, openApiConfig)
  if (metadata) await SwaggerModule.loadPluginMetadata(metadata)
  SwaggerModule.setup('api', app, document)

  app.setGlobalPrefix('api')
  app.use(helmet())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  )

  await app.listen(config.server.port, config.server.host)
}
bootstrap()
