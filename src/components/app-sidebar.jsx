"use client";

import * as React from "react";
import {
  Users,
  Wallet,
  CalendarCheck,
  Newspaper,
  Building,
  ClipboardCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }) {
  const [user, setUser] = React.useState({
    name: "Guest",
    email: "guest@simasjid.com",
    avatar: "/avatars/default.jpg",
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const data = {
    user,
    teams: [
      {
        name: "SIMASJID",
        logo: Wallet,
        plan: "Dashboard",
      },
    ],
    navMain: [
      {
        title: "User",
        url: "/dashboard/user",
        icon: Users,
        isActive: false,
        items: [],
      },
      {
        title: "Keuangan",
        url: "/dashboard/keuangan",
        icon: Wallet,
        isActive: false,
        items: [],
      },
      {
        title: "Jadwal Kegiatan",
        url: "/dashboard/jadwal-kegiatan",
        icon: CalendarCheck,
        isActive: false,
        items: [],
      },
      {
        title: "Berita",
        url: "/dashboard/berita",
        icon: Newspaper,
        isActive: false,
        items: [],
      },
      {
        title: "Fasilitas",
        url: "/dashboard/fasilitas",
        icon: Building,
        isActive: false,
        items: [],
      },
      {
        title: "Reservasi Fasilitas",
        url: "/dashboard/reservasi-fasilitas",
        icon: ClipboardCheck,
        isActive: false,
        items: [],
      },
    ],
    projects: [],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pl-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="pl-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="pl-4">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail className="flex justify-end pr-2" />
    </Sidebar>
  );
}
