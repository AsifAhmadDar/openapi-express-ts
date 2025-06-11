import 'reflect-metadata';
import { MetadataStorage } from './metadata';
import { 
  ControllerMetadata, 
  RouteMetadata, 
  HttpMethod, 
  ParameterMetadata,
  SchemaObject,
  StringSchemaObject,
  NumberSchemaObject,
  BooleanSchemaObject,
  ArraySchemaObject,
  ObjectSchemaObject
} from './types';

const DESIGN_TYPE_METADATA_KEY = 'design:type';
const DESIGN_PARAMTYPES_METADATA_KEY = 'design:paramtypes';
const DESIGN_RETURNTYPE_METADATA_KEY = 'design:returntype';
const PARAMETERS_METADATA_KEY = 'custom:parameters';
const PROPERTY_TYPES_METADATA_KEY = 'design:properties';

/**
 * Marks a class as an Express controller with a base path for all routes within it
 * @param path - The base URL path for all routes in this controller
 * @param options - Additional controller configuration options
 * @param options.description - Description of what the controller handles
 * @param options.tags - OpenAPI tags to categorize the controller's endpoints
 * @returns A class decorator function
 */
export function Controller(path: string, options: Partial<ControllerMetadata> = {}) {
    return function (target: Function) {
        const controllerPath = path.startsWith('/') ? path : `/${path}`;
        MetadataStorage.getInstance().addControllerMetadata(target, {
            path: controllerPath,
            ...options
        });
    };
}

// Cache for storing already processed types to avoid redundant work
const schemaCache = new Map<any, SchemaObject>();

function isArrayType(type: any): boolean {
    return type === Array || 
           (type && type.name === 'Array') || 
           (type && type.toString && type.toString().includes('Array'));
}

/**
 * Generates an OpenAPI schema for any TypeScript type
 * Optimized for performance with caching and efficient recursion
 */
function getTypeSchema(type: any): SchemaObject {
    // Return from cache if this type was already processed
    if (schemaCache.has(type)) {
        return schemaCache.get(type)!;
    }
    
    // Create a basic schema to put in cache before recursion to prevent infinite loops
    let schema: SchemaObject = { type: 'object' };
    schemaCache.set(type, schema);
    
    // Handle undefined or null types
    if (!type) {
        return schema;
    }

    // Fast-path for primitive types
    if (type === String) {
        schema = { type: 'string' } as StringSchemaObject;
    } else if (type === Number || type === BigInt) {
        schema = { type: 'number' } as NumberSchemaObject;
    } else if (type === Boolean) {
        schema = { type: 'boolean' } as BooleanSchemaObject;
    } else if (type === Date) {
        schema = { 
            type: 'string',
            format: 'date-time'
        } as StringSchemaObject;
    } else if (type === Buffer || type === ArrayBuffer) {
        schema = {
            type: 'string',
            format: 'binary'
        } as StringSchemaObject;
    } else if (isArrayType(type)) {
        // Handle array types
        schema = processArrayType(type);
    } else if (type === Object || type === {}.constructor) {
        schema = { type: 'object' } as ObjectSchemaObject;
    } else if (typeof type === 'function') {
        // This is likely a class constructor or function
        schema = processFunctionType(type);
    } else if (typeof type === 'object') {
        // For plain object instances (not constructors)
        schema = processObjectInstance(type);
    }
    
    // Update cache with the final schema
    schemaCache.set(type, schema);
    return schema;
}

/**
 * Processes an array type to determine its item type
 */
function processArrayType(type: any): ArraySchemaObject {
    let itemType: SchemaObject = { type: 'object' };
    
    // Try to determine the array item type from the type string
    if (type && type.toString) {
        const typeStr = type.toString();
        // Try to extract the generic type parameter from Array<T>
        const genericMatch = typeStr.match(/Array<([^>]+)>/);
        if (genericMatch && genericMatch[1]) {
            const itemTypeName = genericMatch[1].trim();
            itemType = inferTypeFromName(itemTypeName);
        }
    }
    
    return { 
        type: 'array', 
        items: itemType 
    } as ArraySchemaObject;
}

