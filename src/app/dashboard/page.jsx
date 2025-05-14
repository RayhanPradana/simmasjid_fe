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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with Animation */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-16 items-center gap-2 border-b bg-white px-4 shadow-sm sticky top-0 z-10"
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </motion.header>

        {/* Konten Dashboard with Page Transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans"
          >
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <motion.h1 
                className="text-3xl font-bold text-[#00a63e]"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Selamat datang di Dashboard, Admin Fulan!
              </motion.h1>
              <motion.p 
                className="text-gray-700 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Berikut ringkasan aktivitas Masjid hari ini.
              </motion.p>
            </motion.section>

            {/* Statistik with Staggered Animation */}
            <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                {
                  title: "Dana Masuk",
                  value: "Rp 25.400.000",
                  icon: <CreditCard className="text-white" size={28} />,
                  color: "#00a63e",
                  delay: 0.2
                },
                {
                  title: "Dana Keluar",
                  value: "Rp 8.700.000",
                  icon: <ArrowDownCircle className="text-white" size={28} />,
                  color: "#278e3b",
                  delay: 0.3
                },
                {
                  title: "Jumlah Jamaah",
                  value: "850 Orang",
                  icon: <Users className="text-white" size={28} />,
                  color: "#1f6f2d",
                  delay: 0.4
                },
                {
                  title: "Jadwal Hari Ini",
                  value: "Pengajian Ibu-Ibu",
                  icon: <CalendarCheck2 className="text-white" size={28} />,
                  color: "#138f44",
                  delay: 0.5
                },
                {
                  title: "Berita Aktif",
                  value: "5 Artikel",
                  icon: <Newspaper className="text-white" size={28} />,
                  color: "#0d7f3a",
                  delay: 0.6
                },
                {
                  title: "Reservasi Hari Ini",
                  value: "3 Reservasi",
                  icon: <Building2 className="text-white" size={28} />,
                  color: "#06632e",
                  delay: 0.7
                }
              ].map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  delay={stat.delay}
                />
              ))}
            </section>

            {/* Konten Tambahan with Animation */}
            <motion.section 
              className="mt-6 bg-white rounded-xl shadow p-6 text-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.h2 
                className="text-xl font-semibold mb-2 text-[#00a63e]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                Informasi Tambahan
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                SIMASJID membantu pengelolaan kegiatan, keuangan, dan fasilitas masjid secara modern dan efisien. 
                Anda dapat menambahkan berita terbaru, mencatat transaksi, mengatur jadwal, hingga memantau reservasi fasilitas.
              </motion.p>
            </motion.section>
          </motion.main>
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Komponen Kartu Statistik with Animation
function StatCard({ title, value, icon, color, delay = 0 }) {
  return (
    <motion.div 
      className="flex items-center gap-4 bg-white p-4 rounded-lg shadow"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: delay, 
        duration: 0.4,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 } 
      }}
    >
      <motion.div 
        className="p-3 rounded-full" 
        style={{ backgroundColor: color }}
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.2, type: "spring", stiffness: 400 } 
        }}
      >
        {icon}
      </motion.div>
      <div>
        <motion.p 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1, duration: 0.3 }}
        >
          {title}
        </motion.p>
        <motion.h3 
          className="text-lg font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.3 }}
        >
          {value}
        </motion.h3>
      </div>
    </div>
  )
}
