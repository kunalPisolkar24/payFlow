"use client";

import { Moon, Sun, Wallet2, Menu } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Wallet2 className="h-6 w-6" />
          <Link href="/" className="flex items-center">
            <span className="font-bold">PayFlow</span>
          </Link>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden mx-auto lg:flex items-center space-x-8">
          <Link
            href="#"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Documentation
          </Link>
          <Link
            href="#"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="#"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>

        {/* Right Section - Auth & Theme Toggle */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden lg:flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Login Button */}
          <Button variant="outline" className="rounded-xl h-[35px] hidden lg:flex" asChild>
            <Link href="/login">Login</Link>
          </Button>

          <Button className="rounded-xl h-[35px] hidden lg:flex" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTitle hidden></SheetTitle>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link
                  href="#"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href="#"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
                <Link
                  href="#"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  About
                </Link>
                <Link
                  href="#"
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  Contact
                </Link>
                <div className="flex flex-col space-y-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-10"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


