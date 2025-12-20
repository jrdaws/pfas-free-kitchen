# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Version and upgrade commands (`framework version`, `framework upgrade`)

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

[Unreleased]: https://github.com/jrdaws/framework/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jrdaws/framework/releases/tag/v0.1.0
