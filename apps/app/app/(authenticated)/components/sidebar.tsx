// app/(authenticated)/components/sidebar.tsx

import type { ReactNode } from "react";
import { GlobalSidebarUI } from "./globalsidebar";

import { auth } from "@clerk/nextjs/server";
type SidebarProperties = {
  readonly children: ReactNode;
};

// Change the 'icon' property from a component to a string name.
const clientMenuItems = [
  { href: "/", title: "Dashboard", icon: "LayoutDashboard" },
  { href: "/upload", title: "Documents", icon: "Files" },
  { href: "/reports", title: "Reports", icon: "BarChart2" },
  { href: "/team", title: "Team", icon: "Users" },
  { href: "/settings", title: "Settings", icon: "Settings" },
];

const accountantMenuItems = [
  { href: "/", title: "Dashboard", icon: "LayoutDashboard" },
  { href: "/clients", title: "Clients", icon: "Users" },
  { href: "/upload", title: "Documents", icon: "Files" },
  { href: "/reports", title: "Reports", icon: "BarChart2" },
  { href: "/settings", title: "Settings", icon: "Settings" },
];

export const Sidebar = async ({ children }: SidebarProperties) => {
  const { has } = await auth();
  const isClient = has({ role: "clients" });
  const isAccountant = has({ role: "accountants" });

  const menuItems = isClient
    ? clientMenuItems
    : isAccountant
    ? accountantMenuItems
    : [];

  // Now you are passing a serializable array of plain objects.
  return <GlobalSidebarUI menuItems={menuItems}>{children}</GlobalSidebarUI>;
};
