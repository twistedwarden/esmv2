#!/bin/bash

# SSC Assignment Fix - Railway Deployment Script
# This script deploys the fix and runs the backfill script on Railway

set -e  # Exit on error

echo "======================================"
echo "SSC Assignment Fix - Railway Deployment"
echo "======================================"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm i -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check if git changes are present
if [[ -n $(git status -s) ]]; then
    echo "📝 Git changes detected. Committing..."
    
    git add microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php
    git add microservices/scholarship_service/fix_ssc_assignments.php
    git add fix-ssc-assignments.sql
    git add SSC_ASSIGNMENT_*.md
    git add deploy-ssc-fix-railway.sh
    
    git commit -m "Fix: SSC member assignments for all roles

- Fixed createSSCAssignment() to check for specific role assignments
- Corrected budget_department to budget_dept to match enum
- Added backfill script for existing users
- Added deployment documentation"
    
    echo "✅ Changes committed"
else
    echo "ℹ️  No uncommitted changes found"
fi

echo ""
echo "🚀 Pushing to repository..."
git push origin main
echo "✅ Code pushed successfully"

echo ""
echo "⏳ Waiting 10 seconds for Railway to deploy..."
sleep 10

echo ""
echo "🔧 Running fix script on Railway..."
echo "This will create missing SSC member assignments..."
echo ""

# Run the fix script
railway run php microservices/scholarship_service/fix_ssc_assignments.php

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Verify assignments in database"
echo "2. Test creating a new SSC user"
echo "3. Check SSC workflow functionality"
echo ""
echo "Verification SQL:"
echo "  SELECT review_stage, COUNT(*) FROM ssc_member_assignments WHERE is_active=1 GROUP BY review_stage;"
echo ""
echo "Expected: 4 stages with at least 1 user each"
echo "  - document_verification"
echo "  - financial_review"
echo "  - academic_review"
echo "  - final_approval"
echo ""

