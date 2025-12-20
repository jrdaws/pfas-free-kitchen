# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-12-20

### Added
- **Plugin System**: Comprehensive plugin architecture with stable contracts
  - Plugin loader and registry management (`.dd/plugins.json`)
  - 14 hook points across export, build, deploy, test, doctor, and config lifecycles
  - CLI commands: `framework plugin add|remove|list|hooks|info`
  - Plugin validation with strict interface enforcement
  - Hook execution engine with context passing
  - Integrated hooks into export command (pre:export, pre:export:clone, post:export:clone, post:export)
  - Complete plugin API documentation (`docs/PLUGIN_API.md`)
  - Example plugin demonstrating all features
  - 17 new plugin tests (160 total tests passing)
- **Version Management**:
  - `framework version` - Show current framework version
  - `framework upgrade` - Check for updates from npm registry
  - `framework upgrade --dry-run` - Preview upgrade changes
  - Breaking change detection for major version upgrades
  - Automatic rollback instructions
- **Release Infrastructure**:
  - CHANGELOG.md following Keep a Changelog format
  - Changelog generation from conventional commits (`npm run changelog:generate`)
  - npm publish preparation with prepublishOnly guards
  - .npmignore for optimized package size (81.3 kB)

### Changed
- Test suite expanded from 143 to 160 tests
- Package size optimized (87.7 kB → 81.3 kB)

## [0.1.0] - 2025-12-19

### Added
- Initial release of dawson-does-framework
- Template system with SaaS, SEO Directory, and Docs Site templates
- Capability system for modular feature enablement
- Provider system for LLM, Auth, Billing, and Webhooks
- CLI commands: start, capabilities, phrases, toggle, doctor, drift, export
- GitHub integration capability
- Stripe, Paddle, and Lemon Squeezy billing providers
- Anthropic LLM provider
- Supabase auth provider
- Standard webhooks provider
- Framework health checking and drift detection
- Demo mode for quick testing
- Comprehensive test suite (143 tests)

### Fixed
- Export command remote resolution and dry-run behavior

[Unreleased]: https://github.com/jrdaws/framework/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/jrdaws/framework/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jrdaws/framework/releases/tag/v0.1.0
