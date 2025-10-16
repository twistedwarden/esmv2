# Switch API Environment (Local ↔ Production)

This prompt helps you quickly switch between local development and production API endpoints without touching .env files.

## Quick Switch Instructions

### Method 1: Update Config File (Recommended)

**Location**: `GSM/src/config/environment.ts` or `GSM/src/config/api.js`

**Switch to Local Development**:

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  AUTH_SERVICE: "http://localhost:8001",
  SCHOLARSHIP_SERVICE: "http://localhost:8002",
  AID_SERVICE: "http://localhost:8003",
  MONITORING_SERVICE: "http://localhost:8004",
};
```

**Switch to Production**:

<!--
```typescript
export const API_CONFIG = {
  BASE_URL: "https://api.gsph.com",
  AUTH_SERVICE: "https://auth.gsph.com",
  SCHOLARSHIP_SERVICE: "https://scholarship.gsph.com",
  AID_SERVICE: "https://aid.gsph.com",
  MONITORING_SERVICE: "https://monitoring.gsph.com",
}; -->

````

### Method 2: Update Vite Config

**Location**: `GSM/vite.config.ts`

**Add/update the define property**:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/",
  define: {
    // Switch between 'local' and 'production'
    __API_ENV__: JSON.stringify("local"), // or 'production'
  },
});
````

Then in your code:

```typescript
const API_BASE =
  __API_ENV__ === "local" ? "http://localhost:8000" : "https://api.gsph.com";
```

### Method 3: Smart Auto-Detection

**Update config to auto-detect**:

```typescript
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_CONFIG = {
  BASE_URL: isLocalhost ? "http://localhost:8000" : "https://api.gsph.com",
  AUTH_SERVICE: isLocalhost ? "http://localhost:8001" : "https://auth.gsph.com",
  // ... other services
};
```

## AI Assistant Usage

**"Switch to local APIs"** → Updates config files to use localhost URLs
**"Switch to production APIs"** → Updates config files to use production URLs
**"Use auto-detect for APIs"** → Implements smart detection based on hostname
**"Show current API configuration"** → Displays active API endpoints

## Verification

After switching, restart dev server and check:

```bash
cd GSM
npm run dev
```

## Service Ports Reference

| Service     | Local | Production           |
| ----------- | ----- | -------------------- |
| Main API    | :8000 | api.gsph.com         |
| Auth        | :8001 | auth.gsph.com        |
| Scholarship | :8002 | scholarship.gsph.com |
| Aid         | :8003 | aid.gsph.com         |
| Monitoring  | :8004 | monitoring.gsph.com  |
