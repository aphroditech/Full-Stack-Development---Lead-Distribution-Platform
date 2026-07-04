"use client";

import Image from "next/image";
import Link from "next/link";
import type { AdminUser } from "@/lib/api-types";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header({ user }: { user: AdminUser }) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] lg:hidden hover:dark:bg-[#FFFFFF1A]"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href="/" className="ml-2 2xsm:ml-4 max-[430px]:hidden">
          <Image
            src="/images/logo/logo-icon.svg"
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
          Lead Distribution
        </h1>
        <p className="font-medium">Admin dashboard</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 2xsm:gap-4">
        <ThemeToggleSwitch />
        <div className="shrink-0">
          <UserInfo user={user} />
        </div>
      </div>
    </header>
  );
}
