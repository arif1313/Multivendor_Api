import { OrderModel } from "../Order/Order.model";
import { ProductModel } from "../Product/Product.model";
import { UserModel } from "../User/User.model";
import { VendorModel } from "../Vendor/Vendor.model";

const getDashboardStats = async () => {
  const [
    totalVendors,
    blockedVendors,
    totalCustomers,
    totalProducts,
    blockedProducts,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    topVendors,
  ] = await Promise.all([
    VendorModel.countDocuments({ isDeleted: false }),
    VendorModel.countDocuments({ isDeleted: false, isBlocked: true }),
    UserModel.countDocuments({ role: "customer", isDeleted: false }),
    ProductModel.countDocuments({ isDeleted: false }),
    ProductModel.countDocuments({ isDeleted: false, isBlocked: true }),
    OrderModel.countDocuments({ isDeleted: false }),
    OrderModel.aggregate([
      { $match: { isDeleted: false, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    OrderModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate([
      { $match: { isDeleted: false, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: "$vendorId", orders: { $sum: 1 }, revenue: { $sum: "$grandTotal" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "vendors", localField: "_id", foreignField: "_id", as: "vendor" },
      },
      { $unwind: "$vendor" },
      {
        $project: { _id: 0, vendorId: "$_id", shopName: "$vendor.shopName", orders: 1, revenue: 1 },
      },
    ]),
  ]);

  return {
    totalVendors,
    blockedVendors,
    totalCustomers,
    totalProducts,
    blockedProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    ordersByStatus: ordersByStatus.reduce<Record<string, number>>(
      (acc, row) => ({ ...acc, [row._id]: row.count }),
      {}
    ),
    topVendors,
  };
};

export const AdminServices = { getDashboardStats };
