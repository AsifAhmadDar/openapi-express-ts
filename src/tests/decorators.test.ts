import { Controller, Get, Post } from '../decorators';
import { MetadataStorage } from '../metadata';
import { resetMetadataStorage } from './test-helper';

describe('Decorators', () => {
    beforeEach(() => {
        resetMetadataStorage();
    });

    describe('@Controller', () => {
        it('should register controller metadata', () => {
            @Controller('/users', { description: 'User endpoints' })
            class TestController {}

            const metadata = MetadataStorage.getInstance().getMetadata();
            const controllerMeta = metadata.controllers.get(TestController);

            expect(controllerMeta).toBeDefined();
            expect(controllerMeta?.path).toBe('/users');
            expect(controllerMeta?.description).toBe('User endpoints');
        });
    });

    describe('@Get and @Post', () => {
        it('should register route metadata', () => {
            @Controller('/test')
            class TestController {
                @Get('/items', { summary: 'Get items' })
                getItems() {}

                @Post('/items', { description: 'Create item' })
                createItem() {}
            }

            const metadata = MetadataStorage.getInstance().getMetadata();
            const routes = metadata.routes.get(TestController) || [];

            expect(routes.length).toBe(2);
            expect(routes[0].method).toBe('get');
            expect(routes[0].path).toBe('/items');
            expect(routes[0].summary).toBe('Get items');
            expect(routes[1].method).toBe('post');
            expect(routes[1].description).toBe('Create item');
        });
    });
});