import { MetadataStorage } from './metadata';

/**
 * Configuration options for generating OpenAPI documentation
 */
export interface OpenAPIOptions {
  /**
   * The title of the API to display in the documentation
   */
  title: string;

  /**
   * The version of the API being documented
   */
  version: string;

  /**
   * Optional description of the API's purpose and features
   */
  description?: string;

  /**
   * Optional base prefix for controllers like `/api` 
   */
  base?: string;

  /**
   * Optional array of server configurations where the API is deployed
   */
  servers?: { 
    /**
     * The URL where the API is hosted
     */
    url: string;
    
    /**
     * Optional description of this server (e.g., "Production", "Staging")
     */
    description?: string;
  }[];
}

/**
 * Generates an OpenAPI 3.0.0 specification from controller metadata
 * @param options - Configuration options for the OpenAPI documentation
 * @returns The complete OpenAPI specification object
 * 
 * @example
 * ```typescript
 * const apiDoc = generateOpenAPISpec({
 *   title: 'User Management API',
 *   version: '1.0.0',
 *   description: 'API for managing users',
 *   servers: [
 *     { url: 'https://api.example.com', description: 'Production' }
 *   ]
 * });
 * ```
 */
export function generateOpenAPISpec(options: OpenAPIOptions) {
  const metadata = MetadataStorage.getInstance().getMetadata();
  
  const spec: any = {
    openapi: '3.0.0',
    info: {
      title: options.title,
      version: options.version,
      description: options.description
    },
    servers: options.servers || [{ url: '/' }],
    paths: {},
    components: {
      schemas: {}
    }
  };
  metadata.controllers.forEach((controllerMetadata, controller) => {
    const basePath = controllerMetadata.path.startsWith('/') ? controllerMetadata.path : `/${controllerMetadata.path}`;
    const routes = metadata.routes.get(controller) || [];
    const basePrefix = options.base || '';

    routes.forEach(route => {
      const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`;
      const fullPath = `${basePrefix}${basePath}${routePath === '/' ? '' : routePath}`.replace(/\/+/g, '/');
      
      if (!spec.paths[fullPath]) {
        spec.paths[fullPath] = {};
      }      
      // Create the route specification
      const routeSpec: any = {
        summary: route.summary,
        description: route.description,
        tags: [...(controllerMetadata.tags || []), ...(route.tags || [])],
        responses: route.responses || {
          '200': {
            description: 'Successful response'
          }
        }
      };

      // Process parameters - separate body parameters from other parameters (query, path, etc.)
      if (route.parameters && route.parameters.length > 0) {
        const bodyParams = route.parameters.filter(param => param.in === 'body');
        const otherParams = route.parameters.filter(param => param.in !== 'body');
        
        // Add non-body parameters to the parameters array
        if (otherParams.length > 0) {
          routeSpec.parameters = otherParams;
        }
        
        // Add body parameter as requestBody (OpenAPI 3.0.0 format)
        if (bodyParams.length > 0) {
          const bodyParam = bodyParams[0]; // Use the first body parameter if multiple are defined
          routeSpec.requestBody = {
            description: bodyParam.description || 'Request body',
            required: bodyParam.required !== false,
            content: {
              'application/json': {
                schema: bodyParam.schema || { type: 'object' }
              }
            }
          };
        }
      }

      spec.paths[fullPath][route.method] = routeSpec;
    });
  });

  return spec;
}