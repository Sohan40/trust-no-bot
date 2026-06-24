# Vercel Deployment and Smoke Test

This guide prepares the Classic Mode MVP for Vercel. It does not replace the
Supabase migration or perform a production deployment automatically.

## Prerequisites

- A Vercel project connected to the `Sohan40/trust-no-bot` repository.
- A Supabase project with the migration in `supabase/migrations/` applied.
- An OpenAI API key for live Game Director dialogue.
- A deployment owner who can inspect Vercel function logs during the smoke test.

## Environment variables

Configure variables separately for Vercel Production and Preview. Use
`.env.local` for local development; it is gitignored and must never be copied
into source control.

| Variable | Visibility | Required behavior |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser-visible | Set to the canonical deployed app URL. Use `http://localhost:3000` locally. |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-visible | Required at runtime for persisted gameplay. Use the Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-visible | Set to the Supabase publishable/anon key. The current hidden-state repository path does not use it directly. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Required at runtime for persisted gameplay. Never add a `NEXT_PUBLIC_` prefix. |
| `OPENAI_API_KEY` | Server-only secret | Required for live AI dialogue. If absent or a request fails, the Game Director safely uses mocked dialogue. |
| `OPENAI_MODEL` | Server-only configuration | Optional model override. Defaults to `gpt-4.1-mini`. |

`NEXT_PUBLIC_*` values are embedded into browser code when referenced by client
modules. They must never contain privileged credentials. The Supabase service
role key bypasses Row Level Security and is restricted to `server-only` modules.

## Vercel setup

1. Import the GitHub repository into Vercel and keep the framework preset as
   Next.js.
2. Keep the repository root as the project root. The build command is
   `npm run build`; no custom output directory is needed.
3. In **Project Settings > Environment Variables**, add all six variables from
   `.env.example`. Store `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` as
   sensitive server values.
4. Apply the values to Production. Apply matching non-production credentials to
   Preview only when preview deployments should access a real backend.
5. Redeploy after changing any environment variable. `NEXT_PUBLIC_*` values are
   captured during the build that produced the deployment.
6. Open the deployment and run the complete checklist below while watching
   Vercel function logs.

The app intentionally validates Supabase values only when server gameplay code
runs. Static analysis and `next build` therefore do not require production
secrets. A missing Supabase URL or service role key produces a clear server-side
configuration error; the API returns the existing generic 500 response rather
than leaking the error to the browser.

## Production smoke checklist

Record the deployment URL, commit SHA, test time, and tester with the results.

- [ ] **Landing page:** `/` loads without a client or function error.
- [ ] **Start game:** Start Game creates a game and navigates to
      `/game/[gameId]`.
- [ ] **Refresh game:** Refreshing the dynamic game URL restores the same game,
      phase, players, and transcript through the anonymous session cookie.
- [ ] **Advance phase:** Advance Phase moves the game to the expected next
      phase and persists the change.
- [ ] **Ask question:** A question receives live OpenAI dialogue. Also inspect
      function logs. If OpenAI fails, confirm safe mocked dialogue appears and
      the deterministic game state remains usable.
- [ ] **Vote:** A valid vote persists, resolves AI votes, and advances or ends
      the game without a client error.
- [ ] **Result:** Complete a game and confirm the winner and role reveal render.
- [ ] **Hidden roles:** Before game over, inspect the GET
      `/api/game/[gameId]` response in browser developer tools. AI players must
      not include hidden `role` or `team` data. After game over, the reveal may
      include all roles.

The live OpenAI question check is mandatory before public sharing. Automated
tests use mocked providers and cannot prove the deployed key, model access, or
provider network path works.

## Safety checks

- Never paste the service role key or OpenAI key into an issue, PR, browser
  console, screenshot, client component, or `NEXT_PUBLIC_*` variable.
- Keep all hidden-state database access behind server routes and the existing
  anonymous-session ownership checks.
- Treat OpenAI output as dialogue only. The deterministic TypeScript engine
  continues to own roles, actions, votes, eliminations, and winners.
- Check Vercel function logs for configuration or provider errors. Browser
  responses intentionally hide unexpected internal error details.
- OpenAI failures must fall back to mocked dialogue; they must not block or
  corrupt persisted gameplay.
- Add the planned usage limit before sharing the deployment beyond a controlled
  smoke-test audience.

## References

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
