import type { ComponentType } from "react";
import * as Icons from "../icons";

type NavSubItem = { title: string; url: string };

type NavItem = {
  title: string;
  url?: string;
  icon: ComponentType<any>;
  items: NavSubItem[];
};

type NavSection = { label: string; items: NavItem[] };

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      { title: "Dashboard", url: "/", icon: Icons.HomeIcon, items: [] },
      { title: "Brokers", url: "/brokers", icon: Icons.User, items: [] },
      { title: "Lead Form", url: "/form", icon: Icons.Alphabet, items: [] },
      { title: "Distribution", url: "/distribution", icon: Icons.FourCircle, items: [] },
      { title: "Leads", url: "/leads", icon: Icons.Table, items: [] },
    ],
  },
];
