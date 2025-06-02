"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Wallet,
  CalendarCheck,
  CalendarDays,
  Newspaper,
  Building,
  ClipboardCheck,
  Clipboard,
  Book,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState({
    name: "Guest",
    email: "guest@simasjid.com",
    avatar: "/avatars/default.jpg",
  });
  
  const [expandedItems, setExpandedItems] = React.useState({});
  const [activeItem, setActiveItem] = React.useState("");
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const toggleExpand = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Handle navigation with transition
  const handleNavigation = (url) => {
    setIsNavigating(true);
    setActiveItem(url);
    
    // Small delay to allow for animations
    setTimeout(() => {
      router.push(url);
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }, 150);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  React.useEffect(() => {
    // Auto-expand parent menu when a child is active based on URL
    navItems.forEach(item => {
      if (item.items && item.items.length > 0) {
        const hasActiveChild = item.items.some(subItem => pathname === subItem.url);
        if (hasActiveChild) {
          setExpandedItems(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
    
    // Set active item based on current URL
    setActiveItem(pathname);
  }, [pathname]);

  React.useEffect(() => {
    // Wait for component to mount before showing animations
    setIsLoading(false);
  }, []);

  const navItems = [
    {
      title: "Pengguna",
      url: "/dashboard/user",
      icon: Users,
      items: [],
    },
    {
      title: "Keuangan",
      url: "/dashboard/keuangan",
      icon: Wallet,
      items: [],
    },
    {
      title: "Jadwal Kegiatan",
      url: "/dashboard/jadwal-kegiatan",
      icon: CalendarCheck,
      items: [],
    },
    {
      title: "Berita",
      url: "/dashboard/berita",
      icon: Newspaper,
      items: [],
    },
    {
      title: "Reservasi",
      icon: BookmarkPlus,
      items: [
        {
          title: "Acara",
          url: "/dashboard/acara",
          icon: CalendarDays,
        },
        {
          title: "Fasilitas",
          url: "/dashboard/fasilitas",
          icon: Building,
        },
        {
          title: "Sesi",
          url: "/dashboard/sesi",
          icon: Clock,
        },
        {
          title: "Pembayaran",
          url: "/dashboard/pembayaran",
          icon: Book,
        },
        // {
        //   title: "Konfirmasi Reservasi",
        //   url: "/dashboard/konfirmasi-reservasi",
        //   icon: ClipboardCheck,
        // },
        {
          title: "Data Reservasi",
          url: "/dashboard/reservasi-fasilitas",
          icon: Clipboard,
        },
      ],
    },
  ];

  // Custom Nav component to handle dropdowns with animations
  const CustomNavMain = ({ items }) => {
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <motion.div 
              className={cn(
                "flex items-center py-2 px-3 rounded-md cursor-pointer",
                "transition-all duration-200 ease-in-out",
                activeItem === item.url 
                  ? "bg-green-100 text-green-800 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.items.length > 0) {
                  toggleExpand(item.title);
                } else if (item.url) {
                  handleNavigation(item.url);
                }
              }}
            >
              {item.icon && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: activeItem === item.url ? [1, 1.2, 1] : 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-2",
                    activeItem === item.url ? "text-green-700" : ""
                  )} />
                </motion.div>
              )}
              <span className="flex-1">{item.title}</span>
              {item.items.length > 0 && (
                <motion.div
                  animate={{ 
                    rotate: expandedItems[item.title] ? 90 : 0 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
            </motion.div>
            
            <AnimatePresence>
              {item.items.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: expandedItems[item.title] ? "auto" : 0,
                    opacity: expandedItems[item.title] ? 1 : 0
                  }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-6 mt-1 space-y-1 overflow-hidden"
                >
                  {item.items.map((subItem, subIndex) => (
                    <motion.div
                      key={subIndex}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: subIndex * 0.05 }}
                    >
                      <Link
                        href={subItem.url}
                        className={cn(
                          "flex items-center py-2 px-3 rounded-md",
                          "transition-all duration-200 ease-in-out",
                          activeItem === subItem.url 
                            ? "bg-green-100 text-green-800 font-medium" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(subItem.url);
                        }}
                      >
                        {subItem.icon && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <subItem.icon className={cn(
                              "h-4 w-4 mr-2",
                              activeItem === subItem.url ? "text-green-700" : ""
                            )} />
                          </motion.div>
                        )}
                        <span>{subItem.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  };

  // Update page transition settings to be more subtle
  const pageTransition = {
    duration: 0.1,
    ease: "linear"
  };

  // Modify the return statement
  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher teams={[{ name: "SIMASJID", logo: Wallet, url: "/dashboard" }]} />
      </SidebarHeader>
      <SidebarContent>
        <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <CustomNavMain items={navItems} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}