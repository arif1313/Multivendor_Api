import mongoose from "mongoose";
import { config } from "./config";
import { CategoryModel } from "./app/modules/Category/Category.model";
import { ProductModel } from "./app/modules/Product/Product.model";
import { UserModel } from "./app/modules/User/User.model";
import { VendorModel } from "./app/modules/Vendor/Vendor.model";
import { slugify } from "./app/utils/slugify";

const log = (message: string) => {
   
  console.log(message);
};

const seedAdmin = async () => {
  const existing = await UserModel.findOne({ email: config.admin.email });
  if (existing) return existing;

  const admin = await UserModel.create({
    name: config.admin.name,
    email: config.admin.email,
    password: config.admin.password,
    role: "admin",
  });
  log(`Admin created: ${admin.email} / ${config.admin.password}`);
  return admin;
};

const seedVendor = async (input: {
  name: string;
  email: string;
  shopName: string;
  brandName: string;
  description: string;
  address: string;
}) => {
  let user = await UserModel.findOne({ email: input.email });
  if (!user) {
    user = await UserModel.create({
      name: input.name,
      email: input.email,
      password: "vendor1234",
      role: "vendor",
      contactNumber: "01700000000",
    });
  }

  let vendor = await VendorModel.findOne({ userId: user._id });
  if (!vendor) {
    vendor = await VendorModel.create({
      userId: user._id,
      shopName: input.shopName,
      brandName: input.brandName,
      slug: slugify(input.shopName),
      description: input.description,
      address: input.address,
      contactNumber: "01700000000",
    });
  }

  log(`Vendor ready: ${input.email} / vendor1234 (${input.shopName})`);
  return vendor;
};

const seedCustomer = async () => {
  const email = "customer@shop.com";
  const existing = await UserModel.findOne({ email });
  if (existing) return existing;

  const customer = await UserModel.create({
    name: "Demo Customer",
    email,
    password: "customer1234",
    role: "customer",
    contactNumber: "01800000000",
    address: "Mirpur, Dhaka",
  });
  log(`Customer created: ${email} / customer1234`);
  return customer;
};

const main = async () => {
  await mongoose.connect(config.databaseUrl);
  log("Database connected");

  await seedAdmin();
  await seedCustomer();

  const categories = await Promise.all(
    ["Electronics", "Fashion", "Home & Kitchen"].map(async (name) => {
      const existing = await CategoryModel.findOne({ name });
      return existing || CategoryModel.create({ name, slug: slugify(name) });
    })
  );

  const vendorOne = await seedVendor({
    name: "Rahim Uddin",
    email: "vendor1@shop.com",
    shopName: "Rahim Electronics",
    brandName: "RahimTech",
    description: "Gadgets and accessories at a fair price",
    address: "Dhanmondi, Dhaka",
  });

  const vendorTwo = await seedVendor({
    name: "Karim Hossen",
    email: "vendor2@shop.com",
    shopName: "Karim Fashion House",
    brandName: "KFH",
    description: "Everyday fashion for the whole family",
    address: "Chittagong",
  });

  const products = [
    {
      vendorId: vendorOne._id,
      name: "Wireless Earbuds Pro",
      description: "Bluetooth 5.3 earbuds with charging case",
      price: 2500,
      discountPrice: 2200,
      stock: 25,
      categoryId: categories[0]._id,
      brand: "RahimTech",
      paymentOptions: "both" as const,
      deliveryCharge: 60,
    },
    {
      vendorId: vendorOne._id,
      name: "Smart Watch S10",
      description: "Fitness tracking smart watch with AMOLED display",
      price: 4500,
      stock: 10,
      categoryId: categories[0]._id,
      brand: "RahimTech",
      paymentOptions: "cod" as const,
      deliveryCharge: 80,
    },
    {
      vendorId: vendorTwo._id,
      name: "Cotton Panjabi",
      description: "Premium cotton panjabi for men",
      price: 1800,
      stock: 40,
      categoryId: categories[1]._id,
      brand: "KFH",
      paymentOptions: "cod" as const,
      deliveryCharge: 70,
    },
    {
      vendorId: vendorTwo._id,
      name: "Three Piece Set",
      description: "Soft fabric three piece set with dupatta",
      price: 2400,
      discountPrice: 2100,
      stock: 15,
      categoryId: categories[1]._id,
      brand: "KFH",
      paymentOptions: "both" as const,
      deliveryCharge: 70,
    },
  ];

  await Promise.all(
    products.map(async (product) => {
      const slug = slugify(product.name);
      const existing = await ProductModel.findOne({ slug });
      if (existing) return existing;
      return ProductModel.create({ ...product, slug, images: [] });
    })
  );
  log(`Seeded ${products.length} products`);

  await mongoose.disconnect();
  log("Seeding complete");
};

main().catch(async (error) => {
   
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
