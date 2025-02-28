"use client";

import { useState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface SendMoneyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export function SendMoneyDialog({
  isOpen,
  onClose,
  user,
}: SendMoneyDialogProps) {
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSendMoney = async () => {
    const senderEmail = session?.user?.email;
    const recipientEmail = user.email;

    if (!senderEmail) {
      console.error("Sender email not found in session");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/wallet/transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "TRANSFER",
            amount: parseFloat(amount),
            email: senderEmail,
            recipientEmail: recipientEmail,
            description: `Transfer to ${user.name}`,
          }),
        });

        if (response.ok) {
          onClose();
          // Show success toast
          toast.success("Transaction Successful");
          router.refresh();
        } else {
          const errorData = await response.json();
          // Show error toast
          toast.error("Transaction failed");
        }
      } catch (error) {
        console.error("Error during transaction:", error);
        // Show error toast
        toast.error("Transaction Failed");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Money to {user.name}</DialogTitle>
          <DialogDescription>
            Enter the amount you want to send.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSendMoney} disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
