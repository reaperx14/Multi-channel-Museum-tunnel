#!/bin/bash
# Chronos Tunnel Git Deployment Helper
# Run this script after agreeing to the Xcode license using: sudo xcodebuild -license

echo "🚀 Initializing local Git repository..."
git init

echo "📦 Staging files..."
git add .

echo "💾 Committing files..."
git commit -m "Initial commit: Completed Chronos 3D/2D Immersive Tunnel Experience"

echo "🌿 Setting main branch..."
git branch -M main

echo "🔗 Adding remote origin..."
# Remove old origin if it exists
git remote remove origin 2>/dev/null
git remote add origin https://github.com/billi2345677/time-travel-tunnel-natural-history-museum.git

echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Project successfully pushed to GitHub."
