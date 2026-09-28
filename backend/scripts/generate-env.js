const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envFilePath = path.join(rootDir, '.env');

const defaultEnvContent = `# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=api

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=gamutx_lms_dev

# JWT Authentication
JWT_SECRET=development_jwt_secret_key_not_for_production
JWT_EXPIRATION=1d

# Swagger Documentation
SWAGGER_TITLE=GamutX LMS API (Development)
SWAGGER_DESCRIPTION=The Learning Management System API documentation - Development Environment
SWAGGER_VERSION=1.0
SWAGGER_PATH=api/docs

# CORS Settings
CORS_ORIGIN=*
`;

// Create scripts directory if it doesn't exist
if (!fs.existsSync(path.dirname(__filename))) {
  fs.mkdirSync(path.dirname(__filename), { recursive: true });
}

// Generate .env file if it doesn't exist
if (!fs.existsSync(envFilePath)) {
  fs.writeFileSync(envFilePath, defaultEnvContent);
  console.log('.env file has been created with default development values');
} else {
  console.log('.env file already exists, not overwriting');
} 