import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format").max(100), // Remove min length for email, increase max
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

export const SigninSchema = z.object({
  email: z.string().email("Invalid email format").max(100), // Remove min length for email, increase max
  password: z.string().min(1, "Password is required"),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(20),
});
