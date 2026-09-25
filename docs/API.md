# API Reference

Base URL: `http://localhost:5000/api/v1`

Auth header: `Authorization: Bearer <accessToken>`
Guest header (cart / checkout / review without login): `x-guest-id: <guestId>`

Common list query params: `page`, `limit`, `sortBy`, `sortOrder=asc|desc`, `searchTerm`.

## Auth — `/auth`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | customer signup, returns user + tokens |
| POST | `/auth/login` | public | pass `guestId` to merge the guest cart |
| POST | `/auth/refresh-token` | public | body `{ refreshToken }` |
| POST | `/auth/change-password` | any logged in | `{ oldPassword, newPassword }` |
| GET | `/auth/me` | any logged in | user + vendor profile when vendor |
| PATCH | `/auth/me` | any logged in | multipart field `profileImage` |

Admin is not publicly registerable; it is created by `npm run seed`.

## Vendors / shops — `/vendors`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| POST | `/vendors/register` | public | multipart `logo`; creates user + shop profile |
| GET | `/vendors` | public | shop list (blocked / deleted excluded) |
| GET | `/vendors/:idOrSlug` | public | shop page: shop info + its products |
| GET | `/vendors/:id/reviews` | public | shop reviews |
| GET | `/vendors/me` | vendor | own shop profile |
| PATCH | `/vendors/me` | vendor | multipart `logo`, `banner` |

## Vendor dashboard — `/vendor`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/vendor/profile` | vendor | own shop |
| POST | `/vendor/products` | vendor | multipart `images` (max 6) + product fields |
| GET | `/vendor/products` | vendor | own products, `includeDeleted=true` optional |
| PUT/PATCH | `/vendor/products/:id` | vendor (owner) | update own product |
| DELETE | `/vendor/products/:id` | vendor (owner) | soft delete |
| GET | `/vendor/orders` | vendor | orders containing own products |
| PATCH | `/vendor/orders/:id/status` | vendor (owner) | `{ orderStatus, cancelReason? }` |
| GET | `/vendor/subscriptions` | vendor | own plans (future billing) |

Product fields: `name, description, price, discountPrice, stock, categoryId, brand, images[],
paymentOptions (cod|bkash|both), deliveryCharge, isActive`.

Order status flow: `pending → confirmed → shipped → delivered`, and `cancelled` from any
non-final state (cancelling restores the stock).

## Categories — `/categories`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/categories` | public |
| GET | `/categories/:id` | public |
| POST | `/categories` | admin (multipart `image`) |
| PATCH | `/categories/:id` | admin |
| DELETE | `/categories/:id` | admin (soft delete) |

## Products (public) — `/products`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/products` | filters: `categoryId, vendorId, minPrice, maxPrice, paymentOptions, inStock, searchTerm` |
| GET | `/products/:idOrSlug` | details with shop info, rating |
| GET | `/products/:id/reviews` | product reviews |

## Cart — `/cart` (login optional)

| Method | Path | Body |
| --- | --- | --- |
| GET | `/cart` | – |
| POST | `/cart/add` | `{ productId, quantity }` |
| PUT | `/cart/update` | `{ productId, quantity }` (0 removes) |
| DELETE | `/cart/remove/:productId` | – |
| DELETE | `/cart/clear` | – |

The response contains per shop `vendorGroups` plus `productTotal`, `deliveryCharge`, `grandTotal`.

## Orders — `/orders` (login optional)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/orders` | cart checkout, or "buy now" with `productId` + `quantity` |
| GET | `/orders/my-orders` | orders of the current customer or guest id |
| GET | `/orders/:id` | id or order number; owner or admin only |

`POST /orders` body:

```json
{
  "productId": "optional for buy now",
  "quantity": 1,
  "customerInfo": { "name": "", "phone": "", "email": "", "address": "", "city": "", "note": "" },
  "paymentMethod": "cod"
}
```

A cart with products from several shops creates one order per shop, linked by `parentOrderId`.
`paymentMethod` accepts `bkash_full` / `bkash_delivery_only` in the schema, but the API replies
`501` until the gateway is integrated.

## Reviews — `/reviews` (login optional)

| Method | Path |
| --- | --- |
| POST | `/reviews/product/:productId` |
| POST | `/reviews/vendor/:vendorId` |
| GET | `/reviews/product/:productId` |
| GET | `/reviews/vendor/:vendorId` |

Body: `{ rating: 1-5, comment?, reviewerName? }`.

## Admin — `/admin` (admin only)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/dashboard-stats` | totals, revenue, orders by status, top shops |
| GET | `/admin/vendors` | `isBlocked`, `isDeleted` filters |
| GET | `/admin/vendors/:id` | |
| PATCH | `/admin/vendors/:id` | update shop |
| PATCH | `/admin/vendors/:id/block` | `{ isBlocked: true|false }`, cascades to its products |
| DELETE | `/admin/vendors/:id` | soft delete + hides its products |
| PATCH | `/admin/vendors/:id/restore` | |
| GET | `/admin/products` | every vendor's products |
| POST | `/admin/products` | needs `vendorId` |
| PATCH | `/admin/products/:id` | |
| PATCH | `/admin/products/:id/block` | `{ isBlocked }` |
| DELETE | `/admin/products/:id` | soft delete |
| PATCH | `/admin/products/:id/restore` | |
| GET | `/admin/customers` | customer accounts |
| GET | `/admin/users` | any role, `role=` filter |
| GET | `/admin/users/:id` | |
| PATCH | `/admin/users/:id/block` | `{ isBlocked }` |
| DELETE | `/admin/users/:id` | soft delete |
| PATCH | `/admin/users/:id/restore` | |
| GET | `/admin/orders` | all vendors, filters: `vendorId, orderStatus, paymentStatus, searchTerm` |
| PATCH | `/admin/orders/:id/status` | |
| DELETE | `/admin/orders/:id` | soft delete |
| GET | `/admin/reviews` | moderation list |
| DELETE | `/admin/reviews/:id` | soft delete + rating recalculation |
| GET/POST/PATCH/DELETE | `/admin/subscriptions` | future vendor billing plans |
