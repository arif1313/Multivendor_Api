/**
 * End-to-end smoke test over the real HTTP API using an in-memory MongoDB.
 * Run with: npm run smoke
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const PORT = 5099;
const BASE = `http://127.0.0.1:${PORT}/api/v1`;

let passed = 0;
let failed = 0;

const check = (label: string, condition: boolean, extra?: unknown) => {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${label}`, extra ?? "");
  }
};

type TApiResult = { status: number; body: any; headers: Headers };

const api = async (
  method: string,
  path: string,
  options: { body?: unknown; token?: string; guestId?: string } = {}
): Promise<TApiResult> => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.guestId ? { "x-guest-id": options.guestId } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
};

const main = async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongod.getUri("smoke");
  process.env.PORT = String(PORT);

  // config reads env at import time
  const app = (await import("../src/app")).default;
  await mongoose.connect(process.env.DATABASE_URL);
  const server = app.listen(PORT);

  const { UserModel } = await import("../src/app/modules/User/User.model");
  await UserModel.create({
    name: "Admin",
    email: "admin@shop.com",
    password: "admin1234",
    role: "admin",
  });

  const adminLogin = await api("POST", "/auth/login", {
    body: { email: "admin@shop.com", password: "admin1234" },
  });
  check("admin login", adminLogin.status === 200 && !!adminLogin.body.data.accessToken);
  const adminToken = adminLogin.body.data.accessToken;

  const category = await api("POST", "/categories", {
    token: adminToken,
    body: { name: "Electronics" },
  });
  check("admin creates category", category.status === 201, category.body);

  const vendorReg = await api("POST", "/vendors/register", {
    body: {
      name: "Rahim",
      email: "vendor1@shop.com",
      password: "vendor1234",
      shopName: "Rahim Electronics",
      brandName: "RahimTech",
    },
  });
  check("vendor registration", vendorReg.status === 201 && !!vendorReg.body.data.vendor, vendorReg.body);
  const vendorToken = vendorReg.body.data.accessToken;
  const vendorId = vendorReg.body.data.vendor._id;

  const vendor2Reg = await api("POST", "/vendors/register", {
    body: {
      name: "Karim",
      email: "vendor2@shop.com",
      password: "vendor1234",
      shopName: "Karim Fashion",
    },
  });
  const vendor2Token = vendor2Reg.body.data.accessToken;

  const product = await api("POST", "/vendor/products", {
    token: vendorToken,
    body: {
      name: "Wireless Earbuds",
      price: 2000,
      stock: 5,
      deliveryCharge: 60,
      categoryId: category.body.data._id,
      paymentOptions: "both",
    },
  });
  check("vendor creates product", product.status === 201, product.body);
  const productId = product.body.data._id;

  const product2 = await api("POST", "/vendor/products", {
    token: vendor2Token,
    body: { name: "Cotton Panjabi", price: 1500, stock: 3, deliveryCharge: 70 },
  });
  const product2Id = product2.body.data._id;

  const foreignUpdate = await api("PATCH", `/vendor/products/${product2Id}`, {
    token: vendorToken,
    body: { price: 1 },
  });
  check("vendor cannot edit another vendor's product", foreignUpdate.status === 403, foreignUpdate.body);

  const publicList = await api("GET", "/products?searchTerm=Earbuds");
  check("public product list works without auth", publicList.status === 200 && publicList.body.data.length === 1);

  const details = await api("GET", `/products/${productId}`);
  check(
    "product details include shop info",
    details.status === 200 && details.body.data.vendorId.shopName === "Rahim Electronics",
    details.body
  );

  const guestId = "guest-smoke-001";
  const add1 = await api("POST", "/cart/add", { guestId, body: { productId, quantity: 2 } });
  check("guest can add to cart without login", add1.status === 201, add1.body);
  const add2 = await api("POST", "/cart/add", { guestId, body: { productId: product2Id, quantity: 1 } });
  const cart = add2.body.data;
  check(
    "cart total = products + delivery per shop",
    cart.productTotal === 5500 && cart.deliveryCharge === 130 && cart.grandTotal === 5630,
    cart
  );

  const order = await api("POST", "/orders", {
    guestId,
    body: {
      customerInfo: { name: "Sumon", phone: "01711111111", address: "Mirpur 10, Dhaka" },
      paymentMethod: "cod",
    },
  });
  check("guest checkout splits order per vendor", order.status === 201 && order.body.data.orders.length === 2, order.body);
  const vendorOrder = order.body.data.orders.find((o: any) => o.vendorId === vendorId);
  check(
    "order grand total = product total + delivery charge",
    vendorOrder.productTotal === 4000 && vendorOrder.deliveryCharge === 60 && vendorOrder.grandTotal === 4060,
    vendorOrder
  );

  const bkashOrder = await api("POST", "/orders", {
    guestId: "guest-smoke-002",
    body: {
      productId,
      quantity: 1,
      customerInfo: { name: "Sumon", phone: "01711111111", address: "Mirpur 10, Dhaka" },
      paymentMethod: "bkash_full",
    },
  });
  check("bkash is rejected for now", bkashOrder.status === 501, bkashOrder.body);

  const stock = await api("GET", `/products/${productId}`);
  check("stock decreased after order", stock.body.data.stock === 3, stock.body.data.stock);

  const vendorOrders = await api("GET", "/vendor/orders", { token: vendorToken });
  check(
    "vendor dashboard shows only its own orders",
    vendorOrders.status === 200 && vendorOrders.body.data.length === 1,
    vendorOrders.body
  );

  const statusUpdate = await api("PATCH", `/vendor/orders/${vendorOrder._id}/status`, {
    token: vendorToken,
    body: { orderStatus: "confirmed" },
  });
  check("vendor updates order status", statusUpdate.status === 200, statusUpdate.body);

  const badTransition = await api("PATCH", `/vendor/orders/${vendorOrder._id}/status`, {
    token: vendorToken,
    body: { orderStatus: "delivered" },
  });
  check("invalid status transition rejected", badTransition.status === 400, badTransition.body);

  const review = await api("POST", `/reviews/product/${productId}`, {
    guestId,
    body: { rating: 5, comment: "Great sound", reviewerName: "Sumon" },
  });
  check("guest can review a product", review.status === 201, review.body);

  const rated = await api("GET", `/products/${productId}`);
  check("product avg rating updated", rated.body.data.avgRating === 5, rated.body.data.avgRating);

  const shopReview = await api("POST", `/reviews/vendor/${vendorId}`, {
    guestId,
    body: { rating: 4, reviewerName: "Sumon" },
  });
  check("guest can review a shop", shopReview.status === 201, shopReview.body);

  const storefront = await api("GET", `/vendors/rahim-electronics`);
  check(
    "vendor storefront by slug (future subdomain)",
    storefront.status === 200 && storefront.body.data.products.length === 1,
    storefront.body
  );

  const unauthorized = await api("GET", "/admin/vendors", { token: vendorToken });
  check("vendor cannot access admin routes", unauthorized.status === 403, unauthorized.body);

  const block = await api("PATCH", `/admin/vendors/${vendorId}/block`, {
    token: adminToken,
    body: { isBlocked: true },
  });
  check("admin blocks vendor", block.status === 200, block.body);

  const afterBlock = await api("GET", "/products?searchTerm=Earbuds");
  check("blocked vendor products hidden from storefront", afterBlock.body.data.length === 0, afterBlock.body);

  await api("PATCH", `/admin/vendors/${vendorId}/block`, {
    token: adminToken,
    body: { isBlocked: false },
  });

  const softDelete = await api("DELETE", `/admin/products/${productId}`, { token: adminToken });
  check("admin soft deletes product", softDelete.status === 200 && softDelete.body.data.isDeleted === true);
  const restored = await api("PATCH", `/admin/products/${productId}/restore`, { token: adminToken });
  check("admin restores product", restored.body.data.isDeleted === false);

  const customerReg = await api("POST", "/auth/register", {
    body: { name: "Sumon", email: "customer@shop.com", password: "customer1234" },
  });
  check("customer registration", customerReg.status === 201, customerReg.body);

  const guestForMerge = "guest-smoke-003";
  await api("POST", "/cart/add", { guestId: guestForMerge, body: { productId, quantity: 1 } });
  const customerLogin = await api("POST", "/auth/login", {
    body: { email: "customer@shop.com", password: "customer1234", guestId: guestForMerge },
  });
  const customerToken = customerLogin.body.data.accessToken;
  const mergedCart = await api("GET", "/cart", { token: customerToken });
  check("guest cart merges into account cart on login", mergedCart.body.data.items.length === 1, mergedCart.body);

  const stats = await api("GET", "/admin/dashboard-stats", { token: adminToken });
  check(
    "admin dashboard stats",
    stats.status === 200 && stats.body.data.totalVendors === 2 && stats.body.data.totalOrders === 2,
    stats.body
  );

  const customers = await api("GET", "/admin/customers", { token: adminToken });
  check("admin sees customer data", customers.status === 200 && customers.body.data.length === 1);

  const allOrders = await api("GET", "/admin/orders", { token: adminToken });
  check("admin sees all orders", allOrders.body.data.length === 2);

  const notFound = await api("GET", "/does-not-exist");
  check("unknown route returns 404", notFound.status === 404);

  server.close();
  await mongoose.disconnect();
  await mongod.stop();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
