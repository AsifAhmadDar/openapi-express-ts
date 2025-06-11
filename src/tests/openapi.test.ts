import { Controller, Get, Post } from '../decorators';
import { generateOpenAPISpec } from '../openapi';
import { resetMetadataStorage } from './test-helper';

describe('OpenAPI Specification Generation', () => {
    beforeEach(() => {
        resetMetadataStorage();
    });

    it('should generate basic OpenAPI structure', () => {
        const spec = generateOpenAPISpec({
            title: 'Test API',
            version: '1.0.0',
            description: 'Test Description'
        });

        expect(spec.openapi).toBe('3.0.0');
        expect(spec.info.title).toBe('Test API');
        expect(spec.info.version).toBe('1.0.0');
        expect(spec.info.description).toBe('Test Description');
    });

    it('should generate path specifications from controllers', () => {
        @Controller('/users')
        class UserController {
            @Get('/', { summary: 'List users' })
            getUsers() {}

            @Post('/', { 
                summary: 'Create user',
                description: 'Creates a new user'
            })
            createUser(dto: { name: string; email: string }) {
                return { id: 1, ...dto };
            }
        }

        const spec = generateOpenAPISpec({
            title: 'Test API',
            version: '1.0.0'
        });

        expect(spec.paths['/users']).toBeDefined();
        expect(spec.paths['/users'].get).toBeDefined();
        expect(spec.paths['/users'].get.summary).toBe('List users');        
        expect(spec.paths['/users'].post).toBeDefined();
        expect(spec.paths['/users'].post.summary).toBe('Create user');
        expect(spec.paths['/users'].post.requestBody).toBeDefined();
    });

    it('should handle multiple controllers', () => {
        @Controller('/users')
        class UserController {
            @Get('/')
            getUsers() {}
        }

        @Controller('/posts')
        class PostController {
            @Get('/')
            getPosts() {}
        }

        const spec = generateOpenAPISpec({
            title: 'Test API',
            version: '1.0.0'
        });

        expect(spec.paths['/users']).toBeDefined();
        expect(spec.paths['/posts']).toBeDefined();
    });

    it('should include server configurations', () => {
        const servers = [
            { url: 'http://api.example.com', description: 'Production' },
            { url: 'http://staging.example.com', description: 'Staging' }
        ];

        const spec = generateOpenAPISpec({
            title: 'Test API',
            version: '1.0.0',
            servers
        });

        expect(spec.servers).toEqual(servers);
    });
});