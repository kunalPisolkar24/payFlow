"use client";

import { motion } from 'framer-motion';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { WalletCardSkeleton } from '@/components/skeletons';

export function WalletCard() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/wallet/balance?email=${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            setBalance(data.balance);
          } else {
            setBalance("0.00");
          }
        } catch (error) {
          setBalance("0.00");
        }
      }
    };

    if (mounted && session?.user?.email) {
      fetchBalance();
    }
  }, [session, mounted]);

  if (!mounted || balance === null) {
    return <WalletCardSkeleton />;
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto ${
        theme === "dark" ? "text-zinc-50" : "text-zinc-900"
      }`}
    >
      <CardHeader className="space-y-1">
        <CardTitle
          className={`text-2xl font-semibold ${
            theme === "dark" ? "text-zinc-50" : "text-zinc-900"
          }`}
        >
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <motion.div
          className={`flex items-center space-x-4 rounded-md border p-4 ${
            theme === "dark" ? "border-zinc-700" : "border-zinc-200"
          }`}
          whileHover={{
            backgroundColor:
              theme === "dark" ? "hsl(var(--muted))" : "hsl(var(--muted))",
          }}
          transition={{ duration: 0.2 }}
        >
          <Wallet
            className={`h-8 w-8 ${
              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
            }`}
          />
          <div className="flex-1 space-y-1">
            <Label
              className={` ${
                theme === "dark" ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              Current Balance
            </Label>
            <motion.p
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-zinc-50" : "text-zinc-900"
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {`$${parseFloat(balance).toFixed(2)}`}
            </motion.p>
          </div>
        </motion.div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${
            theme === "dark" ? "text-zinc-950" : "text-zinc-50 "
          }`}
          asChild
        >
          <motion.a
            href="#"
            className="inline-flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Transactions
            <ArrowRight
              className={`ml-2 h-4 w-4 ${
                theme === "dark" ? "text-zinc-950" : "text-zinc-50"
              }`}
            />
          </motion.a>
        </Button>
      </CardFooter>
    </Card>
  );
}
