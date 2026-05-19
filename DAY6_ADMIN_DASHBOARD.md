# Day 6: Admin Dashboard & Vercel Deployment

## Status
✅ **COMPLETED** - Admin dashboard implemented with authentication, orders management, and Vercel deployment setup.

## What's Included

### 1. Admin Routes (Protected)
- **`/admin/login`** - Admin login page with token validation
- **`/admin`** - Dashboard with metrics (total orders, paid, pending, revenue)
- **`/admin/orders`** - Orders list with filters, search, and pagination
- **`/admin/orders/[id]`** - Order details with customer info, items, and timeline

### 2. Admin API Endpoints
- **`GET /api/admin/orders`** - List orders with filters, search, pagination
  - Query params: `status`, `page`, `limit`, `search`, `sortBy`, `startDate`, `endDate`
  - Requires: `Authorization: Bearer {ADMIN_AUTH_TOKEN}`

- **`GET /api/admin/orders/[id]`** - Get single order with items
  - Requires: `Authorization: Bearer {ADMIN_AUTH_TOKEN}`

- **`POST /api/admin/orders/[id]/send-email`** - Resend order confirmation email
  - Requires: `Authorization: Bearer {ADMIN_AUTH_TOKEN}`

- **`GET /api/admin/metrics`** - Get dashboard metrics
  - Query params: `days` (default: 30)
  - Requires: `Authorization: Bearer {ADMIN_AUTH_TOKEN}`

- **`POST /api/admin/auth/login`** - Admin login (sets session cookie)
  - Body: `{ token: string }`

### 3. Authentication & Middleware
- **`src/middleware.ts`** - Protects `/admin/*` and `/api/admin/*` routes
  - Redirects unauthenticated users to `/admin/login`
  - Checks `admin_token` cookie for UI routes
  - Checks `Authorization: Bearer` header for API routes

### 4. Environment Variables
Add to `.env.local` and configure in Vercel dashboard:
```
ADMIN_AUTH_TOKEN=admin_token_development_12345  # Change in production!
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@camiprint.com
NODE_ENV=production
```

## Local Testing

### 1. Start Development Server
```bash
npm run dev --webpack
```

### 2. Access Admin
1. Go to `http://localhost:3000/admin`
2. You'll be redirected to `/admin/login`
3. Enter token from `.env.local` (`ADMIN_AUTH_TOKEN`)
4. Click "Acceder"

### 3. Test Admin Features
- **Dashboard**: View metrics for last 30 days
- **Orders Page**: 
  - Filter by status (Pending, Paid, Cancelled)
  - Search by Order ID or email
  - Paginate through results
  - Click order to see details
- **Order Details**:
  - View customer info, items, total
  - Click "Resend Email" to send confirmation email again

### 4. Run Tests
```bash
npm test -- __tests__/admin.test.ts
```

## Vercel Deployment

### 1. Connect Repository to Vercel
```bash
# Via Vercel CLI
vercel login
vercel link

# Or connect via Vercel Dashboard:
# 1. Go to https://vercel.com
# 2. New Project
# 3. Select GitHub repo
```

