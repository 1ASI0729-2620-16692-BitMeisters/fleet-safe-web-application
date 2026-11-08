# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-10-26

### Added
- The footer links the Terms of Use and the Privacy Policy published with the landing page, in English and Spanish.

## [0.2.9] - 2026-10-09

### Fixed
- The selected language persists across reloads and direct links, and the first visit follows the browser language.
- The incidents paginator, the page titles, the repair status and the incident dates follow the selected language.

## [0.2.8] - 2026-10-08

### Changed
- The deployment workflow redeploys the mock api on Render after publishing the web application.
- The readme is titled after the web application.

## [0.2.7] - 2026-10-08

### Fixed
- Fleet Management loads the vehicle assignments: the mock api serves them under `/vehicle-assignments`, the path the fleet api requests.
- The incident form keeps its primary action visible, and the sidebar highlights the active section and the button states consistently.

## [0.2.6] - 2026-10-08

### Fixed
- The inspection result selector stacks its icons over the labels on narrow cards, so Compliant, Observed and Failed fit on a phone.

## [0.2.5] - 2026-10-08

### Fixed
- On small screens the sidebar closes behind a menu button in the top bar, so the driver flow is usable on a phone.
- Incident Management shows the origin, severity and status labels instead of `[object Object]`, and translates its error messages.

## [0.2.4] - 2026-10-08

### Fixed
- The mock api rewrites `/api/v1/*` to its collections, so reading and updating a resource by id works and answering an inspection item is saved.

## [0.2.3] - 2026-10-08

### Fixed
- Every sidebar label is visible over the brand color, not only the active one.
- The sidebar shows the released version instead of a fixed `v1.0.0`.
- Incident Management loads its incidents and incident types from the mock api.
- Vehicle Documentation reaches the shared mock api through the reference endpoints, assemblers and store, so it works in the deployed application.

## [0.2.2] - 2026-10-08

### Fixed
- Translations load again: the translation loader no longer goes through the http interceptors, which caused a circular dependency (NG0200).

## [0.2.1] - 2026-10-08

### Added
- Deployment of the web application to GitHub Pages on every push to `main`.
- Mock api deployed on Render at `https://fleetsafe-api.onrender.com/api/v1`, used by the production environment.

## [0.2.0] - 2026-10-07

### Added
- **Pre-operational Inspection**: the driver sees the assigned vehicle, starts an inspection with the odometer reading and answers the SUTRAN checklist grouped by vehicle system.
- **Incident Management**: incident registration and follow-up, with corrective actions, repair scheduling and completion, and resolution.
- **Fleet Management**: companies, fleets, vehicles, drivers and vehicle assignments.
- **Vehicle Documentation**: vehicle documents with registration, update and expiration tracking.
- **Shared**: sidebar, top bar and footer with the FleetSafe brand identity, Angular Material theme and toast notifications.

### Changed
- **Shared kernel** aligned with the learning center reference: `BaseEntity`, `BaseResource`, `BaseAssembler`, `BaseApiEndpoint` and `ErrorHandlingEnabledBaseType` handle the api errors.
- Translations kept in a single dictionary per language (`en-US`, `es-419`) loaded through `@ngx-translate/http-loader`.
- Entities identified by `string` ids.
- Mock api served by json-server from `server/db.json`.

## [0.1.0] - 2026-10-06

### Added
- Angular application with Angular Material and ngx-translate (`en-US`, `es-419`).
- Shared layout with sidebar, language switcher and footer.
- Environments per stage and the json-server mock api.

[0.3.0]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.9...v0.3.0
[0.2.9]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/1ASI0729-2620-16692-BitMeisters/fleet-safe-web-application/releases/tag/v0.1.0
