const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./src/models/Admin");

const MONGO_URI =
  "mongodb+srv://campusadmin:campus123@cluster0.n0yhfdk.mongodb.net/campus-shield?retryWrites=true&w=majority&appName=Cluster0";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await Admin.create({
      username: "admin",
      password: hashedPassword,
    });

    console.log("Admin created:", admin.username);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
