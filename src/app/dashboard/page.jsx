"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  CalendarCheck2,
  CreditCard,
  Newspaper,
  Users,
  Building2,
  ArrowDownCircle,
} from "lucide-react";
import useAuthRedirect from "@/lib/auth";
import { useState, useEffect } from "react";


export default function Page() {
  const isLoggedIni = useAuthRedirect();

    if (isLoggedIni === null) {
    return ;
  }

  if (isLoggedIni === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-lg font-semibold mb-4">
            Login terlebih dahulu...
          </h2>
        </div>
      </div>
    );
  }

  return (
    // <div className="p-4">
    //   {isLoading ? (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    //       <div className="bg-white p-6 rounded-lg shadow-lg text-center">
    //         <h2 className="text-lg font-semibold mb-4">
    //           Login terlebih dahulu...
    //         </h2>
    //       </div>
    //     </div>
    //   ) : (
    //     <>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {/* Header */}
              <header className="flex h-16 items-center gap-2 border-b bg-white px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="h-4 mr-2" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">
                          Dashboard
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Home</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              {/* Konten Dashboard */}
              <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
                <section>
                  <h1 className="text-3xl font-bold text-[#00a63e]">
                    Selamat datang di Dashboard, Admin Fulan!
                  </h1>
                  <p className="text-gray-700 mt-1">
                    Berikut ringkasan aktivitas Masjid hari ini.
                  </p>
                </section>

                {/* Statistik */}
                <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {/* Total Dana Masuk */}
                  <StatCard
                    title="Dana Masuk"
                    value="Rp 25.400.000"
                    icon={<CreditCard className="text-white" size={28} />}
                    color="#00a63e"
                  />
                  {/* Total Dana Keluar */}
                  <StatCard
                    title="Dana Keluar"
                    value="Rp 8.700.000"
                    icon={<ArrowDownCircle className="text-white" size={28} />}
                    color="#278e3b"
                  />
                  {/* Jumlah Jamaah */}
                  <StatCard
                    title="Jumlah Jamaah"
                    value="850 Orang"
                    icon={<Users className="text-white" size={28} />}
                    color="#1f6f2d"
                  />
                  {/* Jadwal Hari Ini */}
                  <StatCard
                    title="Jadwal Hari Ini"
                    value="Pengajian Ibu-Ibu"
                    icon={<CalendarCheck2 className="text-white" size={28} />}
                    color="#138f44"
                  />
                  {/* Berita Aktif */}
                  <StatCard
                    title="Berita Aktif"
                    value="5 Artikel"
                    icon={<Newspaper className="text-white" size={28} />}
                    color="#0d7f3a"
                  />
                  {/* Reservasi Fasilitas */}
                  <StatCard
                    title="Reservasi Hari Ini"
                    value="3 Reservasi"
                    icon={<Building2 className="text-white" size={28} />}
                    color="#06632e"
                  />
                </section>

                {/* Konten Tambahan */}
                <section className="mt-6 bg-white rounded-xl shadow p-6 text-gray-700">
                  <h2 className="text-xl font-semibold mb-2 text-[#00a63e]">
                    Informasi Tambahan
                  </h2>
                  <p>
                    SIMASJID membantu pengelolaan kegiatan, keuangan, dan
                    fasilitas masjid secara modern dan efisien. Anda dapat
                    menambahkan berita terbaru, mencatat transaksi, mengatur
                    jadwal, hingga memantau reservasi fasilitas.
                  </p>
                </section>
              </main>
            </SidebarInset>
          </SidebarProvider>
    //     </>
    //   )}
    // </div>
  );
}

// Komponen Kartu Statistik
function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
      <div className="p-3 rounded-full" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-lg font-bold">{value}</h3>
      </div>
    </div>
  );
}
