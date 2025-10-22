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
  { href: "/clients", title: "Client Periods", icon: "Calendar" },
  { href: "/upload", title: "Documents", icon: "Files" },
  { href: "/reports", title: "Reports", icon: "BarChart2" },
  { href: "/search", title: "Search", icon: "Search" },
  { href: "/webhooks", title: "Webhooks", icon: "Webhook" },
  { href: "/team", title: "Team", icon: "Users" },
  { href: "/settings", title: "Settings", icon: "Settings" },
];

const accountantMenuItems = [
  { href: "/", title: "Dashboard", icon: "LayoutDashboard" },
  { href: "/accountants/dashboard", title: "Clients", icon: "Users" },
  { href: "/clients", title: "Client Periods", icon: "Calendar" },
  { href: "/upload", title: "Documents", icon: "Files" },
  { href: "/reports", title: "Reports", icon: "BarChart2" },
  { href: "/search", title: "Search", icon: "Search" },
  { href: "/webhooks", title: "Webhooks", icon: "Webhook" },
  { href: "/settings", title: "Settings", icon: "Settings" },
];

export const Sidebar = async ({ children }: SidebarProperties) => {
  const { has } = await auth();
  const isClient = has({ role: "clients" });
  const isAccountant = has({ role: "accountants" });

  // Default to client menu items if no role is found
  const menuItems = isClient
    ? clientMenuItems
    : isAccountant
    ? accountantMenuItems
    : clientMenuItems;

  // Now you are passing a serializable array of plain objects.
  return <GlobalSidebarUI menuItems={menuItems}>{children}</GlobalSidebarUI>;
};
