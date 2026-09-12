"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { ToastProvider } from "@/context/ToastContext";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Check if current route is an Auth page where Nav and Footer should be hidden
  const isAuthPage = pathname
    ? pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/verify-email") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/google")
    : false;

  return (
    <ToastProvider>
      {isAuthPage ? (
        <main className="flex-1 w-full min-h-screen">{children}</main>
      ) : (
        <>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </>
      )}
    </ToastProvider>
  );
}