/**
 * Infers a schema type from a type name
 */
function inferTypeFromName(typeName: string): SchemaObject {
    // Try to infer primitive types from the name
    if (typeName === 'string' || typeName === 'String') {
        return { type: 'string' } as StringSchemaObject;
    } else if (typeName === 'number' || typeName === 'Number') {
        return { type: 'number' } as NumberSchemaObject;
    } else if (typeName === 'boolean' || typeName === 'Boolean') {
        return { type: 'boolean' } as BooleanSchemaObject;
    } else if (typeName === 'Date') {
        return { 
            type: 'string', 
            format: 'date-time'
        } as StringSchemaObject;
    } 
    
    // For complex types, try to analyze the constructor if available
    try {
        const globalType = global[typeName as keyof typeof global];
        if (globalType && typeof globalType === 'function') {
            return getTypeSchema(globalType);
        }
    } catch (e) {
        // If we can't resolve the type, provide a default object schema
    }
    
    return { type: 'object' };
}

/**
 * Processes a function type (class constructor or function)
 */
function processFunctionType(type: any): SchemaObject {
    const properties: Record<string, SchemaObject> = {};
    const prototype = type.prototype;

    // Check if this is a class with prototype and extract properties
    if (prototype) {
        // Try multiple strategies to extract properties
        tryExtractMetadataProperties(type, properties);
        
        // If no properties found via metadata, try instantiation
        if (Object.keys(properties).length === 0) {
            tryInstantiateAndExtractProperties(type, properties);
        }
    } else {
        // No prototype - might be an interface or function
        tryExtractPropertiesFromFunction(type, properties);
    }
    
    // If we've collected properties, return them in our schema
    if (Object.keys(properties).length > 0) {
        return {
            type: 'object',
            properties
        } as ObjectSchemaObject;
    }
    
    // Fallback for any function/class where we couldn't extract properties
    return { 
        type: 'object',
        description: `Schema for type ${type.name || 'Unknown'}`
    } as ObjectSchemaObject;
}

/**
 * Tries to extract properties from metadata
 */
function tryExtractMetadataProperties(type: any, properties: Record<string, SchemaObject>): void {
    try {
        // Check for property metadata from various sources
        const propTypes = Reflect.getMetadata('design:properties', type) || {};
        
        for (const propName in propTypes) {
            if (Object.prototype.hasOwnProperty.call(propTypes, propName)) {
                properties[propName] = getTypeSchema(propTypes[propName]);
            }
        }
        
        // Also try to get metadata from the constructor
        const ctorPropTypes = Reflect.getMetadata(DESIGN_TYPE_METADATA_KEY, type) || {};
        for (const propName in ctorPropTypes) {
            if (Object.prototype.hasOwnProperty.call(ctorPropTypes, propName)) {
                properties[propName] = getTypeSchema(ctorPropTypes[propName]);
            }
        }
    } catch (e) {
        // Continue if metadata extraction fails
    }
}

/**
 * Tries to instantiate a class and extract properties from the instance
 */
function tryInstantiateAndExtractProperties(type: any, properties: Record<string, SchemaObject>): void {
    try {
        // Create an instance with empty constructor parameters
        const instance = new type();
        
        // Get property names from the instance
        const instanceProps = Object.getOwnPropertyNames(instance);
        
        // Process each property
        for (const key of instanceProps) {
            if (key !== 'constructor' && typeof key === 'string' && !key.startsWith('_')) {
                const value = instance[key];
                properties[key] = inferSchemaFromValue(value);
            }
        }
    } catch (e) {
        // If instantiation fails, try to extract from constructor source
        tryExtractPropertiesFromConstructorSource(type, properties);
    }
}

