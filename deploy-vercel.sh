#!/bin/bash

echo "🚀 Preparing for Vercel Deployment..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "❌ Git not initialized. Run 'git init' first."
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 Found changes to commit..."
  
  git add .
  
  echo ""
  echo "Enter commit message (or press Enter for default):"
  read commit_message
  
  if [ -z "$commit_message" ]; then
    commit_message="Update app for Vercel deployment"
  fi
  
  git commit -m "$commit_message"
  echo "✅ Changes committed"
else
  echo "✅ No changes to commit"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps for Vercel Deployment:"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New Project'"
echo "3. Import repository: NF1997-X/Ht"
echo "4. Add Environment Variable:"
echo "   Name: DATABASE_URL"
echo "   Value: postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-misty-haze-ahu4jh8e-pooler.c-3.us-east-1.aws.neon.tech/neondb"
echo "5. Click 'Deploy'"
echo ""
echo "🎉 Your app will be live in 1-2 minutes!"
echo ""
