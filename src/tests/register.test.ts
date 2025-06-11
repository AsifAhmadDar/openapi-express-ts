import express, { Express } from 'express';
import { Controller, Get, Post } from '../decorators';
import { registerControllers } from '../register';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import request from 'supertest';
import { resetMetadataStorage } from './test-helper';
import { OpenAPIOptions } from '../openapi';

jest.mock('swagger-ui-express', () => ({
    serve: [
        (req: any, res: any, next: any) => next()
    ],
    setup: jest.fn(() => (req: any, res: any) => res.json({ swagger: 'ui' }))
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
}));

describe('Controller Registration', () => {
    let app: Express;
    const openApiDoc:OpenAPIOptions = {
        title:'Test',
        description:'desc',
        version: '1.0.0',
        servers:[]
    }
    beforeEach(() => {
        app = express();
        resetMetadataStorage();
        (fs.existsSync as jest.Mock).mockReset();
        (fs.mkdirSync as jest.Mock).mockReset();
        (fs.writeFileSync as jest.Mock).mockReset();
    });

    it('should register controller routes', async () => {
        @Controller('/items')
        class TestController {
            @Get('/')
            getItems() {
                return { items: ['item1', 'item2'] };
            }

            @Post('/')
            createItem() {
                return { status: 'created' };
            }
        }

        registerControllers(app, [TestController], openApiDoc);

        await request(app)
            .get('/items')
            .expect(200)
            .expect({ items: ['item1', 'item2'] });

        await request(app)
            .post('/items')
            .expect(200)
            .expect({ status: 'created' });
    });

    it('should create api-doc folder and OpenAPI json file', async () => {
        @Controller('/test')
        class TestController {
            @Get('/')
            test() {
                return { message: 'test' };
            }
        }

        (fs.existsSync as jest.Mock).mockReturnValue(false);
        registerControllers(app, [TestController], openApiDoc);

        expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('api-doc'));
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('openapi.json'),
            expect.stringContaining('"openapi":')
        );
        expect(Array.isArray(swaggerUi.serve)).toBe(true);
        expect(swaggerUi.setup).toHaveBeenCalled();
    });

    it('should handle async controller methods', async () => {
        @Controller('/async')
        class AsyncController {
            @Get('/')
            async getData() {
                return Promise.resolve({ data: 'async' });
            }
        }

        registerControllers(app, [AsyncController], openApiDoc);

        await request(app)
            .get('/async')
            .expect(200)
            .expect({ data: 'async' });
    });

    it('should handle error responses', async () => {
        @Controller('/error')
        class ErrorController {
            @Get('/')
            throwError() {
                throw new Error('Test error');
            }
        }

        registerControllers(app, [ErrorController], openApiDoc);

        await request(app)
            .get('/error')
            .expect(500);
    });
});