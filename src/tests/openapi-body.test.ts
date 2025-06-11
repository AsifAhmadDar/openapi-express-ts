import { Controller, Post, Body } from '../decorators';
import { generateOpenAPISpec } from '../openapi';
import { MetadataStorage } from '../metadata';
import { resetMetadataStorage } from './test-helper';

describe('OpenAPI generation with body parameters', () => {
  beforeEach(() => {
    resetMetadataStorage();
  });

  it('should correctly generate requestBody in OpenAPI spec', () => {
    // Define a test interface
    interface TestDto {
      name: string;
      age: number;
    }

    // Define a test controller with a method that uses @Body
    @Controller('/test')
    class TestController {
      @Post('/item')
      createItem(@Body({ description: 'Test body' }) body: TestDto) {
        return { id: 1, ...body };
      }
    }

    // Generate the OpenAPI spec
    const spec = generateOpenAPISpec({
      title: 'Test API',
      version: '1.0.0'
    });

    // Verify the requestBody is correctly set
    const path = '/test/item';
    const postOperation = spec.paths[path].post;

    expect(postOperation).toBeDefined();
    expect(postOperation.requestBody).toBeDefined();
    expect(postOperation.requestBody.description).toBe('Test body');
    expect(postOperation.requestBody.required).toBe(true);
    expect(postOperation.requestBody.content['application/json']).toBeDefined();
    expect(postOperation.requestBody.content['application/json'].schema).toBeDefined();
    
    // Make sure the parameter is not also in the parameters array
    if (postOperation.parameters) {
      const bodyParams = postOperation.parameters.filter((p: any) => p.in === 'body');
      expect(bodyParams.length).toBe(0);
    }
  });
});
