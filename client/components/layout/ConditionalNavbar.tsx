"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide the global site navbar for any admin routes
  if (typeof pathname === "string" && pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}
