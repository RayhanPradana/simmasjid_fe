"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuClick = (url) => {
    if (url) {
      router.push(url); // Navigasi ke halaman tujuan
    }
  };

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              onClick={() => handleMenuClick(item.url)}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-gray-200 text-green-600"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              {item.icon && (
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-green-600" : "text-gray-500"
                  }`}
                />
              )}
              <span className="ml-2">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
