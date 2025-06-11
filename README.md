# openapi-express-ts

A TypeScript library for generating OpenAPI documentation from Express class controllers.

## Installation

```bash
npm install openapi-express-ts
```

## TypeScript Configuration

Ensure your `tsconfig.json` has the following options enabled:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Features

- TypeScript decorators for Express controllers and routes
- Automatic OpenAPI 3.0.0 documentation generation
- Support for route parameters, request body, and responses
- Customize API documentation with descriptions, tags, and schemas
- Built-in Swagger UI integration
- Type-safe parameter and response definitions
- Automatic request/response schema generation from TypeScript types

## Usage

### Basic Example

```typescript
import { Controller, Get, Post } from 'openapi-express-ts';
import express from 'express';
import * as swaggerUi from 'swagger-ui-express';

// Define your data types
class User {
  id: number;
  name: string;
  email: string;
}

class CreateUserDto {
  name: string;
  email: string;
}

// Create a controller with decorators
@Controller('/users', {
  description: 'User management endpoints',
  tags: ['Users']
})
class UserController {
  @Get('/')
  getUsers(): User[] {
    // Implementation
    return [];
  }

  @Post('/')
  createUser(body: CreateUserDto): User {
    // Implementation
    return { id: 1, ...body };
  }
}

// Set up Express app with Swagger UI
const app = express();

const apiDoc = generateOpenAPISpec({
  title: 'User Management API',
  version: '1.0.0',
  description: 'API for managing users in the system',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ]
});

```

## Available Decorators

### @Controller(path: string, options?: ControllerMetadata)
Marks a class as an Express controller with a base path.
```typescript
interface ControllerMetadata {
  description?: string;  // Controller description in OpenAPI docs
  tags?: string[];      // OpenAPI tags for grouping endpoints
}
```

### Route Decorators
- `@Get(path: string, options?: RouteMetadata)`
- `@Post(path: string, options?: RouteMetadata)`
- `@Put(path: string, options?: RouteMetadata)`
- `@Delete(path: string, options?: RouteMetadata)`
- `@Patch(path: string, options?: RouteMetadata)`

Each route decorator accepts a path and optional metadata:
```typescript
interface RouteMetadata {
  description?: string;  // Route description in OpenAPI docs
  summary?: string;      // Brief summary of the route
  tags?: string[];      // Additional OpenAPI tags
}
```

## OpenAPI Configuration

When generating the OpenAPI documentation, you can configure various aspects:

```typescript
interface OpenAPIOptions {
  title: string;         // API name
  version: string;       // API version
  description?: string;  // API description
  base?: string          // application base prefix url e.g `/api/v1`
  servers?: Array<{      // Server configurations
    url: string;
    description?: string;
  }>;
}
```

## Best Practices

1. Use TypeScript interfaces to define request/response types
2. Group related endpoints using controller tags
3. Provide clear descriptions for endpoints and parameters
4. Use meaningful HTTP status codes in @ApiResponse decorators
5. Configure servers array for different environments

## License

MIT