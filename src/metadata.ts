import { ControllerMetadata, RouteMetadata, OpenAPIMetadata } from './types';

/**
 * Singleton class that stores metadata about controllers and their routes
 * Used internally by the library to generate OpenAPI documentation
 */
export class MetadataStorage {
  private static instance: MetadataStorage;
  private metadata: OpenAPIMetadata = {
    controllers: new Map(),
    routes: new Map(),
  };

  private constructor() {}

  /**
   * Gets the singleton instance of MetadataStorage
   * Creates a new instance if one doesn't exist
   */
  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  /**
   * Adds controller metadata to the storage
   * @param target - The controller class
   * @param metadata - The controller's metadata
   */
  addControllerMetadata(target: Function, metadata: ControllerMetadata): void {
    this.metadata.controllers.set(target, metadata);
  }

  /**
   * Adds route metadata to the storage
   * @param target - The controller class containing the route
   * @param metadata - The route's metadata
   */
  addRouteMetadata(target: Function, metadata: RouteMetadata): void {
    const routes = this.metadata.routes.get(target) || [];
    routes.push(metadata);
    this.metadata.routes.set(target, routes);
  }

  /**
   * Gets all stored metadata about controllers and routes
   * @returns The complete metadata object
   */
  getMetadata(): OpenAPIMetadata {
    return this.metadata;
  }
}