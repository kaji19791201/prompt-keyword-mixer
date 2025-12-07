"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Sparkles, History } from "lucide-react";
import { cn } from "@/app/components/ui/button";

export function Nav() {
    const pathname = usePathname();

    const links = [
        {
            href: "/",
            label: "Mixer",
            icon: Sparkles,
        },
        {
            href: "/history",
            label: "History",
            icon: History,
        },
        {
            href: "/manage",
            label: "Manage",
            icon: Settings,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-md pb-safe">
            <div className="flex h-16 items-center justify-around">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-slate-900"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Icon className="h-6 w-6" />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
