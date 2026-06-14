import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateInterviewSchema = z.object({
  candidate_email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  department: z.string().optional(),
  type: z.enum(["TECHNICAL", "HR", "MANAGERIAL", "CULTURE_FIT", "FINAL_ROUND"]),
  mode: z.enum(["ONLINE", "IN_PERSON", "PHONE"]),
  date: z.string().refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d > new Date();
  }, {
    message: "Interview date must be in the future",
  }),
  duration_min: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().min(15, "Duration must be at least 15 mins").max(240, "Duration cannot exceed 240 mins")
  ),
  interviewer: z.string().optional(),
  meeting_link: z.string().url("Invalid URL").or(z.literal("")).optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const CreateNoticeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  body: z.string().min(10, "Body must be at least 10 characters").max(5000),
  type: z.enum(["GENERAL", "REMINDER", "UPDATE", "IMPORTANT", "HOLIDAY"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});
