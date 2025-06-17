"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Banknote } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type Transaction = {
  id: number;
  type: "deposit" | "withdraw" | "transfer";
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  description: string;
  timestamp: string;
  bankName: string | null;
  accountNumber: string | null;
  senderName: string | null;
  recipientName: string | null;
};

const getTransactionDetails = (transaction: Transaction) => {
  const { type, recipientName, senderName, bankName } = transaction;

  if (type === "deposit") {
    return {
      isIncoming: true,
      icon: Banknote,
      title: "Deposit",
      subtitle: `From ${bankName}`,
    };
  }

  if (type === "withdraw") {
    return {
      isIncoming: false,
      icon: Banknote,
      title: "Withdrawal",
      subtitle: `From ${bankName}`,
    };
  }

  if (type === "transfer") {
    const isIncoming = recipientName === "You";
    return {
      isIncoming,
      icon: isIncoming ? ArrowDownLeft : ArrowUpRight,
      title: isIncoming ? `From ${senderName}` : `To ${recipientName}`,
      subtitle: transaction.description || "Peer Transfer",
    };
  }
  
  return {
    isIncoming: false,
    icon: Banknote,
    title: "Transaction",
    subtitle: "Unknown transaction type"
  }
};

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const { isIncoming, icon: Icon, title, subtitle } = getTransactionDetails(transaction);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(transaction.amount);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors duration-200"
    >
      <div className="flex-shrink-0">
        <span className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isIncoming ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"
        )}>
          <Icon className={cn(
              "h-5 w-5",
              isIncoming ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{subtitle}</p>
      </div>
      <div className="text-right">
         <p className={cn(
            "font-bold text-md",
            isIncoming ? "text-green-600 dark:text-green-400" : "text-zinc-800 dark:text-zinc-200"
         )}>
           {isIncoming ? "+" : "-"}
           {formattedAmount}
         </p>
         <p className="text-xs text-zinc-500 dark:text-zinc-400">
           {new Date(transaction.timestamp).toLocaleDateString()}
         </p>
      </div>
    </motion.div>
  );
};