# Contributing to @norysight/discord-image

Thank you for your interest in contributing to this project! We use automated semantic versioning, so please follow these guidelines when making commits.

## Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Your commit messages should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

The following types are used to determine the semantic version bump:

- `feat`: A new feature (triggers a MINOR version bump)
- `fix`: A bug fix (triggers a PATCH version bump)
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `build`: Changes to the build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

### Breaking Changes

To indicate a breaking change (which will trigger a MAJOR version bump), add `BREAKING CHANGE:` in the commit message footer or append a `!` after the type/scope:

```
feat(api)!: send an email to users when a product is shipped

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

## Examples

```
feat(auth): add login with Google option
fix(api): handle null response from user service
docs: update installation instructions
style: format code according to new style guide
refactor(modules): restructure folder organization
perf(images): optimize image processing
test: add tests for user authentication
build(deps): update dependency versions
```

## Pull Requests

When creating pull requests, please ensure:

1. Your code passes all tests
2. You've added tests for new features
3. Your commit messages follow the conventional commits format
4. You've updated documentation if necessary

This project uses semantic-release for automated versioning and publishing. Proper commit messages ensure correct version bumps and automated changelog generation. 