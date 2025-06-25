"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

export function TransactionListSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between py-4 gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-4 mt-4">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}