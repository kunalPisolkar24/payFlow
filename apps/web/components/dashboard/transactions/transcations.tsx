"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { TransactionListSkeleton } from "@/components/skeletons";
import { Transaction, TransactionItem } from "./transcation-item";

const PAGE_SIZE = 8;

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions
    .filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      const { description, senderName, recipientName, type } = transaction;
      return (
        description?.toLowerCase().includes(searchLower) ||
        senderName?.toLowerCase().includes(searchLower) ||
        recipientName?.toLowerCase().includes(searchLower) ||
        type.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filter by type, name, or description..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <TransactionListSkeleton />
      ) : (
        <div className="relative">
          <AnimatePresence>
            {paginatedTransactions.length > 0 ? (
              <motion.div className="space-y-3">
                {paginatedTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                <p className="font-semibold">No transactions found.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4 mt-4">
            <span className="text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
            </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}