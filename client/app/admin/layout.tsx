import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        <AdminNavbar />
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}