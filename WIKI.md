# OpenAPI Express TypeScript - Wiki

## Overview

OpenAPI Express TypeScript is a TypeScript library designed to simplify the generation of OpenAPI documentation from Express class controllers. It provides a set of decorators that allow you to annotate your Express controllers and routes with metadata that is used to automatically generate OpenAPI 3.0.0 documentation.

## Table of Contents

1. [Installation](#installation)
2. [TypeScript Configuration](#typescript-configuration)
3. [Core Concepts](#core-concepts)
4. [Project Structure](#project-structure)
5. [API Reference](#api-reference)
   - [Decorators](#decorators)
   - [Functions](#functions)
   - [Types](#types)
6. [Examples](#examples)
   - [Basic Controller Example](#basic-controller-example)
   - [Multiple Controllers Example](#multiple-controllers-example)
7. [Advanced Usage](#advanced-usage)
   - [Express Integration](#express-integration)
   - [Customizing Documentation](#customizing-documentation)
   - [Handling Authentication](#handling-authentication)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Debug Tips](#debug-tips)
   - [Known Limitations](#known-limitations)
10. [Release History](#release-history)
11. [Contributing](#contributing)

## Installation

```bash
npm install openapi-express-ts
```

## TypeScript Configuration

The library relies on TypeScript's decorator and metadata reflection capabilities. Ensure your `tsconfig.json` has the following options enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Core Concepts

### Controllers and Routes

The library uses a class-based approach where:

- Classes decorated with `@Controller` represent Express routers
- Class methods decorated with `@Get`, `@Post`, etc. represent route handlers
- Method parameters can be decorated with `@Body`, etc. to bind request data

### Metadata Storage

All decorator metadata is stored in a singleton `MetadataStorage` class, which is used to:

1. Track all controllers and their routes
2. Build the OpenAPI specification based on collected metadata
3. Register routes with an Express application

### Schema Generation

The library automatically generates OpenAPI schemas from TypeScript types:

- Uses TypeScript's reflection metadata to determine types
- Handles primitive types, objects, arrays, and nested structures
- Provides type-safe parameter and response definitions

#### Schema Generation Features

1. **Automatic Type Inference**:
   - Primitive types (string, number, boolean)
   - Date objects (formatted as date-time strings)
   - Arrays and nested objects
   - Class instances with properties

2. **Type Caching**:
   - Uses a schema cache to avoid redundant processing
   - Prevents infinite loops with circular references

3. **Schema Strategies**:
   - Direct reflection via TypeScript metadata
   - Class instantiation for property extraction
   - String analysis for generics and complex types

## Project Structure

The library is organized into the following main components:

### Core Files

- **`index.ts`**: Main entry point that exports public API
- **`decorators.ts`**: Contains all decorator implementations 
  - Controller decorators
  - Route decorators (@Get, @Post, etc.)
  - Parameter decorators (@Body, etc.)
- **`metadata.ts`**: Implementation of the metadata storage system
- **`register.ts`**: Functions to register controllers with Express
- **`openapi.ts`**: OpenAPI specification generation logic
- **`types.ts`**: TypeScript type definitions used throughout the library

### Testing

The library includes a comprehensive test suite using Jest, covering:

- **Decorator Tests**: Verifies that decorators correctly store metadata
- **Schema Generation Tests**: Validates correct schema generation for different TypeScript types
- **OpenAPI Tests**: Ensures the generated OpenAPI spec matches expected structure
- **Express Integration Tests**: End-to-end tests for controller registration and route handling
- **Body Decorator Tests**: Specialized tests for request body handling
- **Register Tests**: Tests for the controller registration process

To run the tests:

```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

Testing structure:
```
src/tests/
  ├── body-decorator.test.ts    # Tests for body parameter binding
  ├── decorators.test.ts        # Tests for all decorators
  ├── jest.setup.ts             # Jest configuration
  ├── openapi-body.test.ts      # Tests for body schemas in OpenAPI
  ├── openapi.test.ts           # Tests for OpenAPI generation
  ├── register.test.ts          # Tests for Express registration
  ├── schema-generation.test.ts # Tests for schema generation
  └── test-helper.ts            # Testing utilities
```

### Example Usage

The `example.ts` file demonstrates how to use the library to create a simple API with:

1. Controller and route decorators
2. OpenAPI specification generation
3. Express integration
4. Swagger UI setup

## API Reference

### Decorators

#### Controller Decorator

```typescript
@Controller(path: string, options?: ControllerMetadata)
```

Marks a class as an Express controller with a base path for all routes within it.

- `path`: The base URL path for all routes in this controller
- `options.description`: Description of what the controller handles
- `options.tags`: OpenAPI tags to categorize the controller's endpoints

#### Route Decorators

```typescript
@Get(path: string, options?: RouteMetadata)
@Post(path: string, options?: RouteMetadata)
@Put(path: string, options?: RouteMetadata)
@Delete(path: string, options?: RouteMetadata)
@Patch(path: string, options?: RouteMetadata)
```

Each route decorator marks a controller method as a route handler.

- `path`: The URL path relative to the controller's base path
- `options.description`: Route description in OpenAPI docs
- `options.summary`: Brief summary of the route
- `options.tags`: Additional OpenAPI tags

#### Parameter Decorators

```typescript
@Body(options?: ParameterOptions)
```

Binds the request body to a parameter and documents it in the OpenAPI spec.

- `options.description`: Description of the request body
- `options.required`: Whether the body is required (default: true)

Example:
```typescript
@Post('/')
createUser(@Body({ description: 'User creation data' }) userData: CreateUserDto): User {
  // Implementation
}
```

The library also supports other parameter decorators for different parts of the request:

```typescript
@Path(name: string, options?: ParameterOptions)
@Query(name: string, options?: ParameterOptions)
@Header(name: string, options?: ParameterOptions)
```

These decorators bind and document route parameters from different sources:

- `name`: The name of the parameter to bind
- `options.description`: Description of the parameter
- `options.required`: Whether the parameter is required

### Functions

#### registerControllers

```typescript
registerControllers(app: Express, controllers: any[], openApiDoc: OpenAPIOptions)
```

Registers decorated controller classes with an Express application and sets up OpenAPI documentation.

- `app`: The Express application instance
- `controllers`: Array of controller classes decorated with @Controller
- `openApiDoc`: Configuration options for OpenAPI documentation

#### generateOpenAPISpec

```typescript
generateOpenAPISpec(options: OpenAPIOptions)
```

Generates an OpenAPI 3.0.0 specification from controller metadata.

- `options`: Configuration options for the OpenAPI documentation

### Types

#### OpenAPIOptions

```typescript
interface OpenAPIOptions {
  title: string;         // API name
  version: string;       // API version
  description?: string;  // API description
  base?: string;         // Application base prefix URL e.g., `/api/v1`
  servers?: Array<{      // Server configurations
    url: string;
    description?: string;
  }>;
}
```

#### ControllerMetadata

```typescript
interface ControllerMetadata {
  path: string;
  description?: string;
  tags?: string[];
}
```

#### RouteMetadata

```typescript
interface RouteMetadata {
  path: string;
  method: HttpMethod;
  handlerName: string;
  description?: string;
  summary?: string;
  tags?: string[];
  parameters?: ParameterMetadata[];
  responses?: ResponseMetadata;
}
```

## Examples

### Basic Controller Example

```typescript
import { Controller, Get, Post, Body } from 'openapi-express-ts';
import express from 'express';
import { registerControllers } from 'openapi-express-ts';

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
  private users: User[] = [];
  
  @Get('/', {
    summary: 'List all users',
    description: 'Returns a list of all users in the system'
  })
  getUsers(): User[] {
    return this.users;
  }

  @Get('/:id', {
    summary: 'Get user by ID',
    description: 'Returns a single user by their ID'
  })
  getUserById(req: express.Request): User | { error: string } {
    const user = this.users.find(u => u.id.toString() === req.params.id);
    return user || { error: 'User not found' };
  }

  @Post('/', {
    summary: 'Create new user',
    description: 'Creates a new user in the system'
  })
  createUser(@Body() body: CreateUserDto): User {
    const newUser = { 
      id: this.users.length + 1, 
      ...body 
    };
    this.users.push(newUser);
    return newUser;
  }
}

// Set up Express app with Swagger UI
const app = express();
app.use(express.json());  // Important for parsing JSON request bodies

// Register controllers and generate OpenAPI docs
registerControllers(app, [UserController], {
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

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
  console.log('API docs available at http://localhost:3000/swagger');
});
```

### Multiple Controllers Example

```typescript
import { Controller, Get, Post, Body } from 'openapi-express-ts';
import express from 'express';
import { registerControllers } from 'openapi-express-ts';

// User-related types and controller
class User {
  id: number;
  name: string;
  email: string;
}

@Controller('/users', {
  description: 'User management endpoints',
  tags: ['Users']
})
class UserController {
  @Get('/')
  getUsers(): User[] {
    return [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
  }
}

// Product-related types and controller
class Product {
  id: number;
  name: string;
  price: number;
}

@Controller('/products', {
  description: 'Product management endpoints',
  tags: ['Products']
})
class ProductController {
  @Get('/')
  getProducts(): Product[] {
    return [{ id: 1, name: 'Sample Product', price: 99.99 }];
  }
  
  @Get('/:id')
  getProductById(req: express.Request): Product {
    return { id: parseInt(req.params.id), name: 'Sample Product', price: 99.99 };
  }
}

// Setup Express with both controllers
const app = express();

registerControllers(app, [UserController, ProductController], {
  title: 'E-Commerce API',
  version: '1.0.0',
  description: 'API for managing users and products',
  // Base path prefix for all routes
  base: '/api/v1',  
  servers: [
    { url: 'http://localhost:3000', description: 'Development' }
  ]
});

app.listen(3000);
```

## Advanced Usage

### Express Integration

The library seamlessly integrates with Express applications:

1. **Automatic Route Registration**:
   - Routes are automatically registered with the Express app
   - Controller paths are combined with route paths for full URL paths
   - Request handling is properly wired to controller methods

2. **Swagger UI Integration**:
   - Automatically sets up Swagger UI at `/swagger` endpoint
   - Creates an `api-doc/openapi.json` file with the specification
   - Configurable through the `registerControllers` function

Example:
```typescript
import express from 'express';
import { registerControllers } from 'openapi-express-ts';

const app = express();
app.use(express.json());

// Register controllers and set up Swagger UI
registerControllers(app, [UserController, ProductController], {
  title: 'My API',
  version: '1.0.0',
  description: 'API documentation',
  base: '/api/v1',  // all routes will be prefixed with this base path
  servers: [
    { url: 'http://localhost:3000', description: 'Development' },
    { url: 'https://api.example.com', description: 'Production' }
  ]
});

app.listen(3000);
```

### Customizing Documentation

You can customize the OpenAPI documentation by providing additional metadata in your decorators:

```typescript
@Controller('/users', {
  description: 'User management endpoints',
  tags: ['Users']
})
class UserController {
  @Get('/:id', {
    summary: 'Get user by ID',
    description: 'Returns a single user by their ID',
    tags: ['User Details']
  })
  getUserById(): User {
    // Implementation
    return {} as User;
  }
}
```

### Handling Authentication

For routes requiring authentication, document security requirements:

```typescript
@Post('/secure', {
  summary: 'Secure endpoint',
  description: 'This endpoint requires authentication',
  security: [{ bearerAuth: [] }]
})
secureOperation() {
  // Implementation
}
```

## Best Practices

1. **Use TypeScript interfaces** to define request/response types
2. **Group related endpoints** using controller tags
3. **Provide clear descriptions** for endpoints and parameters
4. **Use meaningful HTTP status codes** in your responses
5. **Configure servers array** for different environments

## Troubleshooting

### Common Issues

1. **Metadata not being reflected**: 
   - Ensure your `tsconfig.json` has `experimentalDecorators` and `emitDecoratorMetadata` enabled
   - Verify you have imported `reflect-metadata` at the entry point of your application
   - Check that you're using TypeScript version 4.5 or higher

2. **Routes not being registered**: 
   - Make sure you're passing the controller class itself (not an instance) to `registerControllers`
   - Verify that controller paths don't have conflicting routes
   - Ensure that route methods are public (not private or protected)

3. **Complex types not properly documented**: 
   - The library has limitations in inferring complex generic types
   - Use explicit type annotations where possible
   - For advanced generics, consider providing manual schema definitions

4. **Missing request body schema**: 
   - Ensure parameters decorated with `@Body` have proper type annotations
   - Use classes instead of interfaces for request/response types when possible
   - Make sure all properties in your DTOs have type annotations

5. **Swagger UI not displaying**: 
   - Verify the `/swagger` endpoint is accessible
   - Check if the generated OpenAPI spec is valid
   - Make sure you have not overridden the Swagger UI routes

6. **Type inference failures**:
   - Circular dependencies between types can cause issues
   - Using imported types from external modules may not work correctly 
   - Namespace conflicts can occur with global type names

### Debug Tips

- **Inspect the generated spec**: Check the generated `api-doc/openapi.json` file to see the actual OpenAPI spec
- **Enable TypeScript tracing**: Use TypeScript's `--traceResolution` flag to debug metadata reflection issues
- **Debug the registration process**: Set breakpoints in the `registerControllers` function to debug route registration
- **Validate OpenAPI spec**: Use online validators like [Swagger Editor](https://editor.swagger.io/) to validate your generated spec
- **Logging middleware**: Add Express middleware to log incoming requests and how they're being handled
- **Metadata inspection**: Add debug code to inspect the collected metadata:
  ```typescript
  console.log(JSON.stringify(MetadataStorage.getInstance().getMetadata(), null, 2));
  ```

### Known Limitations

1. **Generic Type Support**:
   The library has limited support for complex generic types like `Array<Record<string, User>>`.

2. **Circular References**:
   Types with circular references may cause issues in schema generation.

3. **Union Types**:
   TypeScript union types (`string | number`) are not fully supported in the schema generation.

4. **Third-party Types**:
   Types from third-party libraries might not be correctly inferred.

## Release History

### Version 1.0.1 (Current)
- Fixed issues with path normalization
- Improved documentation
- Added proper support for null values in schemas

### Version 1.0.0
- Initial public release
- Core decorator functionality
- OpenAPI 3.0.0 specification generation
- Express integration
- Swagger UI integration

## Contributing

We welcome contributions to the openapi-express-ts library! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines.

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AsifAhmadDar/openapi-express-ts.git
   cd openapi-express-ts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### Submitting Changes

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.
