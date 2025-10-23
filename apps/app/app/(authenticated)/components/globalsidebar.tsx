"use client";

import { OrganizationSwitcher, UserButton } from "@repo/auth/client";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/design-system/components/ui/sidebar";
import { NotificationsTrigger } from "@repo/notifications/components/trigger";
// 1. Import all the icons you'll need from lucide-react.
import {
  BarChart2,
  Calendar,
  Files,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  Webhook,
  UploadCloud,
  Inbox,
  type LucideProps,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

// 2. Create a map of string names to the actual icon components.
const iconMap: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard,
  Inbox,
  Calendar,
  Files,
  BarChart2,
  Search,
  Webhook,
  Users,
  Settings,
  UploadCloud,
};

// 3. Update the MenuItem type to accept a string for the icon.
//    Using `keyof typeof iconMap` ensures type safety.
type MenuItem = {
  href: string;
  title: string;
  icon: keyof typeof iconMap;
};

type GlobalSidebarUIProperties = {
  readonly children: ReactNode;
  readonly menuItems: readonly MenuItem[];
};

export const GlobalSidebarUI = ({
  children,
  menuItems,
}: GlobalSidebarUIProperties) => {
  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: "flex overflow-hidden w-full",
                    userButtonBox: "flex-row-reverse",
                    userButtonOuterIdentifier: "truncate pl-0",
                  },
                }}
              />
              <div className="flex shrink-0 items-center gap-px">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <div className="h-4 w-4">
                    <NotificationsTrigger />
                  </div>
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              // 4. Look up the component from the map using the string name.
              const IconComponent = iconMap[item.icon];
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      {/* Render the dynamically selected icon component */}
                      {IconComponent && <IconComponent />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
