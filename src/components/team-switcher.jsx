"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="
            group flex w-full items-center 
            gap-3 rounded-md px-3 py-2 text-sm font-medium 
            hover:bg-muted transition-colors data-[state=open]:bg-muted
            group-data-[collapsed=true]:justify-center 
          "
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
            <BookOpen className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsed=true]:hidden">
            <span className="truncate font-semibold">SIMASJID</span>
            <span className="truncate text-xs text-muted-foreground">Dashboard</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}