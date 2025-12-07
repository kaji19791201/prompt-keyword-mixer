"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/app/lib/app_store";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <StoreProvider>{children}</StoreProvider>
        </SessionProvider>
    );
}
