import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  // categories may be sent as an array of strings
  categories: z.array(z.string()).optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  status: z.enum(["Draft", "Published", "Featured"]),
});