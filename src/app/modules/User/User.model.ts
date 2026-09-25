import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import { config } from "../../../config";
import { IUserDocument } from "./User.interface";

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contactNumber: { type: String },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "vendor", "customer"], required: true },
    address: { type: String },
    profileImage: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  next();
});

UserSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

UserSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.password;
    return ret;
  },
});

export const UserModel = model<IUserDocument>("User", UserSchema);
