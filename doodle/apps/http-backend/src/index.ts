import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

// More specific CORS configuration
app.use(cors());

// Remove global middleware
// app.use(middleware);

// FIXED SIGNUP ENDPOINT
app.post("/signup", async (req: Request, res: Response) => {
  console.log("Signup request body:", req.body);

  const parsedData = CreateUserSchema.safeParse(req.body);
  console.log("Parsed data:", parsedData);
  if (!parsedData.success) {
    console.log("Validation error:", parsedData.error);
    res.status(400).json({
      success: false,
      message: "Incorrect inputs",
    });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    console.log("Creating user with email:", parsedData.data.email);

    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });

    console.log("User created successfully:", user.id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      userId: user.id,
    });
  } catch (e) {
    console.error("Database error:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
});

// FIXED SIGNIN ENDPOINT
app.post("/signin", async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      success: false,
      message: "Incorrect inputs",
    });
    return;
  }

  try {
    // First, find the user by email
    const user = await prismaClient.user.findUnique({
      where: {
        email: parsedData.data.email,
      },
    });

    if (!user) {
      res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Then compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isMatch) {
      res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );

    res.json({
      success: true,
      token,
      userId: user.id,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Protected routes - apply middleware here
app.post("/room", middleware, async (req: Request, res: Response) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      success: false,
      message: "Incorrect inputs",
    });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - No user ID found",
    });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      success: true,
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      success: false,
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:roomId", middleware, async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    console.log(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 1000,
    });

    res.json({
      success: true,
      messages,
    });
  } catch (e) {
    console.log(e);
    res.json({
      success: false,
      messages: [],
    });
  }
});

// GET ROOM ENDPOINT
app.get("/room/:slug", middleware, async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const room = await prismaClient.room.findUnique({
      where: {
        slug,
      },
    });

    res.json({
      success: true,
      room,
    });
  } catch (e) {
    console.error("Get room error:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

//user rooms endpoint
app.get("/user/rooms", middleware, async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: userId,
      },
    });

    res.json({
      success: true,
      rooms,
    });
  } catch (e) {
    console.error("Get user rooms error:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
