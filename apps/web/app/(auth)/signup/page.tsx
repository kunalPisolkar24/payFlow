"use client";

import { useState, useEffect } from "react";
import { SignUpForm } from "@/components/auth";
import { Loader } from "@/components/common";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 100); 

    if (status === "authenticated") {
      router.push("/dashboard"); 
    }

    return () => clearTimeout(timer);
  }, [status, session, router]);

  return (
    <div>
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <SignUpForm isLoading={false} />
      )}
    </div>
  );
}
