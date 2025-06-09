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
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  CalendarCheck2,
  Newspaper,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  EyeOff,
  Building2,
  Timer,
} from "lucide-react";
import useAuthRedirect from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  // const API_BASE_URL = "http://127.0.0.1:8000/api/dashboard";
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const isLoggedIn = useAuthRedirect();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    rawData: {
      users: [],
      keuangan: [],
      jadwal: [],
      berita: [],
      acara: [],
      reservasi_fasilitas: [],
      pembayaran: [],
    },
    display: {
      users: {
        total: 0,
      },
      keuangan: {
        pemasukan: 0,
        pengeluaran: 0,
        saldo: 0,
      },
      jadwal: {
        total: 0,
        hari_ini: 0,
      },
      berita: {
        total: 0,
      },
      pembayaran: {
        belumLunas: 0
      },
      reservasi: {
        pending: 0,
        disetujui: 0,
        menungguLunas: 0, 
        sedangBerlangsung: 0,
      },
    },
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${apiUrl}/api/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      // Calculate financial data from keuangan table
      const calculateKeuangan = (keuanganData) => {
        if (!keuanganData || keuanganData.length === 0) {
          return { pemasukan: 0, pengeluaran: 0, saldo: 0, breakdown: {} };
        }

        const totalMasuk = keuanganData.reduce((sum, k) => {
          return sum + (Number(k.total_masuk) || 0);
        }, 0);

        const totalKeluar = keuanganData.reduce((sum, k) => {
          return sum + (Number(k.total_keluar) || 0);
        }, 0);

        // Saldo selalu dihitung dari total masuk dikurangi total keluar
        const saldo = totalMasuk - totalKeluar;

        // Calculate breakdown by jenis (income types)
        const jenisTypes = ['infaq', 'sedekah', 'donasi', 'zakat', 'wakaf', 'dana kegiatan', 'reservasi'];
        const breakdown = {};

        jenisTypes.forEach(jenis => {
          const jenisTotal = keuanganData
            .filter(k => k.jenis === jenis)
            .reduce((sum, k) => sum + (Number(k.total_masuk) || 0), 0);

          if (jenisTotal > 0) {
            breakdown[jenis] = jenisTotal;
          }
        });

        return {
          pemasukan: totalMasuk,
          pengeluaran: totalKeluar,
          saldo: saldo,
          breakdown: breakdown,
        };
      };

      setDashboardData((prev) => ({
        rawData: result.data,
        display: {
          users: {
            total: result.data.users?.length || 0,
            // Removed active status
          },
          keuangan: calculateKeuangan(result.data.keuangan),
          jadwal: {
            total:
              (result.data.jadwal?.length || 0) + (result.data.acara?.length || 0),
            hari_ini: [
              ...(result.data.jadwal || []),
              ...(result.data.acara || []),
            ].filter(
              (j) => new Date(j.tanggal).toDateString() === new Date().toDateString()
            ).length,
          },
          berita: {
            total: result.data.berita?.length || 0
            // Removed aktif and terbaru status
          },
          pembayaran: {
            belumLunas: result.data.pembayaran?.filter(
              (p) => p.status === "belum lunas"
            ).length || 0
          },
          reservasi: {
            pending: result.data.reservasi_fasilitas?.filter(
              (r) => r.status_reservasi === "pending"
            ).length || 0,
            disetujui: result.data.reservasi_fasilitas?.filter(
              (r) => r.status_reservasi === "disetujui" 
            ).length || 0,
            menungguLunas: result.data.reservasi_fasilitas?.filter(
              (r) => r.status_reservasi === "menunggu lunas" 
            ).length || 0,
            sedangBerlangsung: result.data.reservasi_fasilitas?.filter(
              (r) => r.status_reservasi === "sedang berlangsung"
            ).length || 0,
          },
        },
      }));

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCompactRupiah = (amount) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `Rp ${formatter.format(amount)}`;
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn === null) {
    return null;
  }

  if (isLoggedIn === false) {
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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-red-500 mb-4">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Gagal memuat data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-14 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content - Fixed Height */}
        <main className="h-[calc(100vh-3.5rem)] bg-gray-50 overflow-hidden">
          {/* Welcome Banner - Compact */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Dashboard Admin Masjid</h1>
                <p className="text-green-100 text-xs">Ringkasan aktivitas hari ini</p>
              </div>
              <div className="text-right text-xs">
                <div className="text-green-100">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid - Responsive Layout */}
          <div className="p-3 h-[calc(100%-5rem)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 h-full">

              {/* Row 1: Key Metrics */}
              <motion.div
                className="col-span-1 sm:col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/user')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Pengguna</h3>
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.display.users.total}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Pengguna
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="col-span-1 sm:col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/jadwal-kegiatan')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Jadwal Hari Ini</h3>
                  <CalendarCheck2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.display.jadwal.hari_ini}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Jadwal
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/berita')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Berita</h3>
                  <Newspaper className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.display.berita.total}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Berita
                  </div>
                </div>
              </motion.div>

              {/* Row 2: Finance */}
              <motion.div
                className="col-span-1 sm:col-span-2 lg:col-span-6 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/keuangan')}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Keuangan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Wallet className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {formatCompactRupiah(dashboardData.display.keuangan.saldo)}
                    </div>
                    <div className="text-xs text-gray-500">Saldo Dompet</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {formatCompactRupiah(dashboardData.display.keuangan.pemasukan)}
                    </div>
                    <div className="text-xs text-gray-500">Total Masuk</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-sm font-bold text-red-600">
                      {formatCompactRupiah(dashboardData.display.keuangan.pengeluaran)}
                    </div>
                    <div className="text-xs text-gray-500">Total Keluar</div>
                  </div>
                </div>
              </motion.div>

              {/* Row 3: Status Boxes */}
              <motion.div
                className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/pembayaran')}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Status Pembayaran
                </h3>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.display.pembayaran.belumLunas}
                  </div>
                  <div className="text-sm text-gray-500">Pembayaran Belum Lunas</div>
                </div>
              </motion.div>

              <motion.div
                className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation('/dashboard/reservasi-fasilitas')}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status Reservasi
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-bold text-yellow-600">
                      {dashboardData.display.reservasi.pending}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-sm font-bold text-green-600">
                      {dashboardData.display.reservasi.disetujui}
                    </div>
                    <div className="text-xs text-gray-500">Disetujui</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-sm font-bold text-red-600">
                      {dashboardData.display.reservasi.menungguLunas}
                    </div>
                    <div className="text-xs text-gray-500">Menunggu Lunas</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-sm font-bold text-blue-600">
                      {dashboardData.display.reservasi.sedangBerlangsung}
                    </div>
                    <div className="text-xs text-gray-500">Sedang Berlangsung</div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}