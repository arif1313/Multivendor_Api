import { Model } from "mongoose";

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Returns a slug that is not yet used in the given collection. */
export const uniqueSlug = async (
   
  model: Model<any>,
  value: string,
  field = "slug"
): Promise<string> => {
  const base = slugify(value) || "item";
  let slug = base;
  let counter = 1;
   
  while (await model.exists({ [field]: slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};
