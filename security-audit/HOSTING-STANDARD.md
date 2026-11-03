# Hosting standard checks

Use these checks for a target that runs on a shared Linux server. Read the deployment files, the configuration, and the code. Do not connect to a live host. If a fact exists only on the host, report it as needing validation.

## Service accounts

- Each service runs under its own account. The account has no login shell and no sudo rights.
- The account can write only to its own folders.
- No service account belongs to the `docker` group.
- Each person has a personal account. No account is shared.

## Network

- Services listen on `127.0.0.1`, unless a public listener is necessary and documented.
- Database ports listen only on localhost or a private network.
- The server does not serve plain HTTP. Port 80 redirects to HTTPS or does not answer.
- HTTPS responses send `Strict-Transport-Security`.
- TLS allows only TLS 1.2 and TLS 1.3.

## Reverse proxy and gateway

- The proxy removes any internal header that a client sends.
- Each app accepts trusted headers only from the proxy.
- The app listens on localhost only, so clients cannot reach it directly.

## Writes and cross-site requests

- State-changing endpoints accept JSON only, or they verify a CSRF token.
- Endpoints refuse writes from other origins. Verify the CORS rules and the cookie `SameSite` setting.

## Database

- The runtime role does not own the database. It has no superuser rights and no `CREATE` right.
- The migration credentials are in their own file. Only the migration reads that file.
- Passwords in connection URLs are percent-encoded. Verify that the parser accepts the encoded form.
- The connection pool sets a connect timeout and a size limit.

## Release and extraction

- Verify the archive before extraction. Refuse links, special files, absolute paths, and `..` segments.
- Measure the real unpacked size before extraction. Do not trust the archive metadata.
- The release excludes `.env` files, `.git`, tests, and development dependencies.
- Verify a signature or checksum before the release runs.

## Process manager

- Process configuration files contain no plain-text secrets.
- A failed start fails the deploy. The health check must not pass on the old process.

## Rollback

- A rollback does not install a release older than the newest verified release, unless an operator approves it.
- Keep a record of the active release.
