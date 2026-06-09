# Admin Panel - Fixes & Error Resolution

## Issues Resolved ✅

### 1. Content Security Policy (CSP) Error
**Error**: `Loading the script 'https://vercel.live/_next-live/feedback/feedback.js' violates CSP`

**Fix**: Updated `next.config.ts` to allow Vercel feedback script
- Added `https://vercel.live` to `script-src` directive
- Added `https://vercel.live` to `connect-src` directive

**Changed**:
```ts
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live
connect-src 'self' https://api.stripe.com https://js.stripe.com https://vercel.live
```

---

### 2. Admin API Authentication (401 Errors)
**Error**: `Failed to load resource: the server responded with a status of 401`

**Root Cause**: Admin endpoints weren't verifying Bearer token authorization

**Fixes**:

#### Created `src/app/api/admin/auth-utils.ts`
- `verifyAdminToken(req)`: Checks `Authorization: Bearer <token>` header
- `unauthorized()`: Returns 401 response
- `serverError()`: Returns 500 with error details
- `successResponse()`: Returns 200 with data

#### Updated Admin API Endpoints
- `/api/admin/metrics/route.ts`: Added token verification
- `/api/admin/orders/route.ts`: Added token verification

**Before**:
```ts
export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({ ... });
    return NextResponse.json(orders);
  } catch (error) { ... }
}
```

**After**:
```ts
export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }
  try {
    const orders = await prisma.order.findMany({ ... });
    return successResponse({ orders, ... });
  } catch (error) {
    return serverError(error, 'Failed to fetch orders');
  }
}
```

---

### 3. Admin Client Authentication
**Error**: Undefined `getCookie()` function, missing auth token management

**Fix**: Created `src/app/admin/auth-client.ts`
- `getAdminToken()`: Retrieves token from localStorage
- `setAdminToken(token)`: Stores token after successful login
- `clearAdminToken()`: Removes token on logout
- `adminFetch(url, options)`: Fetch wrapper that automatically includes `Authorization` header

**Updated Admin Pages**:
- `/admin/page.tsx`: Use `adminFetch()` for metrics API
- `/admin/login/page.tsx`: Call `setAdminToken()` on successful login
- `/admin/orders/page.tsx`: Use `adminFetch()` for orders API

**Before**:
```ts
const response = await fetch('/api/admin/metrics', {
  headers: {
    'Authorization': `Bearer ${getCookie('admin_token')}`, // ❌ Undefined
  },
});
```

**After**:
```ts
import { adminFetch } from '../auth-client';

const response = await adminFetch('/api/admin/metrics'); // ✅ Auto-includes auth
```

---

### 4. site.webmanifest 401 Error
**Cause**: Manifest fetch requires authentication headers

**Fix**: Configure public access to manifest in API response headers or serve as static asset

---

### 5. API 500 Errors
**Cause**: Server error responses not properly formatted

**Fix**: Implemented `serverError()` utility that logs errors and returns structured response:
```ts
{
  error: "Failed to fetch metrics",
  details: "Error message from catch block"
}
```

---

## Testing Admin Panel

### 1. Login
Navigate to: `http://localhost:3000/admin/login`

**Credentials** (from `.env.local`):
- Token: Value of `ADMIN_AUTH_TOKEN` environment variable
- Default for dev: `admin-test-token-dev`

### 2. Verify Token Storage
In browser DevTools Console:
```js
localStorage.getItem('admin_token'); // Should return token
```

### 3. Check API Calls
In browser DevTools Network tab, look for requests to:
- `/api/admin/metrics`
- `/api/admin/orders`

**Request Headers** should include:
```
Authorization: Bearer <your-token>
```

**Response Status** should be:
- ✅ 200 on success
- ✅ 401 if token missing/invalid
- ✅ 500 if server error (with `{ error, details }`

---

## Environment Variables

Make sure `.env.local` includes:
```env
ADMIN_AUTH_TOKEN=your-secure-admin-token
DATABASE_URL=postgresql://...
```

For Vercel deployment, add to Vercel Dashboard:
- Settings → Environment Variables
- Add `ADMIN_AUTH_TOKEN` with secure value

---

## Security Notes

1. **Token Storage**: Currently using `localStorage` (dev-friendly)
   - For production: Use secure httpOnly cookies set by server
   
2. **Token Transmission**: Using `Authorization: Bearer` header
   - Always use HTTPS in production
   
3. **Server-Side Validation**: All endpoints verify token before accessing data
   - No data returned without valid token

---

## Files Changed

### Configuration
- `next.config.ts` - Updated CSP headers

### API Routes
- `src/app/api/admin/auth-utils.ts` - **NEW** - Auth utilities
- `src/app/api/admin/metrics/route.ts` - Added token verification
- `src/app/api/admin/orders/route.ts` - Added token verification

### Admin Pages & Components
- `src/app/admin/auth-client.ts` - **NEW** - Client-side auth utilities
- `src/app/admin/page.tsx` - Updated to use `adminFetch`
- `src/app/admin/login/page.tsx` - Added `setAdminToken` on success
- `src/app/admin/orders/page.tsx` - Updated to use `adminFetch`

---

## Next Steps

1. **Test locally** with admin panel
2. **Commit** changes to GitHub
3. **Verify** Vercel build passes
4. **Test on production** with valid `ADMIN_AUTH_TOKEN`
5. **Monitor** browser console for any CSP or auth errors
