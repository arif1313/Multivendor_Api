import { IProductDocument } from "../modules/Product/Product.interface";

export type TPricedItem = {
  product: IProductDocument;
  quantity: number;
};

export type TVendorGroup = {
  vendorId: string;
  items: TPricedItem[];
  productTotal: number;
  deliveryCharge: number;
  grandTotal: number;
};

export const unitPrice = (product: IProductDocument): number =>
  product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

/**
 * Groups items per vendor so every shop gets its own order.
 * Delivery charge per vendor = highest delivery charge among that vendor's items.
 * Grand total = product total + delivery charge.
 */
export const groupByVendor = (items: TPricedItem[]): TVendorGroup[] => {
  const groups = new Map<string, TPricedItem[]>();

  items.forEach((item) => {
    const vendorId = String(item.product.vendorId);
    groups.set(vendorId, [...(groups.get(vendorId) || []), item]);
  });

  return [...groups.entries()].map(([vendorId, vendorItems]) => {
    const productTotal = vendorItems.reduce(
      (sum, item) => sum + unitPrice(item.product) * item.quantity,
      0
    );
    const deliveryCharge = vendorItems.reduce(
      (max, item) => Math.max(max, item.product.deliveryCharge || 0),
      0
    );
    return {
      vendorId,
      items: vendorItems,
      productTotal,
      deliveryCharge,
      grandTotal: productTotal + deliveryCharge,
    };
  });
};
