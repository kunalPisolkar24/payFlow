"use client";

import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/layouts";
import { useState, useEffect } from "react";
import { Header } from "@/components/layouts";
import { TransferPage as TransferComponent } from "@/components/dashboard";
import { TransactionPage as TransactionComponent } from "@/components/dashboard";
import { P2PPage as P2PComponent } from "@/components/dashboard";
import { Loader } from "@/components/common"; 
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function Dashboard() {
  const [activePage, setActivePage] = useState("transfer");
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter();
  const {data: session, status } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    if(status != "authenticated" && session) {
      router.push("/");
    }

    return () => clearTimeout(timer);
  }, [status]);

  const renderActivePage = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      );
    }

    switch (activePage) {
      case "transfer":
        return <TransferComponent />;
      case "transaction":
        return <TransactionComponent />;
      case "p2p":
        return <P2PComponent />;
      default:
        return <TransferComponent />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar setActivePage={setActivePage} activePage={activePage} />
      <SidebarInset className="flex w-full flex-col">
        <Header activePage={activePage} />
        {renderActivePage()}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
