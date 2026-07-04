"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { logoutAction } from "@/lib/auth-actions";
import type { AdminUser } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LogOutIcon, UserIcon } from "./icons";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserInfo({ user }: { user: AdminUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
    // Hard navigation ensures the login page loads fresh and interactive.
    window.location.href = "/login";
  }

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="cursor-pointer rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <Avatar name={user.name} />
          <figcaption className="flex items-center gap-1 font-medium text-dark max-[1024px]:sr-only dark:text-dark-6">
            <span className="max-w-24 truncate">{user.name}</span>
            <ChevronUpIcon
              aria-hidden
              className={cn("rotate-180 transition-transform", isOpen && "rotate-0")}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md min-[230px]:min-w-70 dark:border-dark-3 dark:bg-gray-dark"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Avatar name={user.name} />
          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">{user.name}</div>
            <div className="w-full max-w-47.5 truncate leading-none text-gray-6">
              {user.email}
            </div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.25 outline-0 ring-primary hover:bg-gray-2 hover:text-dark focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <LogOutIcon />
            <span className="text-base font-medium">
              {loggingOut ? "Logging out..." : "Log out"}
            </span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-full border bg-primary/10 text-base font-semibold text-primary outline-none dark:border-dark-4">
      {initials(name) || <UserIcon />}
    </span>
  );
}
