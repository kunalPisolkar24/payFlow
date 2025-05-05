"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { UserAvatar } from "@/components/common";
import { SendMoneyDialog } from "./send-money-dialog";
import { useTheme } from "next-themes";

interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
}

const INITIAL_DISPLAY_COUNT = 3;

export function SendMoney() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const displayedUsers = useMemo(() => {
    if (searchTerm === "") {
      return users.slice(0, INITIAL_DISPLAY_COUNT);
    }
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  const handleSend = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <Card
      className={`w-[900px] ${
        theme === "dark" ? "text-zinc-50 bg-zinc-950" : "text-zinc-900 bg-white"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`text-2xl font-semibold ${
            theme === "dark" ? "text-zinc-50" : "text-zinc-900"
          }`}
        >
          Send Money
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2  ${
              theme === "dark" ? "text-zinc-400" : "text-zinc-500"
            }`}
             aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            className={`pl-10 ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-400 focus-visible:ring-zinc-300"
                : "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-zinc-950"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="min-h-[200px]"> 
          <AnimatePresence mode="wait">
            {displayedUsers.length > 0 ? (
              <motion.ul
                key="user-list"
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {displayedUsers.map((user) => (
                  <motion.li
                    layout
                    key={user.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                  >
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark"
                          ? "bg-zinc-900 hover:bg-zinc-800/60"
                          : "bg-zinc-50 hover:bg-zinc-100"
                      } transition-colors duration-150`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <UserAvatar name={user.name} image={user.image} />
                        <div className="flex flex-col overflow-hidden">
                            <span
                              className={`font-medium truncate ${
                                theme === "dark" ? "text-zinc-100" : "text-zinc-900"
                              }`}
                            >
                              {user.name}
                            </span>
                             <span
                              className={`text-xs truncate ${
                                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                              }`}
                            >
                              {user.email}
                            </span>
                        </div>

                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSend(user)}
                        className={`${
                          theme === "dark"
                            ? "bg-zinc-800 text-zinc-50 hover:bg-zinc-700"
                            : "bg-zinc-900 text-zinc-50 hover:bg-zinc-700"
                        } flex-shrink-0`} // Prevent button shrinking
                      >
                        <Send
                          className="h-4 w-4 md:mr-2"
                          aria-hidden="true"
                        />
                       <span className="hidden md:inline">Send</span>
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              searchTerm && (
                <motion.div
                  key="no-users"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <p
                    className={`text-center mt-8 text-sm ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    No users found matching "{searchTerm}".
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      {selectedUser && (
        <SendMoneyDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          user={selectedUser}
        />
      )}
    </Card>
  );
}