"use client";

import * as React from "react";
import {
  Wallet,
  ArrowLeftRight,
  Receipt,
  Users2,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@workspace/ui/components/button";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function AppSidebar({ setActivePage, activePage }: any) {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navItems = [
    {
      title: "Transfer",
      icon: ArrowLeftRight,
      url: "#",
      page: "transfer",
    },
    {
      title: "Transaction",
      icon: Receipt,
      url: "#",
      page: "transaction",
    },
    {
      title: "P2P Transfer",
      icon: Users2,
      url: "#",
      page: "p2p",
    },
  ];

  const user = session?.user;
  const userName = user?.name || "John Doe";
  const userEmail = user?.email || "john@example.com";
  const userImage = user?.image;

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const iconVariants = {
    normal: {
      color: theme === "dark" ? "#D1D5DB" : "#4B5563", // Light gray in dark mode, dark gray in light mode
    },
    active: {
      color: theme === "dark" ? "#FFFFFF" : "#000000", // White in dark mode, black in light mode
    },
  };

  const textVariants = {
    normal: {
      color: theme === "dark" ? "#D1D5DB" : "#4B5563",
    },
    active: {
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    },
  };

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <motion.div whileTap={{ scale: 0.95 }}>
              <SidebarMenuButton size="lg" className="gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Wallet className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-semibold tracking-tight">
                    PayFlow
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Payment Made Easy
                  </span>
                </div>
              </SidebarMenuButton>
            </motion.div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileTap={{ scale: 0.95 }}
              >
                <SidebarMenuButton
                  onClick={() => {
                    setActivePage(item.page);
                  }}
                  className={`group gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground  ${
                    activePage === item.page
                      ? "bg-muted text-muted-foreground dark:bg-muted/70 dark:text-white"
                      : ""
                  }`}
                >
                  <motion.div
                    variants={iconVariants}
                    initial="normal"
                    animate={activePage === item.page ? "active" : "normal"}
                    className="flex size-10 items-center justify-center rounded-lg"
                  >
                    <item.icon className="size-5" />
                  </motion.div>
                  <motion.span
                    variants={textVariants}
                    initial="normal"
                    animate={activePage === item.page ? "active" : "normal"}
                    className="font-medium"
                  >
                    {item.title}
                  </motion.span>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <SidebarMenuButton className="gap-3 rounded-lg py-[20px] hover:bg-muted/80">
                    <Avatar className="size-8 border-2 border-muted">
                      <AvatarImage src={userImage ?? ""} />
                      <AvatarFallback>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-semibold">{userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80"
                align="start"
                alignOffset={-20}
                forceMount
              >
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="size-14 border-2 border-muted">
                      <AvatarImage src={userImage ?? ""} />
                      <AvatarFallback>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold leading-none">
                        {userName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 py-2">
                  <User className="size-5" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2">
                  <Settings className="size-5" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2" onClick={toggleTheme}>
                  {theme === "light" ? (
                    <>
                      <Moon className="size-5" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="size-5" />
                      <span>Light Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="gap-3 py-2 text-red-600 dark:text-red-500"
                >
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="size-5" />
                    <span>Logout</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
