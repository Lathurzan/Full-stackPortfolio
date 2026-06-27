import Link from "next/link";

const blogs = [
  {
    slug: "building-scalable-mern-applications",
    title: "Building Scalable MERN Applications",
    description:
      "Architecture patterns, APIs, authentication, and deployment strategies.",
  },
  {
    slug: "ai-integration-modern-web-apps",
    title: "AI Integration in Modern Web Applications",
    description:
      "Using OpenAI and Gemini APIs in production-ready systems.",
  },
];

export default function BlogPage() {
  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Blog
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Engineering articles & notes
        </h1>

        <div className="mt-16 space-y-6">
          {blogs.map((blog) => (
            <Link
              href={`/blog/${blog.slug}`}
              key={blog.slug}
              className="block rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition hover:border-blue-500/60"
            >
              <h2 className="text-2xl font-bold">{blog.title}</h2>
              <p className="mt-4 text-slate-400">{blog.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}