export interface Project {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  stack: string[];
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: "draft" | "published";
}