### 2. Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string (use Vercel Postgres) |
| `ADMIN_AUTH_TOKEN` | Generate secure token (use `openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `STRIPE_PUBLIC_KEY` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard |
| `SMTP_HOST` | Your email provider SMTP host |
| `SMTP_PORT` | Your email provider SMTP port |
| `SMTP_USER` | Your email provider username |
| `SMTP_PASS` | Your email provider password |
| `SMTP_FROM` | From address for emails |
| `NODE_ENV` | `production` |
| `QUOTES_REPOSITORY_DRIVER` | `postgres` |
| `RATE_LIMIT_STORE_DRIVER` | `memory` |
| `NEXT_PUBLIC_QUOTES_API_ENABLED` | `false` |

### 3. Deploy
```bash
# Push to main branch triggers auto-deploy
git add -A
git commit -m "feat: Day 6 Admin Dashboard & Vercel Setup"
git push camiprint main

# Or manual deploy with Vercel CLI
vercel deploy --prod
```

### 4. Verify Deployment
- Check build logs: `vercel logs`
- Test API: `https://[domain]/api/admin/metrics` (should return 401 without header)
- Test webhook: Verify Stripe webhook reaches production URL

### 5. Configure Stripe Webhook for Production
1. Go to Stripe Dashboard → Webhooks
2. Create new endpoint for: `https://[domain]/api/webhook/stripe`
3. Copy signing secret → Add to Vercel as `STRIPE_WEBHOOK_SECRET`
4. Test webhook delivery

## Security Checklist

- [ ] Change `ADMIN_AUTH_TOKEN` to secure random token in production
- [ ] Configure `SMTP_*` variables for production email service
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set strong database password in `DATABASE_URL`
- [ ] Verify webhook secret is correctly configured
- [ ] Test admin login with production token
- [ ] Verify email confirmations are sent from production address

## Testing Checklist

### Functional
- [ ] Admin login with valid token works
- [ ] Admin login with invalid token shows error
- [ ] Dashboard loads and displays correct metrics
- [ ] Orders list filters by status correctly
- [ ] Orders search by ID or email works
- [ ] Order detail page displays all information
- [ ] Resend email button works and sends email
- [ ] Pagination works on orders page

### Deployment
- [ ] Build succeeds on Vercel
- [ ] Env variables are correctly set
- [ ] Database is accessible from Vercel
- [ ] Stripe webhook delivers to production URL
- [ ] Email sends from production SMTP

### End-to-End
- [ ] User can purchase through checkout
- [ ] Admin sees new order in dashboard
- [ ] Webhook updates order status to "paid"
- [ ] Customer receives confirmation email
- [ ] Admin can resend email from order detail

## Files Created/Modified

### New Files
```
src/app/admin/layout.tsx
src/app/admin/login/page.tsx
src/app/admin/page.tsx
src/app/admin/orders/page.tsx
src/app/admin/orders/[id]/page.tsx
src/app/api/admin/auth/login/route.ts
src/app/api/admin/orders/route.ts
src/app/api/admin/orders/[id]/route.ts
src/app/api/admin/orders/[id]/send-email/route.ts
src/app/api/admin/metrics/route.ts
src/middleware.ts
__tests__/admin.test.ts
```

### Modified Files
```
.env.local (added ADMIN_AUTH_TOKEN)
.env.example (updated with all env vars)
vercel.json (updated for Vercel deployment)
```

## Key Features

✅ **Simple Admin Dashboard**
- Metrics: total orders, paid, pending, revenue, average order value
- 30-day rolling window
- Card-based responsive layout

✅ **Orders Management**
- Filterable by status (pending, paid, cancelled)
- Searchable by order ID or customer email
- Paginated (10 items per page)
- Responsive: table on desktop, cards on mobile

✅ **Order Details**
- Customer information (name, email, phone, address)
- Order items with product details
- Order summary with total
- Timeline showing order creation and payment
- Resend confirmation email button

✅ **Authentication**
- Token-based admin access
- Secure session cookies (httpOnly, 7-day expiration)
- Middleware protection on all admin routes
- Clean logout functionality

✅ **API Endpoints**
- RESTful endpoints with proper HTTP status codes
- Authorization header validation
- Efficient Prisma queries with relationships
- Error handling and logging

✅ **Vercel Ready**
- Optimized build configuration (`--webpack` flag for exFAT compatibility)
- Environment variables properly templated
- Security headers configured
- Webhook-friendly CORS setup

## Next Steps (Day 7)

- [ ] Comprehensive end-to-end testing
- [ ] Load testing and performance optimization
- [ ] Go-live checklist
- [ ] Production monitoring setup
- [ ] Customer support documentation

## Support

For issues:
1. Check `.env.local` has `ADMIN_AUTH_TOKEN` set
2. Verify database connection with `npm run db:migrate`
3. Run tests: `npm test`
4. Check Vercel logs: `vercel logs`

---

**Created on:** 19 de mayo de 2026
**MVP Day:** 6 of 7
