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
          className="
            group flex w-full items-center 
            gap-3 rounded-md px-3 py-2 text-sm font-medium 
            hover:bg-muted transition-colors data-[state=open]:bg-muted
            group-data-[collapsed=true]:justify-center 
            group-data-[collapsed=true]:gap-0
          "
        >
          <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground" />

          <div className="flex flex-col text-left group-data-[collapsed=true]:hidden">
            <span className="font-medium leading-tight">SIMASJID</span>
            <span className="text-xs text-muted-foreground leading-none">
              Dashboard
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
