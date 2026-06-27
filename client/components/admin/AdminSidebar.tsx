import Link from "next/link";

const links = [
  { name: "Dashboard", href: "/admin" },
  { name: "Profile", href: "/admin/profile" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Blogs", href: "/admin/blogs" },
  { name: "Messages", href: "/admin/messages" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "About", href: "/admin/about" },
  { name: "Case Studies", href: "/admin/casestudies" },
  { name: "Skills", href: "/admin/skills" },
  { name: "Work Experience", href: "/admin/work-experience" },
  { name: "Resume", href: "/admin/resume" }
];

export default function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-800 bg-slate-950 p-6 lg:block">
      <h2 className="mb-10 text-2xl font-bold">
        Admin<span className="text-blue-500">.</span>
      </h2>

      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}