/**
 * Tries to extract properties by analyzing the constructor source code
 */
function tryExtractPropertiesFromConstructorSource(type: any, properties: Record<string, SchemaObject>): void {
    try {
        const ctorString = type.toString();
        // Match likely property definitions in the constructor
        const propMatches = ctorString.match(/this\.([a-zA-Z0-9_]+)\s*=/g);
        
        if (propMatches) {
            propMatches.forEach((match: string) => {
                // Extract property name from the match
                const propName = match.match(/this\.([a-zA-Z0-9_]+)/)?.[1];
                if (propName) {
                    // We can't determine the type from just the name, so use a generic object
                    properties[propName] = { type: 'object' } as ObjectSchemaObject;
                }
            });
        }
    } catch (e) {
        // If code analysis fails, we'll just return a generic object
    }
}

/**
 * Tries to extract properties from a function signature and name
 */
function tryExtractPropertiesFromFunction(type: any, properties: Record<string, SchemaObject>): void {
    const funcName = type.name || '';
    const funcString = type.toString();
    
    // Check if we can extract parameter names from the function
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    if (paramMatch && paramMatch[1]) {
        const params = paramMatch[1].split(',').map((p: string) => p.trim());
        params.forEach((param: string) => {
            if (param && !param.includes('=')) {
                // Add basic property entries for each parameter
                properties[param] = { type: 'object' } as ObjectSchemaObject;
            }
        });
    }
    
    // Use naming conventions to infer common types
    inferPropertiesFromTypeName(type.name || '', properties);
}

/**
 * Infers properties based on type name if possible
 * Note: This is just a placeholder function that doesn't make any assumptions about fields
 */
function inferPropertiesFromTypeName(typeName: string, properties: Record<string, SchemaObject>): void {
    // We don't infer any properties based on type name
    // as this would create non-generic assumptions about the user's data model
}

/**
 * Processes an object instance to extract schema properties
 */
function processObjectInstance(obj: any): ObjectSchemaObject {
    const properties: Record<string, SchemaObject> = {};
    
    // Get all property keys and create a schema for each
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        properties[key] = inferSchemaFromValue(value);
    }
    
    return {
        type: 'object',
        properties
    } as ObjectSchemaObject;
}

/**
 * Infers a schema from a JavaScript value
 */
function inferSchemaFromValue(value: any): SchemaObject {
    if (value === undefined || value === null) {
        return { type: 'object' } as ObjectSchemaObject;
    } else if (typeof value === 'string') {
        return { type: 'string' } as StringSchemaObject;
    } else if (typeof value === 'number') {
        return { type: 'number' } as NumberSchemaObject;
    } else if (typeof value === 'boolean') {
        return { type: 'boolean' } as BooleanSchemaObject;
    } else if (value instanceof Date) {
        return { type: 'string', format: 'date-time' } as StringSchemaObject;
    } else if (Array.isArray(value)) {
        return processArrayValue(value);
    } else if (typeof value === 'object') {
        return getTypeSchema(value.constructor);
    }
    
    return { type: 'object' } as ObjectSchemaObject;
}

/**
 * Processes an array value to determine its item type
 */
function processArrayValue(arr: any[]): ArraySchemaObject {
    let itemType: SchemaObject = { type: 'object' };
    
    if (arr.length > 0) {
        const firstItem = arr[0];
        if (firstItem !== undefined) {
            itemType = inferSchemaFromValue(firstItem);
        }
    }
    
    return { 
        type: 'array', 
        items: itemType
    } as ArraySchemaObject;
}

/**
 * Creates a parameter decorator for request body
 * @param options - Additional parameter configuration options
 * @param options.description - Description of the body parameter for OpenAPI documentation
 * @param options.required - Whether this parameter is required (defaults to true)
 * @returns A parameter decorator that registers body metadata
 */
