"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import React from "react";

type Props = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

export default function LearnMoreLink({ href, className = "", children }: Props) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // client-side navigation to keep SPA behavior
    router.push(href);
  };

  return (
    <button onClick={onClick} className={"inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 " + className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
