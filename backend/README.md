# GamutX LMS Backend

A NestJS-based Learning Management System backend that provides comprehensive topic management functionality with Supabase integration.

## Features

- **Topic Management**: Full CRUD operations for learning topics
- **Health Monitoring**: Service and database connection health checks
- **API Documentation**: Comprehensive Swagger documentation with examples
- **Database Integration**: Supabase PostgreSQL database
- **Authentication**: JWT-based authentication with Bearer token and cookie support
- **Validation**: Request/response validation with class-validator
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Logging**: Request/response logging with interceptors
- **Testing**: Unit and E2E testing setup

## Project Structure

```
backend/
├── src/
│   ├── common/                 # Shared utilities and helpers
│   │   ├── filters/           # Exception filters
│   │   ├── helpers/           # Helper functions and constants
│   │   └── interceptors/      # Request/response interceptors
│   ├── config/                # Configuration files
│   ├── core/                  # Core modules
│   │   └── database/          # Database configuration
│   ├── modules/               # Feature modules
│   │   ├── api-docs/          # API documentation testing
│   │   └── topics/            # Topic management module
│   │       ├── dto/           # Data Transfer Objects
│   │       ├── topics.controller.ts
│   │       ├── topics.service.ts
│   │       └── topics.module.ts
│   └── services/              # Shared services
├── test/                      # Test files
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── development/               # Development utilities
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm
- Supabase account and project

### Installation
```bash
# Install dependencies
npm install

# Copy the example environment file
cp env.example .env

# Initialize environment (optional - auto-generates .env if missing)
npm run env:init
```

### Environment Variables
Configure the following environment variables in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=
SUPABASE_ANON_KEY=


FRONTEND_URL=
COOKIE_LIFETIME=
PORT=5000
NODE_ENV=development
```

### Running the Server
```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Build the project
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## API Endpoints

The application provides the following main endpoint groups:

### Health Check
- **GET /api** - Basic service status
- **GET /api/health** - Detailed health check with Supabase connection status

### Topics Management
- **POST /api/topics** - Create a new topic
- **GET /api/topics** - Get all topics (with optional status filtering)
- **GET /api/topics/:id** - Get topic by ID
- **PUT /api/topics/:id** - Update topic by ID
- **DELETE /api/topics/:id** - Delete topic by ID

### API Documentation
- **POST /api/api-docs-test/verify-documentation** - Verify API documentation completeness
- **GET /api/api-docs-test/swagger-status** - Get Swagger documentation status

## API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:5000/api/docs
```

The documentation includes:
- Complete endpoint specifications
- Request/response schemas
- Example requests and responses
- Authentication requirements
- Error response formats

For detailed API documentation, see [docs/api.md](docs/api.md).

## Topic Data Structure

Topics have the following structure:

```json
{
  "id": "uuid",
  "topic_code": "INTRO_JS_001",
  "title": "Introduction to JavaScript Variables",
  "description": "Learn about JavaScript variables, data types, and declaration methods",
  "status": "active", // draft, active, inactive
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Response Format

All API responses follow a consistent format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": {}, // Response data
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Environment Management
```bash
# Generate .env from example
npm run env:init

# Update env.example from current .env
npm run env:example
```

### Testing
The project includes comprehensive testing:
- Unit tests for services and controllers
- E2E tests for API endpoints
- Test coverage reporting

## Technologies Used

- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
- **Authentication**: JWT
- **Language**: TypeScript

## Contributing

1. Follow the existing code structure and patterns
2. Add appropriate tests for new features
3. Update documentation when adding new endpoints
4. Ensure all tests pass before submitting changes
5. Follow the established error handling patterns

## License

This project is licensed under the UNLICENSED license.
