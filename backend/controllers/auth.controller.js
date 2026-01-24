import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../config/token.js";

const cookieOptions = {
  httpOnly: true,               
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000 
};

// ---------------- SIGNUP ----------------
export const sighUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });

    const token = generateToken(user);

    
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "Signup successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    
    res.cookie("token", token, cookieOptions);

    res.json({
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// ---------------- LOGOUT ----------------
export const logOut = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};
