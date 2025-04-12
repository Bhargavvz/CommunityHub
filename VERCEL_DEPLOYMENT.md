# Vercel Deployment Guide

This guide explains how to deploy both the frontend and backend components of your application on Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional for local development)
- Git repository with your project

## Project Structure Setup

For Vercel to handle both frontend and backend, we need to restructure slightly:

1. Create a `vercel.json` file in the project root
2. Move backend API routes to `/api` directory for serverless functions

## Step 1: Create Vercel Configuration

Create a `vercel.json` file in the root of your project:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Step 2: Prepare Backend for Serverless

1. Create an `/api` directory in your project root
2. Move your backend endpoints to serverless functions in this directory

Example of a serverless function in `/api/hello.js`:

```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from API!' });
}
```

## Step 3: Update Environment Variables

1. Log in to your Vercel dashboard
2. Go to your project settings
3. Add all required environment variables from your `.env` file

## Step 4: Deploy to Vercel

### Option 1: Deploy via Git Integration (Recommended)

1. Push your project to GitHub, GitLab, or Bitbucket
2. Log in to your Vercel dashboard
3. Click "New Project"
4. Import your repository
5. Configure project settings
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd your-project
vercel

# For production deployment
vercel --prod
```

## Monitoring and Logs

Once deployed:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Deployments" to see deployment history
4. Click on a deployment to view logs and details

## Custom Domain Setup

1. Go to your Vercel project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to verify ownership and configure DNS

## CI/CD Integration

Vercel automatically deploys when you push to your connected repository. For advanced CI/CD:

1. Use GitHub Actions or similar CI tools
2. Integrate with Vercel's API for custom deployment workflows

## Limitations and Considerations

- Vercel serverless functions have time limits (typically 10 seconds for hobby plan)
- Be mindful of cold starts for infrequently accessed functions
- Consider Vercel's pricing tiers for production applications with high traffic

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) 