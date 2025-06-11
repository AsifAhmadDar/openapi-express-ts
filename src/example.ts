import express from 'express';
import { Controller, Get, Post } from './decorators';
import { generateOpenAPISpec } from './openapi';
import { registerControllers } from './register';

interface User {
    id: number;
    name: string;
    email: string;
}

interface CreateUserDto {
    name: string;
    email: string;
}

@Controller('/users', {
    description: 'User management endpoints',
    tags: ['Users']
})
class UserController {
    @Get('/', {
        summary: 'List all users',
        description: 'Returns a list of all users in the system'
    })
    getAllUsers(): User[] {
        return [];
    }

    @Get('/:id', {
        summary: 'Get user by ID',
        description: 'Returns a single user by their ID'
    })
    getUserById(): User {
        return {} as User;
    }

    @Post('/', {
        summary: 'Create new user',
        description: 'Creates a new user in the system'
    })
    createUser(data: CreateUserDto): User {
        return {} as User;
    }
}

const app = express();


const apiDoc = generateOpenAPISpec({
    title: 'User Management API',
    version: '1.0.0',
    description: 'API for managing users in the system',
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        }
    ]
});

registerControllers(app, [UserController], apiDoc);

app.get('/api-docs', (req, res) => {
    res.json(apiDoc);
});