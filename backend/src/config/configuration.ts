import * as Joi from 'joi';
import { NODE_ENV, ENV } from '../common/helpers/string-const';

/**
 * Configuration validation schema for environment variables
 * Simplified for MVP requirements with development-friendly defaults
 */
export const validationSchema = Joi.object({
  // Server Configuration
  [ENV.PORT]: Joi.number().default(5000),
  [ENV.NODE_ENV]: Joi.string()
    .valid(NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION, NODE_ENV.TEST)
    .default(NODE_ENV.DEVELOPMENT),
  [ENV.API_PREFIX]: Joi.string().default('api'),
  
  // Supabase Configuration (optional in development for testing)
  [ENV.SUPABASE_URL]: Joi.string().uri().optional().allow('', null),
  [ENV.SUPABASE_ANON_KEY]: Joi.string().optional().allow('', null),
  [ENV.SUPABASE_SERVICE_ROLE_KEY]: Joi.string().optional().allow('', null),
  
  // JWT Configuration
  [ENV.JWT_SECRET]: Joi.string().default('development_jwt_secret_key_not_for_production'),
  [ENV.JWT_EXPIRATION]: Joi.string().default('1d'),
  
  // Frontend URL for CORS (optional in development - allows all origins)
  [ENV.FRONTEND_URL]: Joi.string().uri().optional().allow('', null),
  
  // Cookie Configuration
  [ENV.COOKIE_LIFETIME]: Joi.string().default('7d'),
});

/**
 * Application configuration factory
 * Returns structured configuration object from environment variables
 */
export default () => ({
  // Server settings
  port: parseInt(process.env[ENV.PORT] || '5000', 10),
  nodeEnv: process.env[ENV.NODE_ENV] || NODE_ENV.DEVELOPMENT,
  apiPrefix: process.env[ENV.API_PREFIX] || 'api',
  
  // Supabase settings
  supabase: {
    url: process.env[ENV.SUPABASE_URL] || '',
    anonKey: process.env[ENV.SUPABASE_ANON_KEY] || '',
    serviceRoleKey: process.env[ENV.SUPABASE_SERVICE_ROLE_KEY] || '',
  },
  
  // JWT settings
  jwt: {
    secret: process.env[ENV.JWT_SECRET] || 'development_jwt_secret_key_not_for_production',
    expiresIn: process.env[ENV.JWT_EXPIRATION] || '1d',
  },
  
  // CORS settings
  cors: {
    origin: process.env[ENV.NODE_ENV] === NODE_ENV.DEVELOPMENT 
      ? true // Allow all origins in development
      : process.env[ENV.FRONTEND_URL] || 'http://localhost:3000',
  },
  
  // Cookie settings
  cookie: {
    lifetime: process.env[ENV.COOKIE_LIFETIME] || '7d',
  },
  
  // Swagger settings
  swagger: {
    title: 'GamutX LMS API',
    description: 'The Learning Management System API documentation',
    version: '1.0',
    path: 'api/docs',
  },
}); 