# Deploy Loxion Mart on Render

The repository includes a Render Blueprint that creates the frontend, API, and PostgreSQL database together.

## Deploy

1. Push this project to the `main` branch of the GitHub repository.
2. Sign in to Render and choose **New > Blueprint**.
3. Connect the `IvysonGoaliath/loxionmart` repository.
4. Render detects `render.yaml`. Enter a new, unique admin password when prompted.
5. Select **Apply** and wait for all three resources to finish deploying.
6. Open the `loxionmart-web` address shown by Render.

The API automatically runs database migrations and the idempotent seed script before it starts. The seed creates the admin account and the two initial featured businesses.

Use at least 12 characters for the new admin password and do not reuse the password from the old Railway handoff.

## Verify

- Open `https://<loxionmart-api-host>/api/health` and confirm a JSON response with `"status":"ok"`.
- Open the `loxionmart-web` address, register a client, and test browsing and booking.
- Sign in with `admin@loxionmart.co.za` and the password entered during Blueprint setup.

## Optional integrations

The site works without Ozow and Twilio. Add their credentials later in the `loxionmart-api` environment settings. Keep `OZOW_IS_TEST=true` until payment testing is complete.

## Security

Do not reuse the credentials from the earlier project handoff. The Blueprint generates a fresh JWT secret and requires a new admin password.
