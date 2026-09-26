import { AppError } from "../../utils/AppError";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { ISubscription } from "./Subscription.interface";
import { SubscriptionModel } from "./Subscription.model";

const createSubscription = async (payload: Partial<ISubscription>) =>
  SubscriptionModel.create(payload);

const getSubscriptions = async (query: Record<string, unknown>) => {
  const { page, limit, skip, sort } = buildPagination(query);

  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.vendorId) filter.vendorId = query.vendorId;
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    SubscriptionModel.find(filter).populate("vendorId", "shopName slug").sort(sort).skip(skip).limit(limit),
    SubscriptionModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const updateSubscription = async (id: string, payload: Partial<ISubscription>) => {
  const subscription = await SubscriptionModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!subscription) throw new AppError(404, "Subscription not found");
  return subscription;
};

const softDeleteSubscription = async (id: string) => {
  const subscription = await SubscriptionModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!subscription) throw new AppError(404, "Subscription not found");
  return subscription;
};

export const SubscriptionServices = {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  softDeleteSubscription,
};
