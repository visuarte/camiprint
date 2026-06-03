# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Dual App Router Directory Conflict
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Verify that when both `/app` and `/src/app` exist, Next.js serves content from the wrong directory
  - Test implementation details from Bug Condition in design:
    - Verify that both `/app/page.tsx` and `/src/app/page.tsx` exist
    - Verify that their content is different (template vs CAMIART)
    - Run `npm run build` and examine output to see which directory is being compiled
    - Check that build output references `/app` instead of `/src/app`
  - The test assertions should match the Expected Behavior Properties from design:
    - After fix: Next.js should serve content from `/src/app` only
    - After fix: Production should show CAMIART content, not template
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Build output shows compilation of `/app` directory
    - Directory structure shows both `/app` and `/src/app` exist
    - Content served is from template, not CAMIART
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unchanged Project Configuration and Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Run `npm run dev` and verify it starts successfully
    - Run `npm run build` and verify it completes without errors
    - Verify all files in `/src/app` exist and have their current content
    - Verify all files in `/public` exist and are accessible
    - Verify configuration files (`next.config.ts`, `package.json`, `tsconfig.json`) have their current content
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Test that `/src/app` directory and all its files remain unchanged
    - Test that `/public` directory and all its files remain unchanged
    - Test that configuration files remain unchanged
    - Test that `npm run dev` continues to work
    - Test that `npm run build` continues to complete successfully
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_


  - [x] 3.1 Create backup commit (recommended)
    - Create a Git commit before making changes to allow easy rollback if needed
    - Commit message: "chore: backup before removing /app directory"
    - _Requirements: N/A (safety measure)_

  - [x] 3.2 Eliminate the /app directory completely
    - Delete `/app/page.tsx` (template por defecto)
    - Delete `/app/layout.tsx` (layout con Geist fonts)
    - Delete `/app/globals.css` (estilos del template)
    - Delete `/app/favicon.ico` (favicon del template)
    - Delete `/app/` directory itself
    - Verify that only `/src/app` remains as the single source of truth
    - _Bug_Condition: isBugCondition(projectStructure) where directoryExists('/app') AND directoryExists('/src/app')_
    - _Expected_Behavior: Next.js SHALL detect and use /src/app as the only App Router directory_
    - _Preservation: All files in /src/app, /public, and configuration files SHALL remain completely unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Single App Router Directory
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1:
      - Verify that `/app` directory no longer exists
      - Verify that `/src/app` directory exists with all 4 files
      - Run `npm run build` and verify it compiles `/src/app` content
      - Verify build output no longer references `/app`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Unchanged Project Configuration
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2:
      - Verify all files in `/src/app` are unchanged (content comparison)
      - Verify all files in `/public` are unchanged
      - Verify configuration files are unchanged
      - Run `npm run dev` and verify it works correctly
      - Run `npm run build` and verify it completes successfully
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Verify local build serves correct content

  - [x] 4.1 Build and start production server locally
    - Run `npm run build` to create production build
    - Run `npm run start` to start production server
    - Verify server starts on port 3000 without errors
    - _Requirements: 2.1, 2.3_

  - [x] 4.2 Verify homepage content is correct
    - Access `http://localhost:3000` in browser or via HTTP request
    - Verify page returns status code 200
    - Verify page contains "Camisetas personalizadas para negocios, restaurantes y empresas"
    - Verify page contains the three quantity offers (10+, 25+, 50+ camisetas)
    - Verify page contains "Especialistas en" section
    - Verify page does NOT contain "To get started, edit the page.tsx file"
    - Verify page does NOT contain "Deploy Now" or "Documentation" buttons from template
    - _Requirements: 2.2_

  - [x] 4.3 Verify metadata is correct
    - Inspect HTML meta tags in the response
    - Verify title contains "CAMIART | Camisetas laborales y publicitarias"
    - Verify meta tags do NOT contain "Create Next App"
    - _Requirements: 2.2_

- [x] 5. Deploy to Vercel and verify production

  - [x] 5.1 Commit and push changes
    - Stage the deletion of `/app` directory
    - Create commit with message: "fix: remove duplicate /app directory to fix routing"
    - Push to main branch (or appropriate branch)
    - _Requirements: 2.1_

  - [x] 5.2 Wait for Vercel deployment
    - Monitor Vercel dashboard for deployment status
    - Wait for build to complete successfully
    - Verify deployment status shows "Ready"
    - _Requirements: 2.3_

  - [x] 5.3 Verify production content
    - Access the Vercel production URL
    - Verify page returns status code 200 (not 404)
    - Verify page shows CAMIART content (same checks as 4.2)
    - Verify metadata is correct (same checks as 4.3)
    - Verify static assets load correctly (favicon, images)
    - _Requirements: 2.1, 2.2_

- [x] 6. Checkpoint - Ensure all tests pass and production is working
  - Confirm all exploration tests pass (bug is fixed)
  - Confirm all preservation tests pass (no regressions)
  - Confirm local production build serves correct content
  - Confirm Vercel production serves correct content
  - Confirm no 404 errors in production
  - Ask the user if any questions or issues arise
