# Contributing to openapi-express-ts

Thank you for considering contributing to openapi-express-ts! This project aims to make building Express.js APIs with OpenAPI documentation easier and more maintainable through TypeScript decorators.

This document provides guidelines and steps for contributing. Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project.

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check [existing issues](https://github.com/AsifAhmadDar/openapi-express-ts/issues) as you might find that the issue has already been reported. When creating a bug report, please include as much detail as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide a specific example** to demonstrate the steps
- **Include relevant environment details** like Node.js version, TypeScript version, etc.
- **Explain what behavior you expected and why**
- **Include sample code or failing tests** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/AsifAhmadDar/openapi-express-ts/issues). When suggesting an enhancement:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include code samples if applicable**
- **List any other projects with similar features** if relevant

### Pull Requests

- **Fill in the required PR template**
- **Do not include issue numbers in the PR title**
- **Follow the TypeScript coding style**
- **Include tests for new features**
- **Document new code using JSDoc comments**
- **Update documentation if needed**
- **End all files with a newline**

## Development Setup

To set up the project for local development:

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run the tests:
   ```bash
   npm test
   ```

### Project Structure

```
src/
├── decorators.ts       # Core decorators (Controller, Get, Post, etc.)
├── metadata.ts         # Metadata storage and handling
├── openapi.ts          # OpenAPI spec generation
├── register.ts         # Express integration
├── types.ts            # Type definitions
└── tests/              # Test files
```

## Coding Guidelines

### TypeScript Style Guide

- Use TypeScript's strict mode
- Use interfaces for object types
- Properly document public APIs using JSDoc comments
- Use meaningful variable and function names
- Follow single responsibility principle

### Testing

- Write tests for new features and bug fixes
- Make sure all tests pass before submitting a PR
- Test coverage should be maintained or improved

Test your changes with:

```bash
npm test
```

Check test coverage with:

```bash
npm run test:coverage
```

## Git Commit Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests in the commit message
- Consider using conventional commits format:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that don't affect the meaning of the code
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `test`: Adding missing or correcting existing tests
  - `chore`: Changes to the build process or auxiliary tools

## Documentation

- Update the README.md with details of changes to the interface
- Update the API documentation if the public API changes
- Maintain the JSDoc comments in the code

## Release Process

1. Update version number in package.json according to [Semantic Versioning](https://semver.org/)
2. Update the CHANGELOG.md with the new version's changes
3. Commit the changes
4. Tag the commit with the version number
5. Create a GitHub release

## Getting Help

If you need help with anything, feel free to:
- Open an issue with your question
- Contact the maintainers via email (available in the package.json)

## Acknowledgments

Thank you to all the contributors who have helped make this project better!
