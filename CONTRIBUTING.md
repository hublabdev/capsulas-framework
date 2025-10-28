# Contributing to Capsulas

Thank you for your interest in contributing to Capsulas! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/hublabdev/capsulas-framework/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Feature Requests](https://github.com/hublabdev/capsulas-framework/issues?q=label%3Aenhancement)
2. Create a new issue with:
   - Clear use case
   - Proposed solution
   - Alternative solutions considered
   - Mockups or examples if applicable

### Creating Capsules

One of the best ways to contribute is by creating new capsules!

1. Follow the [Creating Capsules Guide](./docs/creating-capsules.md)
2. Ensure your capsule:
   - Has clear documentation
   - Includes tests
   - Follows naming conventions
   - Has proper type definitions
3. Submit a PR to add it to the official capsules package

### Submitting Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests if applicable
5. Run tests: `npm test`
6. Run linter: `npm run lint`
7. Commit with clear messages: `git commit -m "Add: feature description"`
8. Push to your fork: `git push origin feature/my-feature`
9. Create a Pull Request

### PR Guidelines

- **Title**: Clear and descriptive (e.g., "Add: OAuth capsule for Microsoft")
- **Description**: Explain what, why, and how
- **Tests**: Include tests for new features
- **Documentation**: Update relevant docs
- **Code Style**: Follow existing patterns
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/capsulas-framework.git
cd capsulas-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start dev server
npm run dev
```

## Project Structure

```
capsulas-framework/
├── packages/
│   ├── core/         # Core types and engine
│   ├── cli/          # Command-line interface
│   ├── web/          # Visual editor
│   └── capsules/     # Official capsules
├── docs/             # Documentation
├── examples/         # Example projects
└── .github/          # GitHub workflows
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Add JSDoc comments for public APIs
- Export types alongside implementations

### Naming Conventions

- **Files**: kebab-case (`my-capsule.ts`)
- **Classes**: PascalCase (`MyCapsule`)
- **Functions**: camelCase (`executeCapsule`)
- **Constants**: UPPER_SNAKE_CASE (`PORT_TYPES`)

### Testing

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Test edge cases and error conditions

### Documentation

- Update README.md for major changes
- Add JSDoc comments for public APIs
- Include examples in docs
- Update CHANGELOG.md

## Release Process

Releases are managed by maintainers. If you want to suggest a release:

1. Open an issue describing what should be included
2. Maintainers will:
   - Update version in package.json
   - Update CHANGELOG.md
   - Create and push git tag
   - Create GitHub release with notes

## Getting Help

- 💬 Discord (coming soon)
- 📧 Email: info@hublab.dev
- 🐛 [GitHub Issues](https://github.com/hublabdev/capsulas-framework/issues)
- 📖 [Documentation](./docs/README.md)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on our website (with permission)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Capsulas! 🎉
