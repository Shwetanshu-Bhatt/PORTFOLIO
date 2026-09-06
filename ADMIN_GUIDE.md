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

The admin panel has 6 sections:

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

1. **Edit content** in the admin panel.
2. **Upload a project image**, if needed. The image is uploaded immediately, but is not published until you save the content changes.
3. **Click "Save changes"**. This stores the complete portfolio content in the database and makes it available to the live homepage.
4. **Open "View live portfolio"** to verify the published result.
5. Use **"Export backup"** when you want a downloadable JSON copy for version control or recovery.

The first deployment must apply the portfolio content migration with `npm run db:migrate` after adding the `DATABASE_URL` environment variable. The migration script includes this table automatically.

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

- The admin panel shows an "Unsaved changes" warning while you edit
- If the database is temporarily unavailable, the live site falls back to the checked-in JSON content
- Export backups regularly if you want a local copy of your content

## Security Notes

- Always set a strong `ADMIN_PASSWORD` environment variable
- The admin session lasts 24 hours
- Logout when done using the admin panel
- Don't commit the actual password to your repository
