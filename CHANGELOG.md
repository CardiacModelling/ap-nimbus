# Changelog

Notable changes to AP-Nimbus in each version.

This repository is the umbrella for three submodules, which are versioned and
released together.

- [`app-manager`](app-manager/CHANGELOG.md)
- [`appredict-docker`](appredict-docker/CHANGELOG.md)
- [`client-direct`](client-direct/CHANGELOG.md)

## [2.1.0] - 2026-08-17

Highlights across the stack:

- `appredict-docker` stays at Chaste `2024.1` and ApPredict `v2024.1`.
- `client-direct` gains **opt-in LDAP authentication**.
- `app-manager` no longer passes undefined arguments through to ApPredict.
- All images are now multiarch for `linux/amd64` and `linux/arm64`.

### Changed

- Submodules advanced to 2.1.0: `app-manager`, `appredict-docker` and
  `client-direct`.
- Documentation version bumped to 2.1.0.

## [2.0.0] - 2024-09-10

Highlights across the stack:

- `appredict-docker` base images upgraded from Debian buster to bullseye.
- `appredict-docker` advanced to Chaste `2024.1` and ApPredict `v2024.1`.
- `app-manager` advanced to Node 20.
- `client-direct` upgraded to Python 3.8–3.12.

### Changed

- Submodules advanced to 2.0.0: `app-manager`, `appredict-docker` and
  `client-direct`.
- Updated the license and the Read the Docs revision.

## [1.0.0] - 2023-07-24

First coordinated release of the three submodules. `app-manager`,
`appredict-docker` and `client-direct` each moved into their own repository,
leaving this as the umbrella repository and the home of documentation.

### Added

- Read the Docs v2 build configuration.
- Documentation covering how to update ApPredict, how to work with the git
  submodules, Django migrations, assigning the Django superuser, and building
  `client-direct` from a modified Dockerfile.

### Changed

- Consistent naming of Docker entities throughout the documentation.

## Earlier milestones

These tags mark states that predate the current three-repository layout:

- `app-manager-0.0.13` (2022-07-07) — last state of `app-manager` before it moved
  to its own repository, where it continues at `0.0.14`.
- `last_client_direct_prototype` (2022-04-06) — final prototype client, before
  the current Django implementation.
- `last_python2` (2020-07-23) — last ApPredict images built against Python 2.

[2.1.0]: https://github.com/CardiacModelling/ap-nimbus/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/CardiacModelling/ap-nimbus/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/CardiacModelling/ap-nimbus/releases/tag/v1.0.0
