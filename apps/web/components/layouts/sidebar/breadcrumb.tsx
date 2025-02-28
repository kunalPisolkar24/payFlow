
"use client";

import { useEffect, useState } from "react";
import { Separator } from "@workspace/ui/components/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { ChevronRight, Menu } from "lucide-react";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type HeaderProps = {
  activePage: string;
};

export function Header({ activePage }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getBreadcrumbItems = () => {
    const breadcrumbItems: Array<{ label: string; href: string }> = [];
    breadcrumbItems.push({
      label: "Dashboard",
      href: "/dashboard",
    });

    let activeLabel = "";
    switch (activePage) {
      case "transfer":
        activeLabel = "Transfer";
        break;
      case "transaction":
        activeLabel = "Transaction";
        break;
      case "p2p":
        activeLabel = "P2P Transfer";
        break;
      default:
        activeLabel = "Transfer"; // Default label
    }

    breadcrumbItems.push({
      label: activeLabel,
      href: `/dashboard/${activePage}`, // Still create a URL, even if it's not used for routing
    });
    return breadcrumbItems;
  };

  if (!mounted) {
    return null;
  }

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <Menu className="size-5" />
        </SidebarTrigger>
        <Separator orientation="vertical" className="h-6" />
        <Breadcrumb>
          <BreadcrumbList>
            {/* First item (Dashboard) */}
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sm font-medium">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {/* Separator as its own item */}
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5" />
            </BreadcrumbSeparator>
            
            {/* Active page item */}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium">
                {breadcrumbItems[1]?.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}