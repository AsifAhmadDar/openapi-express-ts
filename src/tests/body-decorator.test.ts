import { Controller, Post, Put, Patch, Body } from '../decorators';
import { MetadataStorage } from '../metadata';
import { resetMetadataStorage } from './test-helper';

describe('@Body decorator', () => {
  beforeEach(() => {
    resetMetadataStorage();
  });

  it('should register body parameter metadata with POST', () => {
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

    // Get the metadata
    const metadata = MetadataStorage.getInstance().getMetadata();
    const routes = metadata.routes.get(TestController) || [];
    
    // Verify route metadata
    expect(routes.length).toBe(1);
    
    const route = routes[0];
    expect(route.method).toBe('post');
    expect(route.path).toBe('/item');
    
    // Verify body parameter metadata
    expect(route.parameters).toBeDefined();
    expect(route.parameters!.length).toBe(1);
    
    const param = route.parameters![0];
    expect(param.name).toBe('body');
    expect(param.in).toBe('body');
    expect(param.description).toBe('Test body');
    expect(param.required).toBe(true);
    expect(param.schema).toBeDefined();
  });

  it('should set required to false when specified', () => {
    @Controller('/test')
    class TestController {
      @Post('/item')
      createItem(@Body({ required: false }) body: object) {
        return { success: true };
      }
    }

    const metadata = MetadataStorage.getInstance().getMetadata();
    const routes = metadata.routes.get(TestController) || [];
    const param = routes[0].parameters![0];
    
    expect(param.required).toBe(false);
  });

  it('should work with route method options', () => {
    @Controller('/test')
    class TestController {
      @Post('/item', { summary: 'Create item', description: 'Creates a new item' })
      createItem(@Body() body: object) {
        return { success: true };
      }
    }

    const metadata = MetadataStorage.getInstance().getMetadata();
    const routes = metadata.routes.get(TestController) || [];
    const route = routes[0];
    
    expect(route.summary).toBe('Create item');
    expect(route.description).toBe('Creates a new item');
    expect(route.parameters!.length).toBe(1);
    expect(route.parameters![0].name).toBe('body');
  });

  it('should work with PUT method', () => {
    interface UpdateDto {
      name?: string;
      active?: boolean;
    }
    
    @Controller('/test')
    class TestController {
      @Put('/item/:id')
      updateItem(@Body({ description: 'Update data' }) body: UpdateDto) {
        return { updated: true };
      }
    }

    const metadata = MetadataStorage.getInstance().getMetadata();
    const routes = metadata.routes.get(TestController) || [];
    
    expect(routes.length).toBe(1);
    
    const route = routes[0];
    expect(route.method).toBe('put');
    expect(route.path).toBe('/item/:id');
    
    expect(route.parameters).toBeDefined();
    expect(route.parameters!.length).toBe(1);
    
    const param = route.parameters![0];
    expect(param.name).toBe('body');
    expect(param.in).toBe('body');
    expect(param.description).toBe('Update data');
  });

  it('should work with PATCH method', () => {
    interface PatchDto {
      active: boolean;
    }
    
    @Controller('/test')
    class TestController {
      @Patch('/item/:id/status')
      patchItemStatus(@Body({ description: 'Status update' }) body: PatchDto) {
        return { patched: true };
      }
    }

    const metadata = MetadataStorage.getInstance().getMetadata();
    const routes = metadata.routes.get(TestController) || [];
    
    expect(routes.length).toBe(1);
    
    const route = routes[0];
    expect(route.method).toBe('patch');
    expect(route.path).toBe('/item/:id/status');
    
    expect(route.parameters).toBeDefined();
    expect(route.parameters!.length).toBe(1);
    
    const param = route.parameters![0];
    expect(param.name).toBe('body');
    expect(param.in).toBe('body');
    expect(param.description).toBe('Status update');
  });
});
