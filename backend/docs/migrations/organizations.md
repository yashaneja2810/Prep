# Organizations API Migration

## Overview
This document outlines the API endpoint changes made to the organizations module to improve naming consistency and remove deprecated functionality.

## Changes Made

### 1. Organizations Endpoints

#### 1.1 Renamed Main Organizations Endpoint
- **Old:** `GET /api/organizations` (with pagination)
- **New:** `GET /api/organizations/pagination` (DEPRECATED)
- **Status:** DEPRECATED - This endpoint is deprecated and should not be used

#### 1.2 Promoted Simple Organizations Endpoint  
- **Old:** `GET /api/organizations/simple`
- **New:** `GET /api/organizations`
- **Status:** ACTIVE - This is now the main organizations endpoint

### 2. Organization Users Endpoints

#### 2.1 Renamed Organization Users Endpoint
- **Old:** `GET /api/organizations/{id}/users` (with pagination)
- **New:** `GET /api/organizations/{id}/users/pagination` (DEPRECATED)
- **Status:** DEPRECATED - This endpoint is deprecated and should not be used

#### 2.2 Promoted Simple Organization Users Endpoint
- **Old:** `GET /api/organizations/{id}/users/simple`
- **New:** `GET /api/organizations/{id}/users`
- **Status:** ACTIVE - This is now the main organization users endpoint

#### 2.3 Removed Debug Endpoint
- **Removed:** `GET /api/organizations/{id}/users/debug`
- **Status:** COMPLETELY REMOVED - This endpoint no longer exists

## Migration Guide

### For API Consumers

1. **Update Organizations Calls:**
   - Replace `GET /api/organizations/simple` with `GET /api/organizations`
   - Stop using `GET /api/organizations` (pagination version)

2. **Update Organization Users Calls:**
   - Replace `GET /api/organizations/{id}/users/simple` with `GET /api/organizations/{id}/users`
   - Stop using `GET /api/organizations/{id}/users` (pagination version)
   - Remove any calls to `GET /api/organizations/{id}/users/debug`

### Deprecated Endpoints

The following endpoints are marked as deprecated and will be removed in a future release:

- `GET /api/organizations/pagination` (formerly `/api/organizations`)
- `GET /api/organizations/{id}/users/pagination` (formerly `/api/organizations/{id}/users`)

## Breaking Changes

1. **Endpoint URLs Changed:**
   - The simple endpoints are now the default endpoints
   - Pagination endpoints have been moved to `/pagination` suffix

2. **Debug Endpoint Removed:**
   - `GET /api/organizations/{id}/users/debug` has been completely removed
   - Any code calling this endpoint will receive a 404 error

## Code Changes Made

### Controller Changes
- `src/modules/organizations/organizations.controller.ts`:
  - Changed `@Get('simple')` to `@Get()` for organizations
  - Changed `@Get()` to `@Get('pagination')` for organizations (deprecated)
  - Changed `@Get(':id/users/simple')` to `@Get(':id/users')` for organization users
  - Changed `@Get(':id/users')` to `@Get(':id/users/pagination')` for organization users (deprecated)
  - Removed `@Get(':id/users/debug')` endpoint completely

### Service Changes
- `src/modules/organizations/organizations.service.ts`:
  - Removed `debugUserActiveStatus()` method completely

## Migration Date
- **Date:** [Current Date]
- **Version:** Phase 11 Organizations Module Updates
- **Impact:** Breaking changes for API consumers using old endpoint paths