export function Body(options: { description?: string; required?: boolean } = {}) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingParameters: ParameterMetadata[] = Reflect.getOwnMetadata(
            PARAMETERS_METADATA_KEY, 
            target.constructor, 
            propertyKey
        ) || [];

        // Get the parameter type from TypeScript's type metadata
        const paramTypes = Reflect.getMetadata(
            DESIGN_PARAMTYPES_METADATA_KEY, 
            target, 
            propertyKey
        ) || [];
        
        const paramType = paramTypes[parameterIndex];
        const schema = getTypeSchema(paramType);

        // Create the body parameter metadata - keeping 'in: body' for our internal processing
        // but the OpenAPI generator will place it in the requestBody section
        const paramMetadata: ParameterMetadata = {
            name: 'body',
            in: 'body',
            required: options.required !== false, // Default to true if not specified
            type: 'object',
            description: options.description || 'Request body',
            schema
        };

        // Store in the class metadata
        existingParameters.push(paramMetadata);
        Reflect.defineMetadata(
            PARAMETERS_METADATA_KEY, 
            existingParameters, 
            target.constructor, 
            propertyKey
        );
    };
}

function createMethodDecorator(method: HttpMethod) {
    return function (path: string = '/', options: Partial<RouteMetadata> = {}) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const paramTypes = Reflect.getMetadata(DESIGN_PARAMTYPES_METADATA_KEY, target, propertyKey) || [];
            const returnType = Reflect.getMetadata(DESIGN_RETURNTYPE_METADATA_KEY, target, propertyKey);

            // Get any parameters that were defined with decorators like @Body
            const decoratedParameters: ParameterMetadata[] = 
                Reflect.getOwnMetadata(PARAMETERS_METADATA_KEY, target.constructor, propertyKey) || [];            // Use decorated parameters if available, otherwise fall back to the old behavior
            let parameters: ParameterMetadata[] = decoratedParameters;
            const responses: any = {};            // For backwards compatibility, if no decorated parameters but we have a method that typically accepts a body
            // (POST, PUT, PATCH) with parameter types, assume the first one is the body
            if (parameters.length === 0 && 
                (method === 'post' || method === 'put' || method === 'patch') && 
                paramTypes.length > 0) {
                const bodyType = paramTypes[0];
                parameters.push({
                    name: 'body',
                    in: 'body', // This will be handled by the OpenAPI generator
                    required: true,
                    type: 'object',
                    description: 'Request body',
                    schema: getTypeSchema(bodyType)
                });
            }            // Check for pending responses set by @ApiResponse before the route decorator
            const pendingResponses = Reflect.getOwnMetadata('openapi:responses', target.constructor, propertyKey) || {};
            Object.assign(responses, pendingResponses);
              // If no explicit success response was defined and we have a return type, add one
            const hasSuccessResponse = responses['200'] || responses['201'] || 
                (method === 'post' ? responses['201'] : responses['200']);
                  if (!hasSuccessResponse && returnType) {
                let schema;
                
                // Check if the return type is an array type
                const isArrayType = returnType === Array || 
                                   (returnType && returnType.name === 'Array') ||
                                   (returnType && returnType.toString && returnType.toString().includes('Array'));
                
                if (isArrayType) {
                    // Try to determine the array item type
                    // Extract from method return type annotation if possible
                    const typeName = returnType.name || '';
                    const typeString = returnType.toString ? returnType.toString() : '';
                    
                    if (typeString.includes('Array<') || typeString.includes('[]')) {
                        // Try to extract the item type from the method implementation
                        try {
                            // Look at the return statement in the method implementation
                            const methodImpl = descriptor.value.toString();
                            const returnMatch = methodImpl.match(/return\s+([^;]+)/);
                            
                            if (returnMatch && returnMatch[1]) {
                                const returnStmt = returnMatch[1].trim();
                                // If returning an array literal or transformed array, try to infer item type
                                if (returnStmt.startsWith('[') || 
                                    returnStmt.includes('.map') ||
                                    returnStmt.includes('.filter')) {
                                    schema = {
                                        type: 'array',
                                        items: { type: 'object' }
                                    };
                                } else {
                                    // Get the schema from the parameter type if the method returns a parameter
                                    const paramIndex = returnStmt.includes('param') ? 
                                        parseInt(returnStmt.replace(/\D/g, '')) : -1;
                                    
                                    if (paramIndex >= 0 && paramIndex < paramTypes.length) {
                                        schema = {
                                            type: 'array',
                                            items: getTypeSchema(paramTypes[paramIndex])
                                        };
                                    } else {
                                        schema = {
                                            type: 'array',
                                            items: getTypeSchema({})
                                        };
                                    }
                                }
                            } else {
                                schema = {
                                    type: 'array',
                                    items: getTypeSchema({})
                                };
                            }
                        } catch (e) {
                            schema = {
                                type: 'array',
                                items: getTypeSchema({})
                            };
                        }
                    } else {
                        schema = {
                            type: 'array',
                            items: { type: 'object' }
                        };
                    }
                } else {
                    // Regular object type
                    try {
                        // If we're returning a specific parameter, use its schema
                        const methodImpl = descriptor.value.toString();
                        const returnMatch = methodImpl.match(/return\s+([^;]+)/);
                        
                        if (returnMatch && returnMatch[1]) {
                            const returnStmt = returnMatch[1].trim();
                            // If returning a parameter directly
                            if (returnStmt.includes('requestBody') || 
                                returnStmt.match(/param\d+/) ||
                                parameters.some(p => returnStmt.includes(p.name))) {
                                
                                // Use the parameter schema for the return type
                                const paramSchema = parameters.find(p => p.in === 'body')?.schema;
                                if (paramSchema) {
                                    schema = paramSchema;
                                } else {
                                    schema = getTypeSchema(returnType);
                                }
                            } else {
                                schema = getTypeSchema(returnType);
                            }
                        } else {
                            schema = getTypeSchema(returnType);
                        }
                    } catch (e) {
                        // If analysis fails, use the standard type schema
                        schema = getTypeSchema(returnType);
                    }
                }
                
                const successCode = method === 'post' ? '201' : '200';
                responses[successCode] = {
                    description: method === 'post' ? 'Created successfully' : 'Successful response',
                    content: {
                        'application/json': { schema }
                    }
                };
            }

            MetadataStorage.getInstance().addRouteMetadata(target.constructor, {
                method,
                path: path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`,
                handlerName: propertyKey,
                parameters,
                responses,
                ...options
            });
            
            return descriptor;
        };
    };
}

/**
 * Marks a method as a GET route handler
 * @param path - The URL path for this route relative to the controller's base path
 * @param RouteMetadata - Additional route configuration options
 * @returns A method decorator that registers the GET route
 */
export const Get = createMethodDecorator('get');

/**
 * Marks a method as a POST route handler
 * @param path - The URL path for this route relative to the controller's base path
 * @param RouteMetadata - Additional route configuration options
 * @returns A method decorator that registers the POST route
 */
export const Post = createMethodDecorator('post');

/**
 * Marks a method as a PUT route handler
 * @param path - The URL path for this route relative to the controller's base path
 * @param RouteMetadata - Additional route configuration options
 * @returns A method decorator that registers the PUT route
 */
export const Put = createMethodDecorator('put');

/**
 * Marks a method as a DELETE route handler
 * @param path - The URL path for this route relative to the controller's base path
 * @param RouteMetadata - Additional route configuration options
 * @returns A method decorator that registers the DELETE route
 */
export const Delete = createMethodDecorator('delete');

/**
 * Marks a method as a PATCH route handler
 * @param path - The URL path for this route relative to the controller's base path
 * @param RouteMetadata - Additional route configuration options
 * @returns A method decorator that registers the PATCH route
 */
export const Patch = createMethodDecorator('patch');
