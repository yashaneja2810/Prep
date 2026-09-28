import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NODE_ENV, CORS_CONFIG, SWAGGER_CONFIG } from './common/helpers/string-const';
import { json, urlencoded } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure body parsers with larger size limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  

  // Add global prefix
  app.setGlobalPrefix('api');

  // Enable CORS with credentials
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || false
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
          ], // Allow common development URLs
    methods: CORS_CONFIG.DEFAULT_METHODS,
    credentials: CORS_CONFIG.CREDENTIALS,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Content-Length'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  //  Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  //  Add global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('GamutX LMS API')
    .setDescription('The Learning Management System API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('jwt_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'jwt_token',
      description: 'JWT token stored in HTTP-only cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_CONFIG.API_ROUTES, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Get port from environment or default to 5000
  const port = process.env.PORT || 5000;
  const nodeEnv = process.env.NODE_ENV || NODE_ENV.DEVELOPMENT;

  // Start the server
  await app.listen(port);

  // Log application info
  const appUrl = await app.getUrl();
  console.log(`🚀 Application is running in ${nodeEnv} mode on: ${appUrl}`);
  console.log(
    `📚 Swagger documentation is available at: ${appUrl}/${SWAGGER_CONFIG.API_ROUTES}`,
  );
  console.log(`🔧 Global API prefix: /api`);
  console.log(`🌐 CORS enabled with credentials support`);
  console.log(`🍪 Cookie parser middleware active`);
  console.log(`🛡️  Global exception filters active`);
  console.log(`📊 Global logging interceptor active`);
  console.log(`✅ Global validation pipe active`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
