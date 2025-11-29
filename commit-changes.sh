#!/bin/bash
cd /workspaces/Ht
git add api-script.js index.html style.css
git commit -m "Update share modal UI - show all pages with social sharing buttons"
git push origin main
echo "✅ Changes committed and pushed successfully!"
