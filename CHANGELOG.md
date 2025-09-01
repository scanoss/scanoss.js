# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.20.0] (2025-08-29)
### Added
- Added vulnerability scanner to SDK with HTTP client support
- Implemented `vulnerabilitiesComponentes` method for batch vulnerability scanning of multiple components
- Implemented `vulnerabilitiesComponent` method for single component vulnerability assessment
### Changed
- switched cryptography scanner over to use cryptography http client


## [0.19.0] (2025-08-29)
### Changed
- Removed `api` prefix from dependency and vulnerability API URLs
### Fixed
- Fixed license field mapping for dependency responses (spdx_id, is_spdx_approved)  

## [0.18.0] (2025-08-28)
### Added 
- Added REST protocol implementation for SCANOSS dependency service
- Added proxy options to `dep` subcommand
### Fixed
- Improved URL path handling for free vs premium SCANOSS endpoints

## [0.17.3] (2025-06-27)
### Fixed
- Empty winnowing.wfp file now created when scanning empty directories or filtered content

## [0.17.2] (2025-06-25)
### Fixed
-  Fixed dependency scan response concatenation

## [0.17.1] (2025-06-16)
### Changed
- Implemented chunked processing for dependency requests

## [0.17.0] (2025-06-10)
### Fixed
- Fixed ca-certs on gRPC protocol
### Changed
- Improved validation on scanner config

## [0.16.5] (2025-05-28)
### Fixed
- Fixed ca-certs on grpc dependency service

## [0.16.5] (2025-05-28)
### Fixed
- Fixed ca-certs on grpc dependency service

## [0.16.3] (2025-04-30)
### Fixed
- Corrected slash encoding in npm parser for package identifiers
- Fixed cryptographic scanning freezes when processing empty input files

## [0.16.2] (2025-04-25)
### Added
- Added filtering for binary and large files(>2GB) on local cryptography scanning
- Support for new crypto algorithms rules definitions
### Fixed
- Fixed scanoss.json settings file injection

## [0.16.1] (2025-04-24)
### Added
- Added local cryptography library scanning

