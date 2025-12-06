import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/app/lib/app_store";
import { Nav } from "@/app/components/Nav";

export const metadata: Metadata = {
  title: "Prompt Keyword Mixer",
  description: "Mix and match keywords to generate AI prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 pb-20">
        <StoreProvider>
          <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl min-h-[100dvh] relative">
            {children}
            <Nav />
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
