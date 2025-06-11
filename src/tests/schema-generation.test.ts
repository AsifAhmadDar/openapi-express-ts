import { Controller, Post, Get, Body } from '../decorators';
import { MetadataStorage } from '../metadata';
import { resetMetadataStorage } from './test-helper';
import { generateOpenAPISpec } from '../openapi';

describe('TypeScript types to OpenAPI schema conversion', () => {
  beforeEach(() => {
    resetMetadataStorage();
  });

  it('should generate schema for simple return types', () => {
    // Define a test interface
    interface User {
      id: number;
      name: string;
      isActive: boolean;
      roles: string[];
    }

    @Controller('/test')
    class TestController {
      @Get('/users')
      getUsers(): User[] {
        return [];
      }
    }

    // Generate the OpenAPI spec
    const spec = generateOpenAPISpec({
      title: 'Test API',
      version: '1.0.0'
    });

    // Verify the schema in the responses section
    const getUsersPath = spec.paths['/test/users'];
    expect(getUsersPath).toBeDefined();
    expect(getUsersPath.get).toBeDefined();
    expect(getUsersPath.get.responses['200']).toBeDefined();
    expect(getUsersPath.get.responses['200'].content['application/json']).toBeDefined();
    
    const schema = getUsersPath.get.responses['200'].content['application/json'].schema;
    expect(schema).toBeDefined();
    expect(schema.type).toBe('array');
  });

  it('should generate schema for request body types', () => {
    // Define a test interface
    interface CreateUserDto {
      name: string;
      email: string;
      age: number;
    }

    @Controller('/users')
    class TestController {
      @Post('/')
      createUser(@Body() dto: CreateUserDto) {
        return { id: 1, ...dto };
      }
    }

    // Generate the OpenAPI spec
    const spec = generateOpenAPISpec({
      title: 'Test API',
      version: '1.0.0'
    });

    // Verify the requestBody schema
    const path = spec.paths['/users'];
    expect(path).toBeDefined();
    expect(path.post).toBeDefined();
    expect(path.post.requestBody).toBeDefined();
    expect(path.post.requestBody.content['application/json']).toBeDefined();
    
    const schema = path.post.requestBody.content['application/json'].schema;
    expect(schema).toBeDefined();
    expect(schema.type).toBe('object');
  });
  it('should use return type for response schema', () => {
    // Define a test interface
    interface Item {
      id: number;
      name: string;
    }

    @Controller('/test')
    class TestController {
      @Get('/items')
      getItems(): Item[] {
        return [];
      }
    }

    // Generate the OpenAPI spec
    const spec = generateOpenAPISpec({
      title: 'Test API',
      version: '1.0.0'
    });

    // Verify the response based on return type
    const path = spec.paths['/test/items'];
    expect(path).toBeDefined();
    expect(path.get).toBeDefined();
    expect(path.get.responses['200']).toBeDefined();
    expect(path.get.responses['200'].description).toBe('Successful response');
    expect(path.get.responses['200'].content['application/json']).toBeDefined();
    
    const schema = path.get.responses['200'].content['application/json'].schema;
    expect(schema).toBeDefined();
    expect(schema.type).toBe('array');
  });
});
