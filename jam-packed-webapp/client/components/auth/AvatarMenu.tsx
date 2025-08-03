"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu";
import { userCtx } from "~/client/modules/user-context";
import { Avatar } from "./Avatar";

export default function AvatarMenu({ className }: { className?: string }) {
  const user = userCtx((ctx) => ctx.user);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Avatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
