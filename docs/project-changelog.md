# Project Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Inbound Logistics API implementation.
- Outbound Logistics API implementation.
- Server-side reporting engine.

## [1.0.0] - 2026-02-01

### Added
- **Materials Management**: Full CRUD, search, filtering, and master data integration.
- **Material Requests**: Request creation and approval workflow.
- **User Management**: Users, Roles, Permissions (RBAC) with normalized database schema.
- **Documentation**: Comprehensive documentation suite including PDR, Architecture, and Guides.
- **UI Prototypes**: Inbound, Outbound, Stock Take, and Dashboard (Mock data).

### Changed
- **Database Schema**: Refactored `User`, `Role`, and `Material` tables to use Foreign Key relations instead of loose string columns.
- **Permissions**: Migrated from JSON-based permissions to normalized `RoleFeatureAction` many-to-many relationship.
- **Project Structure**: Established `src/app` router structure with distinct feature modules.

### Fixed
- N/A (Initial release versioning).
