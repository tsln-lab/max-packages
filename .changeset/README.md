# Changesets

Every change that should ship runs `pnpm changeset` and commits the file it writes here. On
`main`, the release workflow turns pending changesets into a "Version Packages" pull request;
merging that PR bumps versions, updates changelogs and publishes to npm.
