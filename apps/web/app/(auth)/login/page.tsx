"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth";
import { Loader } from "@/components/common";
import { useRouter } from "next/navigation"; // Import useRouter
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter(); // Use the useRouter hook
  const { data: session, status } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 100); 

    if (status === "authenticated") {
      router.push("/dashboard");
    }

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div>
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <LoginForm isLoading={false} />
      )}
    </div>
  );
}
