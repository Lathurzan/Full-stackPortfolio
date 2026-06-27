import { notFound } from "next/navigation";

const blogs = [
  {
    slug: "building-scalable-mern-applications",
    title: "Building Scalable MERN Applications",
    content:
      "A scalable MERN application should have clean separation between frontend, backend, database, validation, authentication, and deployment layers.",
  },
  {
    slug: "ai-integration-modern-web-apps",
    title: "AI Integration in Modern Web Applications",
    content:
      "AI integration should be handled through a backend service layer to protect API keys, manage prompts, validate inputs, and control response formatting.",
  },
];

interface Props {
  params: {
    slug: string;
  };
}

export default function BlogDetailsPage({ params }: Props) {
  const blog = blogs.find((item) => item.slug === params.slug);

  if (!blog) return notFound();

  return (
    <section className="min-h-screen px-6 py-24 md:px-12 lg:px-24">
      <article className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Blog
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          {blog.title}
        </h1>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <p className="text-lg leading-8 text-slate-400">
            {blog.content}
          </p>
        </div>
      </article>
    </section>
  );
}