import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { MetadataStorage } from '../metadata';
import { OpenAPIMetadata } from '../types';

export function cleanupApiDocs() {
    const apiDocPath = path.join(process.cwd(), 'api-doc');
    if (fs.existsSync(apiDocPath)) {
        fs.rmSync(apiDocPath, { recursive: true, force: true });
    }
}

export function resetMetadataStorage() {
    (MetadataStorage as any).instance = null;
    const instance = MetadataStorage.getInstance();
    (instance as any).metadata = {
        controllers: new Map(),
        routes: new Map()
    };
}

export function getOpenApiContent(): any {
    const apiDocPath = path.join(process.cwd(), 'api-doc');
    const openApiJsonPath = path.join(apiDocPath, 'openapi.json');
    if (fs.existsSync(openApiJsonPath)) {
        return JSON.parse(fs.readFileSync(openApiJsonPath, 'utf-8'));
    }
    return null;
}

export async function expectSuccessfulResponse(app: Express, path: string, expectedBody: any) {
    const request = require('supertest');
    const response = await request(app).get(path);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedBody);
}

export async function expectErrorResponse(app: Express, path: string, expectedStatus: number) {
    const request = require('supertest');
    const response = await request(app).get(path);
    expect(response.status).toBe(expectedStatus);
}