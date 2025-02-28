"use client";

import { signOut } from "next-auth/react";
import { Button } from "@workspace/ui/components/button";

const LogoutButton:React.FC = () => {
  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      Logout
    </Button>
  );
}

export default LogoutButton;