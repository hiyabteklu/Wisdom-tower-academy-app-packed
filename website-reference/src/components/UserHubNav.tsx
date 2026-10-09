"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShoppingBag, User, GraduationCap, Package } from "lucide-react";
import { IS_FREE_MODE } from "@/lib/ownership";

const allQuick = [
  { href: "/learning", label: "My Learning", icon: GraduationCap },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingBag, isCart: true },
  { href: "/account", label: "Account", icon: User },
  { href: "/academy", label: "Pathways", icon: BookOpen },
];

export default function UserHubNav() {
  const pathname = usePathname() || "/";
  const quick = allQuick.filter((q) => !q.isCart || !IS_FREE_MODE);

  return (
    <div className="mb-8">
      <nav className="flex flex-wrap gap-2" aria-label="Academy student links">
        {quick.map((q) => {
          const active = pathname === q.href || pathname.startsWith(q.href + "/");
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className={`inline-flex items-center gap-2 min-h-[2.75rem] px-3.5 rounded-xl text-sm font-semibold border transition ${
                active
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-wisdom-muted hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {q.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
