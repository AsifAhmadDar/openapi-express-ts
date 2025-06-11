/**
 * HTTP methods supported by the library's route decorators
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

/**
 * Metadata configuration for route handlers in controllers
 */
export interface RouteMetadata {
  /**
   * URL path for the route relative to the controller's base path
   */
  path: string;

  /**
   * HTTP method for this route
   */
  method: HttpMethod;

  /**
   * Name of the controller method that handles this route
   */
  handlerName: string;

  /**
   * Detailed description of what the route does, used in OpenAPI docs
   */
  description?: string;

  /**
   * Brief summary of the route's purpose, used in OpenAPI docs
   */
  summary?: string;

  /**
   * OpenAPI tags for grouping related endpoints
   */
  tags?: string[];

  /**
   * Route parameters (path, query, body) metadata
   */
  parameters?: ParameterMetadata[];

  /**
   * Response metadata for different status codes
   */
  responses?: ResponseMetadata;
}

/**
 * Metadata configuration for controller classes
 */
export interface ControllerMetadata {
  /**
   * Base URL path for all routes in this controller
   */
  path: string;

  /**
   * Description of what the controller handles
   */
  description?: string;

  /**
   * OpenAPI tags applied to all routes in this controller
   */
  tags?: string[];
}

/**
 * Metadata configuration for route parameters
 */
export interface ParameterMetadata {
  /**
   * Name of the parameter
   */
  name: string;

  /**
   * Where the parameter appears in the request
   */
  in: 'query' | 'path' | 'body' | 'header';

  /**
   * Whether the parameter is required
   */
  required?: boolean;

  /**
   * Data type of the parameter
   */
  type: string;

  /**
   * Description of what the parameter is for
   */
  description?: string;

  /**
   * JSON Schema definition for complex parameter types
   */
  schema?: any;
}

/**
 * Metadata configuration for route responses
 */
export interface ResponseMetadata {
  /**
   * Response configurations keyed by HTTP status code
   */
  [statusCode: string]: {
    /**
     * Description of this response status
     */
    description: string;

    /**
     * Response content type and schema definitions
     */
    content?: {
      /**
       * Response content configurations keyed by media type
       */
      [mediaType: string]: {
        /**
         * JSON Schema definition for the response body
         */
        schema: any;
      };
    };
  };
}

/**
 * Internal metadata storage structure
 */
export interface OpenAPIMetadata {
  /**
   * Map of controller classes to their metadata
   */
  controllers: Map<Function, ControllerMetadata>;

  /**
   * Map of controller classes to their route metadata
   */
  routes: Map<Function, RouteMetadata[]>;
}

/**
 * Base schema for OpenAPI schema objects
 */
export interface BaseSchemaObject {
  type: string;
  format?: string;
  description?: string;
  nullable?: boolean;
  default?: any;
  example?: any;
}

/**
 * OpenAPI string schema
 */
export interface StringSchemaObject extends BaseSchemaObject {
  type: 'string';
  format?: 'byte' | 'binary' | 'date' | 'date-time' | 'password' | 'email' | string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * OpenAPI number schema
 */
export interface NumberSchemaObject extends BaseSchemaObject {
  type: 'number' | 'integer';
  format?: 'float' | 'double' | 'int32' | 'int64' | string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
}

/**
 * OpenAPI boolean schema
 */
export interface BooleanSchemaObject extends BaseSchemaObject {
  type: 'boolean';
}

/**
 * OpenAPI array schema
 */
export interface ArraySchemaObject extends BaseSchemaObject {
  type: 'array';
  items: SchemaObject;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

/**
 * OpenAPI object schema
 */
export interface ObjectSchemaObject extends BaseSchemaObject {
  type: 'object';
  properties?: Record<string, SchemaObject>;
  required?: string[];
  additionalProperties?: boolean | SchemaObject;
  minProperties?: number;
  maxProperties?: number;
}

/**
 * Union of all schema types
 */
export type SchemaObject = 
  | StringSchemaObject 
  | NumberSchemaObject 
  | BooleanSchemaObject 
  | ArraySchemaObject 
  | ObjectSchemaObject 
  | Record<string, any>; // For flexibility