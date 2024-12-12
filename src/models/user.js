import mongoose from "mongoose";
import bcrypt from "bcrypt";

// base user Schema
const userSchema = new mongoose.Schema({
    name: {type: String},
    role: {
        type: String,
        enum: ["Customer","Admin","DeliveryPartner"],
        require: true,
    },
    isActivated: {type: Boolean,default: false},
});

// Customer
const customerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Thêm trường password
    role: { type: String, enum: ["Customer"], default: "Customer" },
    liveLocation: {
        latitude: { type: Number , required: false},
        longitude: { type: Number, required: false},
    },
    address: { type: String },
});


// Middleware mã hóa mật khẩu trước khi lưu
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Thêm phương thức comparePassword vào Customer Schema
customerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const Customer = mongoose.model("Customer", customerSchema);

// Delivery Partner Schema
const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: Number, required: true},
    role: {type: String, enum: ["DeliveryPartner"], default: "DeliveryPartner"},
    liveLocation: {
        latitude: {type: Number},
        longitude: {type: Number},
    },
    address: {type: String},
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        default: null,
    },
});

export const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["Admin"], default: "Admin"},
});
// Thêm phương thức comparePassword vào DeliveryPartner Schema
deliveryPartnerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const Admin = mongoose.model("Admin", adminSchema);
