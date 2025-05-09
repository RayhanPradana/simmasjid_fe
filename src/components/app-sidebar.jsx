"use client";

import * as React from "react";
import {
  Home,
  Users,
  Wallet,
  CalendarCheck,
  Newspaper,
  Building,
  ClipboardCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import Link from 'next/link';
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

const data = {
  user: {
    name: "Fulan",
    email: "admin@simasjid.com",
    avatar: "/avatars/fulan.jpg",
  },
  teams: [
    {
      name: "SIMASJID",
      logo: Wallet,
      plan: "Dashboard",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: false,
      items: [],
    },
    {
      title: "Pengguna",
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

export function AppSidebar({ ...props }) {
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