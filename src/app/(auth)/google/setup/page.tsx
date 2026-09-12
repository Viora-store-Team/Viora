"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleSetupPage() {
  const router = useRouter();

  useEffect(() => {
    // توجيه تلقائي ومباشر إلى خطوات التسجيل الأساسية
    router.replace("/register/step1");
  }, [router]);

  return null;
}
