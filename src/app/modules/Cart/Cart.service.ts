import { AppError } from "../../utils/AppError";
import { TPricedItem, groupByVendor, unitPrice } from "../../utils/pricing";
import { IProductDocument } from "../Product/Product.interface";
import { ProductModel } from "../Product/Product.model";
import { ICartDocument } from "./Cart.interface";
import { CartModel } from "./Cart.model";

export type TCartOwner = { customerId?: string; guestId?: string };

const ownerFilter = (owner: TCartOwner) => {
  if (owner.customerId) return { customerId: owner.customerId };
  if (owner.guestId) return { guestId: owner.guestId };
  throw new AppError(400, "A customer id or guest id is required for cart operations");
};

const getOrCreateCart = async (owner: TCartOwner): Promise<ICartDocument> => {
  const filter = ownerFilter(owner);
  const existing = await CartModel.findOne(filter);
  if (existing) return existing;
  return CartModel.create({ ...filter, items: [] });
};

const getSellableProduct = async (productId: string): Promise<IProductDocument> => {
  const product = await ProductModel.findOne({
    _id: productId,
    isDeleted: false,
    isBlocked: false,
    isActive: true,
  });
  if (!product) throw new AppError(404, "Product is not available");
  return product;
};

/** Cart with populated products and the price breakdown per shop. */
const getCartSummary = async (owner: TCartOwner) => {
  const cart = await getOrCreateCart(owner);

  const products = await ProductModel.find({
    _id: { $in: cart.items.map((item) => item.productId) },
    isDeleted: false,
  }).populate("vendorId", "shopName slug logo");

  const priced: TPricedItem[] = [];
  cart.items.forEach((item) => {
    const product = products.find((p) => String(p._id) === String(item.productId));
    if (product) priced.push({ product, quantity: item.quantity });
  });

  const vendorGroups = groupByVendor(priced);

  return {
    cartId: cart._id,
    customerId: cart.customerId,
    guestId: cart.guestId,
    items: priced.map(({ product, quantity }) => ({
      productId: product._id,
      name: product.name,
      image: product.images?.[0],
      vendor: product.vendorId,
      unitPrice: unitPrice(product),
      quantity,
      subtotal: unitPrice(product) * quantity,
      paymentOptions: product.paymentOptions,
    })),
    vendorGroups: vendorGroups.map((group) => ({
      vendorId: group.vendorId,
      productTotal: group.productTotal,
      deliveryCharge: group.deliveryCharge,
      grandTotal: group.grandTotal,
    })),
    productTotal: vendorGroups.reduce((sum, g) => sum + g.productTotal, 0),
    deliveryCharge: vendorGroups.reduce((sum, g) => sum + g.deliveryCharge, 0),
    grandTotal: vendorGroups.reduce((sum, g) => sum + g.grandTotal, 0),
  };
};

const addToCart = async (owner: TCartOwner, productId: string, quantity = 1) => {
  const product = await getSellableProduct(productId);
  const cart = await getOrCreateCart(owner);

  const existing = cart.items.find((item) => String(item.productId) === productId);
  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (product.stock > 0 && nextQuantity > product.stock) {
    throw new AppError(400, `Only ${product.stock} item(s) left in stock`);
  }

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({ productId: product._id, vendorId: product.vendorId, quantity });
  }

  await cart.save();
  return getCartSummary(owner);
};

/** Quantity 0 removes the item. */
const updateCartItem = async (owner: TCartOwner, productId: string, quantity: number) => {
  const cart = await getOrCreateCart(owner);
  const existing = cart.items.find((item) => String(item.productId) === productId);
  if (!existing) throw new AppError(404, "Product is not in the cart");

  if (quantity === 0) {
    cart.items = cart.items.filter((item) => String(item.productId) !== productId);
  } else {
    const product = await getSellableProduct(productId);
    if (product.stock > 0 && quantity > product.stock) {
      throw new AppError(400, `Only ${product.stock} item(s) left in stock`);
    }
    existing.quantity = quantity;
  }

  await cart.save();
  return getCartSummary(owner);
};

const removeCartItem = async (owner: TCartOwner, productId: string) => {
  const cart = await getOrCreateCart(owner);
  cart.items = cart.items.filter((item) => String(item.productId) !== productId);
  await cart.save();
  return getCartSummary(owner);
};

const clearCart = async (owner: TCartOwner) => {
  const cart = await getOrCreateCart(owner);
  cart.items = [];
  await cart.save();
  return getCartSummary(owner);
};

/** Called on login so an anonymous cart is not lost. */
const mergeGuestCart = async (guestId: string, customerId: string) => {
  const guestCart = await CartModel.findOne({ guestId });
  if (!guestCart || !guestCart.items.length) return null;

  const customerCart = await getOrCreateCart({ customerId });

  guestCart.items.forEach((guestItem) => {
    const existing = customerCart.items.find(
      (item) => String(item.productId) === String(guestItem.productId)
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      customerCart.items.push(guestItem);
    }
  });

  await customerCart.save();
  await CartModel.deleteOne({ _id: guestCart._id });
  return customerCart;
};

export const CartServices = {
  getOrCreateCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};
