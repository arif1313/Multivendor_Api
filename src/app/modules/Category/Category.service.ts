import { AppError } from "../../utils/AppError";
import { uniqueSlug } from "../../utils/slugify";
import { ICategory } from "./Category.interface";
import { CategoryModel } from "./Category.model";

const createCategory = async (payload: Partial<ICategory>) => {
  const slug = await uniqueSlug(CategoryModel, payload.name as string);
  return CategoryModel.create({ ...payload, slug });
};

const getCategories = async () => CategoryModel.find({ isDeleted: false }).sort({ name: 1 });

const getCategoryById = async (id: string) => {
  const category = await CategoryModel.findOne({ _id: id, isDeleted: false });
  if (!category) throw new AppError(404, "Category not found");
  return category;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const update: Partial<ICategory> = { ...payload };
  if (payload.name) update.slug = await uniqueSlug(CategoryModel, payload.name);

  const category = await CategoryModel.findOneAndUpdate({ _id: id, isDeleted: false }, update, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError(404, "Category not found");
  return category;
};

const softDeleteCategory = async (id: string) => {
  const category = await CategoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!category) throw new AppError(404, "Category not found");
  return category;
};

export const CategoryServices = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  softDeleteCategory,
};
