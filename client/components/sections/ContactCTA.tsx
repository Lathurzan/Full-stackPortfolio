import Link from "next/link";
import { Mail } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 to-violet-600/20 p-10 text-center md:p-16">
        <h2 className="text-3xl font-bold md:text-5xl">
          Let’s build something useful.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-slate-300">
          I am open to graduate software engineering, full-stack development,
          backend development, and AI-focused developer roles.
        </p>

        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
        >
          Contact Me <Mail className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}