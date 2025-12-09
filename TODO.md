# DexTrends TODO

## Next Session - Priority Tasks

### 1. Set Up OAuth Providers (Authentication)
Run the profiles migration first, then configure OAuth:

**Step 1: Run Supabase Migration**
- Go to Supabase SQL Editor
- Run contents of `supabase/migrations/20241210_user_profiles.sql`

**Step 2: Set Up Google OAuth**
- Go to https://console.cloud.google.com/
- Create OAuth Client ID (Web application)
- Redirect URI: `https://ptvpxfrfkkzisihufitz.supabase.co/auth/v1/callback`
- Add Client ID & Secret to Supabase → Authentication → Providers → Google

**Step 3: Set Up GitHub OAuth**
- Go to https://github.com/settings/developers
- Create New OAuth App
- Callback URL: `https://ptvpxfrfkkzisihufitz.supabase.co/auth/v1/callback`
- Add Client ID & Secret to Supabase → Authentication → Providers → GitHub

**Step 4: Set Up Discord OAuth** (optional)
- Go to https://discord.com/developers/applications
- Create New Application → OAuth2
- Redirect: `https://ptvpxfrfkkzisihufitz.supabase.co/auth/v1/callback`
- Add Client ID & Secret to Supabase → Authentication → Providers → Discord

### 2. Set Up Price History Tracking
- Create price_history table migration
- Set up scheduled job to capture daily prices
- Add price history charts to card detail pages

## Completed Recently
- [x] Showdown sync added to GitHub Actions (weekly)
- [x] Fixed mobile navbar safe area issues
- [x] Enabled AuthProvider for user login
- [x] Created profiles table migration
- [x] Created /profile page
