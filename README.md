# Multi-Vendor E-commerce Backend

TypeScript + Express + MongoDB (Mongoose) REST API for a multi-vendor e-commerce platform with
three roles: **admin**, **vendor**, **customer**.

## Features

- JWT auth (access + refresh token) with role based access control
- Vendor shop profiles (shop name / brand name / logo / slug for future subdomains)
- Product CRUD by the owning vendor, plus admin override, image upload, soft delete, block/unblock
- Public storefront APIs: product list with search / filter / sort / pagination, product details with
  shop info and reviews, shop page by id or slug
- Guest cart (no login needed) via `guestId` cookie/header, merged into the account cart on login
- Checkout for guests and logged in customers, one order per vendor, `grandTotal = productTotal + deliveryCharge`
- Cash on delivery today; `bkash_full` / `bkash_delivery_only`, `paymentStatus`, `paymentMode`,
  `transactionId` already exist in the schema for the future bKash integration
- Product and shop reviews with automatic `avgRating` recalculation
- Admin: all vendors, all products, all customers, all orders, review moderation, dashboard stats
- Vendor subscription collection (monthly / yearly / per product) ready for the future billing feature

## Project structure



Every module follows the same pattern as the provided demo: `*.interface.ts`, `*.model.ts`,
`*.validation.ts` (Joi), `*.service.ts`, `*.controller.ts`, `*.router.ts`.

## Getting started

```bash
npm install
cp .env      # set DATABASE_URL and the JWT secrets
npm run dev               # http://localhost:5000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm run smoke`.

Seeded logins: `admin@shop.com / admin1234`, `vendor1@shop.com / vendor1234`,
`vendor2@shop.com / vendor1234`, `customer@shop.com / customer1234`.

## Conventions

- Base path: `/api/v1`. Uploaded files are served from `/uploads`.
- Response shape: `{ success, message, meta?, data? }`; errors: `{ success: false, message }`.
- List endpoints accept `page`, `limit`, `sortBy`, `sortOrder`, `searchTerm` and module specific filters.
- Nothing is hard deleted: `isDeleted` (soft delete) and `isBlocked` flags are used everywhere.
- Guest identity: the API sets a `guestId` cookie and returns the `x-guest-id` response header.
  A frontend without cookies can send `x-guest-id: <id>` instead.

See `docs/API.md` for the full endpoint list and `docs/postman_collection.json` for a ready to
import Postman collection.
