const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envExampleFilePath = path.join(rootDir, '.env.example');

const envExampleContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=gamutx_lms_dev

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Frontend URL for CORS and callbacks (optional in development)
# FRONTEND_URL=http://localhost:3000

# Cookie Configuration
COOKIE_LIFETIME=7d
`;

try {
  fs.writeFileSync(envExampleFilePath, envExampleContent);
  console.log('.env.example file has been created successfully');
} catch (error) {
  console.error(`Error creating .env.example file: ${error.message}`);
} 