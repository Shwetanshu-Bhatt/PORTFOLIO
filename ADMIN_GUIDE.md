# Admin Panel Guide

## Overview
Your portfolio now includes a built-in admin panel for managing all content without touching code.

## Accessing the Admin Panel

1. Navigate to `/admin/login` on your website
2. Enter the admin password (set via `ADMIN_PASSWORD` environment variable)
3. Default password if not set: `admin123`

## Setting the Admin Password on Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - Name: `ADMIN_PASSWORD`
   - Value: Your chosen password
5. Redeploy your project

## Managing Content

The admin panel has 5 sections:

### 1. Projects
- Add/edit/remove projects
- Fields: Title, Description, Technologies, Link, Stats
- Set link to `#` for "Coming Soon" projects

### 2. Skills
- Organize skills by category
- Choose color theme for each category
- Add/remove individual skills

### 3. Experience
- Add work experience entries
- Multiple description points (one per line)
- Add highlight badges

### 4. Education
- Add educational background
- Types: Degree, Diploma, or School
- Shows different colors based on type

### 5. Personal
- Update name, title, subtitle
- Change description
- Update social links and email

## How Changes Work

Since this is hosted on Vercel (serverless), the workflow is:

1. **Edit content** in the admin panel
2. **Click "Save to Browser"** to persist changes in your browser's localStorage
3. **Click "Export JSON"** to download the updated data
4. **Update the JSON files** in your repository:
   - `src/data/projects.json`
   - `src/data/skills.json`
   - `src/data/experience.json`
   - `src/data/education.json`
   - `src/data/personal.json`
5. **Commit and push** to GitHub - Vercel will automatically redeploy

## Data Structure

All data is stored in JSON files in `src/data/`:

```
src/data/
├── projects.json    # Project listings
├── skills.json      # Skill categories
├── experience.json  # Work experience
├── education.json   # Education history
├── personal.json    # Personal info & social links
└── index.ts         # TypeScript types & exports
```

## Tips

- Use "Save to Browser" frequently while editing to prevent losing work
- The export button downloads a combined JSON file with all data
- Changes in localStorage are per-browser (won't sync across devices)
- For permanent changes, you must update the JSON files in your repo

## Security Notes

- Always set a strong `ADMIN_PASSWORD` environment variable
- The admin session lasts 24 hours
- Logout when done using the admin panel
- Don't commit the actual password to your repository
