import { Request, Response, Router, Express } from 'express';
import 'reflect-metadata';
import { generateOpenAPISpec, OpenAPIOptions } from './openapi';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import { MetadataStorage } from './metadata';

/**
 * Registers decorated controller classes with an Express application and sets up OpenAPI documentation
 * @param app - The Express application instance to register the controllers with
 * @param controllers - An array of controller classes decorated with @Controller
 * 
 * This function:
 * - Generates OpenAPI documentation from the controller metadata
 * - Creates a /api-doc folder with the OpenAPI JSON spec
 * - Serves Swagger UI documentation at /api-docs
 * - Registers all controller routes with the Express app
 * 
 * @example
 * ```typescript
 * const app = express();
 * 
 * @Controller('/users')
 * class UserController {
 *   @Get('/')
 *   getUsers() {
 *     return [];
 *   }
 * }
 * 
 * registerControllers(app, [UserController]);
 * ```
 */
export function registerControllers(app: Express, controllers: any[], openApiDoc: OpenAPIOptions) {
    const apiDocPath = path.join(process.cwd(), 'api-doc');
    if (!fs.existsSync(apiDocPath)) {
        fs.mkdirSync(apiDocPath);
    }

    const apiDoc = generateOpenAPISpec({
        title: openApiDoc.title || 'API Documentation',
        version: openApiDoc.version || '1.0.0',
        description: openApiDoc.description || 'Auto-generated API documentation',
        servers: openApiDoc.servers || [],
        base : openApiDoc.base || ''
    });

    const openApiJsonPath = path.join(apiDocPath, 'openapi.json');
    fs.writeFileSync(openApiJsonPath, JSON.stringify(apiDoc, null, 2));

    app.use('/swagger', swaggerUi.serve);
    app.use('/swagger', swaggerUi.setup(apiDoc));

    controllers.forEach((ControllerClass) => {        
        const controllerInstance = new ControllerClass();
        const routes = MetadataStorage.getInstance().getMetadata().routes.get(ControllerClass) || [];
        const controllerMetadata = MetadataStorage.getInstance().getMetadata().controllers.get(ControllerClass);
        const base = openApiDoc.base || '';
        let basePath = controllerMetadata?.path || '';

        const router = Router();
        routes.forEach((route) => {
            const routePath = (route.path === '' ? '/' : route.path);
            
            router[route.method](routePath, async (req: Request, res: Response) => {
                try {
                    const result = await Promise.resolve(controllerInstance[route.handlerName](req, res));
                    if (result !== undefined) {
                        res.send(result);
                    }
                } catch (err) {
                    const error = err as Error;
                    res.status(500).send(error.message || 'Internal Server Error');
                }
            });
        });        
        const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
        const finalBasePath = `${base}${normalizedBasePath}`.replace(/\/+/g, '/');

        app.use(finalBasePath, router);
    });
}