### 0.1.2 (2021-12-28)
### 0.2.2 (2021-12-30)
### [0.2.4](https://github.com/scanoss/scanoss.js/compare/v0.2.2...v0.2.4) (2022-01-05)
### [0.2.6](https://github.com/scanoss/scanoss.js/compare/v0.2.4...v0.2.6) (2022-01-06)
### [0.2.8](https://github.com/scanoss/scanoss.js/compare/v0.2.6...v0.2.8) (2022-01-10)
### [0.2.10](https://github.com/scanoss/scanoss.js/compare/v0.2.8...v0.2.10) (2022-01-11)
### [0.2.14](https://github.com/scanoss/scanoss.js/compare/v0.2.10...v0.2.14) (2022-02-09)
### [0.2.16](https://github.com/scanoss/scanoss.js/compare/v0.2.14...v0.2.16) (2022-02-14)
### [0.2.18](https://github.com/scanoss/scanoss.js/compare/v0.2.16...v0.2.18) (2022-02-23)
### [0.3.0](https://github.com/scanoss/scanoss.js/compare/v0.2.18...v0.3.0) (2022-07-02)
### [0.4.0-alpha.0](https://github.com/scanoss/scanoss.js/compare/v0.3.0...v0.4.0-alpha.0) (2022-08-19)
### [0.4.0-beta](https://github.com/scanoss/scanoss.js/compare/v0.4.0-alpha.0...v0.4.0-beta) (2022-08-31)
### [0.4.0](https://github.com/scanoss/scanoss.js/compare/v0.4.0-beta...v0.4.0) (2022-09-30)
### [0.7.8](https://github.com/scanoss/scanoss.js/compare/v0.4.0...v0.7.8) (2023-01-25)
### [0.8.0](https://github.com/scanoss/scanoss.js/compare/v0.7.8...v0.8.0) (2023-02-20)
### [0.8.5](https://github.com/scanoss/scanoss.js/compare/v0.8.0...v0.8.5) (2023-03-17)
### [0.8.6](https://github.com/scanoss/scanoss.js/compare/v0.8.5...v0.8.6) (2023-03-28)
### [0.8.7](https://github.com/scanoss/scanoss.js/compare/v0.8.6...v0.8.7) (2023-04-12)
### [0.8.8](https://github.com/scanoss/scanoss.js/compare/v0.8.7...v0.8.8) (2023-04-16)
### [0.9.0](https://github.com/scanoss/scanoss.js/compare/v0.8.7...v0.9.0) (2023-04-19)
### [0.9.1](https://github.com/scanoss/scanoss.js/compare/v0.9.0...v0.9.1) (2023-05-18)
### [0.9.2](https://github.com/scanoss/scanoss.js/compare/v0.9.1...v0.9.2) (2023-10-09)
### [0.9.3](https://github.com/scanoss/scanoss.js/compare/v0.9.2...v0.9.3) (2023-10-20)
### [0.10.0](https://github.com/scanoss/scanoss.js/compare/v0.9.2...v0.10.0) (2023-11-22)
### [0.10.1](https://github.com/scanoss/scanoss.js/compare/v0.10.0...v0.10.1) (2023-11-22)
### [0.10.2](https://github.com/scanoss/scanoss.js/compare/v0.10.1...v0.10.2) (2023-12-19)
### [0.10.3](https://github.com/scanoss/scanoss.js/compare/v0.10.2...v0.10.3) (2023-12-22)
### [0.10.4](https://github.com/scanoss/scanoss.js/compare/v0.10.3...v0.10.4) (2023-12-28)
### [0.10.5](https://github.com/scanoss/scanoss.js/compare/v0.10.4...v0.10.5) (2023-12-29)
### [0.11.0](https://github.com/scanoss/scanoss.js/compare/v0.10.5...v0.11.0) (2024-01-04)
### [0.11.1](https://github.com/scanoss/scanoss.js/compare/v0.11.0...v0.11.1) (2024-01-09)
### [0.11.2](https://github.com/scanoss/scanoss.js/compare/v0.11.1...v0.11.2) (2024-01-09)
### [0.11.3](https://github.com/scanoss/scanoss.js/compare/v0.11.2...v0.11.3) (2024-01-09)
### [0.11.4](https://github.com/scanoss/scanoss.js/compare/v0.11.3...v0.11.4) (2024-04-02)
### [0.11.5](https://github.com/scanoss/scanoss.js/compare/v0.11.4...v0.11.5) (2024-04-19)
### [0.12.0](https://github.com/scanoss/scanoss.js/compare/v0.11.5...v0.12.0) (2024-05-06)
### [0.12.2](https://github.com/scanoss/scanoss.js/compare/v0.12.0...v0.12.2) (2024-05-10)
### [0.13.0](https://github.com/scanoss/scanoss.js/compare/v0.12.2...v0.13.0) (2024-05-13)
### [0.13.1](https://github.com/scanoss/scanoss.js/compare/v0.13.0...v0.13.1) (2024-05-15)
### [0.13.2](https://github.com/scanoss/scanoss.js/compare/v0.13.1...v0.13.2) (2024-05-20)
### [0.14.0](https://github.com/scanoss/scanoss.js/compare/v0.13.2...v0.14.0) (2024-05-23)
### [0.14.1](https://github.com/scanoss/scanoss.js/compare/v0.14.0...v0.14.1) (2024-06-05)
### [0.15.0](https://github.com/scanoss/scanoss.js/compare/v0.14.1...v0.15.0) (2024-07-28)
### [0.15.1](https://github.com/scanoss/scanoss.js/compare/v0.15.0...v0.15.1) (2024-08-27)
### [0.15.2](https://github.com/scanoss/scanoss.js/compare/v0.15.1...v0.15.2) (2024-08-29)
### [0.15.3](https://github.com/scanoss/scanoss.js/compare/v0.15.2...v0.15.3) (2024-11-24)
### [0.15.4](https://github.com/scanoss/scanoss.js/compare/v0.15.3...v0.15.4) (2024-11-27)
### [0.15.5](https://github.com/scanoss/scanoss.js/compare/v0.15.4...v0.15.5) (2024-12-30)
### [0.15.6](https://github.com/scanoss/scanoss.js/compare/v0.15.5...v0.15.6) (2025-01-08)
### [0.15.7](https://github.com/scanoss/scanoss.js/compare/v0.15.6...v0.15.7) (2025-03-05)
### [0.16.1](https://github.com/scanoss/scanoss.js/compare/v0.15.7...v0.16.1) (2025-04-24)
### [0.16.2](https://github.com/scanoss/scanoss.js/compare/v0.16.1...v0.16.2) (2025-04-25)
### [0.16.3](https://github.com/scanoss/scanoss.js/compare/v0.16.2...v0.16.3) (2025-04-30)
### [0.16.5](https://github.com/scanoss/scanoss.js/compare/v0.16.3...v0.16.5) (2025-05-28)
### [0.17.0](https://github.com/scanoss/scanoss.js/compare/v0.16.5...v0.17.0) (2025-06-10)
### [0.17.1](https://github.com/scanoss/scanoss.js/compare/v0.17.0...v0.17.1) (2025-06-16)
### [0.17.2](https://github.com/scanoss/scanoss.js/compare/v0.17.1...v0.17.2) (2025-06-25)
### [0.17.3](https://github.com/scanoss/scanoss.js/compare/v0.17.2...v0.17.3) (2025-06-27)
### [0.18.0](https://github.com/scanoss/scanoss.js/compare/v0.17.3...v0.18.0) (2025-08-28)
### [0.19.0](https://github.com/scanoss/scanoss.js/compare/v0.18.0...v0.19.0) (2025-08-29)
