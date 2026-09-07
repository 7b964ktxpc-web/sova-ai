import type { Metadata } from "next";
import Link from "next/link";
import { Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "SOVA AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SOVA AI</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
