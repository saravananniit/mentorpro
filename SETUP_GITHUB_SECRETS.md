# Setup Guide for GitHub Secrets & Deployment

## Step 1: Secure Your API Key

The hardcoded API key in `.env.local` has been cleared. Never commit API keys to version control!

## Step 2: Add GitHub Secret

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Create a secret with:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key (from https://ai.google.dev/)

## Step 3: Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Gemini API key to `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Step 4: Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build your project when you push to `main` or `master`
- Deploy to GitHub Pages at: https://saravananniit.github.io/mentorpro/

No additional steps needed! Just push your code.

## Important Notes

⚠️ `.env.local` is in `.gitignore` - it won't be committed
✅ `.env.example` shows required variables for others
✅ GitHub Actions uses `VITE_GEMINI_API_KEY` secret for builds
✅ API key is never exposed in client-side code (Vite handles it safely)

## Verify Deployment

After pushing to GitHub:
1. Go to **Actions** tab in your repository
2. Wait for the "Deploy to GitHub Pages" workflow to complete
3. Visit https://saravananniit.github.io/mentorpro/
