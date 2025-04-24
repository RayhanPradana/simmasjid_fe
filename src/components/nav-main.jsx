"use client";

import React from "react"; 
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  const [activeMenu, setActiveMenu] = React.useState(null);

  const handleMenuClick = (index) => {
    setActiveMenu(index === activeMenu ? null : index); 
  };

  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <div key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleMenuClick(index)} 
              className={`${
                activeMenu === index
                  ? "shadow-lg bg-gray-200 text-green-600"
                  : "hover:bg-gray-100"
              } flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out`}
            >
              {item.icon && <item.icon className="w-5 h-5" />} 
              <span className="ml-2">{item.title}</span> 
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      ))}
    </SidebarMenu>
  );
}
