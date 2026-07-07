# Environment Profiles

Environment profiles live in `utils/envProfiles.ts`.

The selected profile controls the default UI and API base URLs:

```bash
TEST_ENV=local npm test
TEST_ENV=qa npm test
TEST_ENV=staging npm test
```

The current profiles point to the public ExpandTesting Notes App because this is a learning repo.
In a company repo, these profiles would usually point to separate dev, QA, staging, and production
environments.

You can still override the URLs directly:

```bash
BASE_URL=https://example.test/app API_BASE_URL=https://example.test/api npm test
```

Priority order:

```text
BASE_URL and API_BASE_URL overrides
TEST_ENV profile defaults
local profile fallback
```
