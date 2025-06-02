"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, Settings } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import toast from "react-hot-toast";
import axios from 'axios';
import Marquee from 'react-fast-marquee';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Mail, 
  Home, 
  Bookmark, 
  Calendar as CalendarIcon, 
  Building, 
  Newspaper,
  User,
  Menu,
  X,
  LogOut,
  isLoggedIn,
  MapPin,
  CreditCard,
  CheckCircle
} from "lucide-react";

export function ModalJadwal({ data, onClose, onEventClick }) {
  const events = data
    .filter((item) => item.status === "Publikasi")
    .map((item) => ({
      title: `${item.nama_kegiatan} - ${item.tempat}`,
      date: item.tanggal,
    }));

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <motion.div
          key="modal"
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Jadwal / Kalender
          </h2>

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "title",
              center: "",
              right: "today prev,next",
            }}
            buttonText={{
              today: "Hari ini"
            }}
            events={events}
            eventClick={onEventClick}
            height="auto"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ModalDetailKegiatan({ kegiatan, onClose }) {
  if (!kegiatan) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-detail"
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-green-700 mb-4">
            Detail Kegiatan
          </h2>
          <p><strong>Nama:</strong> {kegiatan.nama_kegiatan}</p>
          <p><strong>Tanggal:</strong> {kegiatan.tanggal}</p>
          <p><strong>Jam:</strong> {kegiatan.waktu}</p>
          <p><strong>Tempat:</strong> {kegiatan.tempat}</p>
          <p><strong>Keterangan:</strong> {kegiatan.keterangan}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Page() {
  const router = useRouter();
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentCity, setCurrentCity] = useState('Malang');
  
  const sections = [
    { id: "home", label: "Beranda", icon: <Home size={16} /> },
    { id: "about", label: "Tentang", icon: <BookOpen size={16} /> },
    { id: "schedule", label: "Jadwal", icon: <Calendar size={16} /> },
    { id: "reservation", label: "Reservasi", icon: <Building size={16} /> },
    { id: "news", label: "Berita", icon: <Newspaper size={16} /> },
  ];

  const backendUrl = "http://127.0.0.1:8000";

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
     const currentPosition = window.scrollY + 100; // Offset for header
    
      const sectionElements = sections.map(section => ({
        id: section.id,
        position: document.getElementById(section.id)?.offsetTop || 0
      }));
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        if (currentPosition >= sectionElements[i].position) {
          setActiveSection(sectionElements[i].id);
          break;
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      setMobileMenuOpen(false); 
    }
  };

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("Admin");
    const [userImage, setUserImage] = useState(null);
    // Remove duplicate currentStep declaration since it's already declared below
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUserName(user.name);

            if (user.image) {
              setUserImage(user.image);
            }
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
          }
        }
      }
    }, []);

    const handleLogout = async () => {
      try {
        
        const token = localStorage.getItem('token');

        if (!token) {
          alert("Token tidak ditemukan, Anda perlu login kembali.");
          return;
        }
    
        const response = await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
    
        console.log('Response Status:', response.status); 
    
        if (response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false); 
          router.push("/");
          toast.success("🎉 Logout berhasil!");
        } else {
          const errorData = await response.json();
          console.error("Logout gagal:", errorData.message);
          alert("Logout gagal: " + (errorData.message || 'Unknown error'));
        }
      } catch (error) {
        console.error("Error saat logout:", error);
        alert("Terjadi kesalahan saat logout");
      }
    };

    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
    
        if (storedUser && token) {
          try {
            const user = JSON.parse(storedUser);
            setUserName(user.name || "...");
            if (user.image) {
              setUserImage(user.image);
            }
            setIsLoggedIn(true); // Set sebagai login
          } catch (error) {
            console.error("Gagal parsing user dari localStorage:", error);
          }
        }
      }
    }, []);
    

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/jadwals", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data kegiatan");
        }
        const result = await response.json();
        setData(result.data || result);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [jadwalRes, beritaRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/jadwal1", { headers }),
          fetch("http://127.0.0.1:8000/api/berita1", { headers }),
        ]);

        if (!jadwalRes.ok) throw new Error("Gagal mengambil data jadwal");
        if (!beritaRes.ok) throw new Error("Gagal mengambil data berita");

        const jadwalData = await jadwalRes.json();
        const beritaData = await beritaRes.json();

        setData(jadwalData.data || jadwalData);
        setData1(beritaData.data || beritaData);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };

    fetchAllData();
  }, []);

  const handleEventClick = (clickInfo) => {
    const clickedEvent = data.find(
      (item) =>
        `${item.nama_kegiatan} - ${item.tempat}` === clickInfo.event.title
    );
    setSelectedKegiatan(clickedEvent);
  };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${currentCity}&country=Indonesia&method=11`
        );
        setPrayerTimes(response.data.data.timings);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      }
    };

    fetchPrayerTimes();
  }, [currentCity]);

  // Update the currentStep state to accommodate more steps
  const [currentStep, setCurrentStep] = useState(1);

  // Update the useEffect for step animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep >= 7 ? 1 : prevStep + 1));
    }, 2000); // Change step every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t"/> // gradasi putih footer
      </div>

      {/* Header & Navigation - Responsive */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-bold text-green-800">SIMASJID</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-1">
                {sections.map((section) => (
                  <NavigationMenuItem key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? "bg-green-100 text-green-600" // No white point (border removed)
                          : "text-gray-700 hover:bg-green-50 hover:text-green-600" 
                      }`}
                    >
                      {section.icon}
                      {section.label}
                    </button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
          {/* Tombol Login (hanya muncul jika belum login) */}
          {!isLoggedIn && (
            <Link href="/login">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
              </button>
            </Link>
          )}

          {/* Dropdown User (muncul saat login di desktop) */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt="User Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/image/logo.png";
                      }}
                    />
                  ) : (
                    <img
                      src="/image/logo.png"
                      alt="Default Logo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-gray-700">{userName}</span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Akun</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu Mobile Toggle */}
          <button
            className="md:hidden text-green-600 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-green-100 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-2">
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                          activeSection === section.id
                            ? "bg-green-100 text-green-600" 
                            : "text-gray-700 hover:bg-green-50"
                        }`}
                      >
                        <div className={`${activeSection === section.id ? 'text-green-600' : 'text-gray-500'}`}>
                          {section.icon}
                        </div>
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Add this right after the header closing tag </header> */}
      <div className="bg-green-600 py-2 sticky top-[72px] z-40">
        <Marquee
          speed={50}
          gradient={false}
          className="text-white"
        >
          {prayerTimes ? (
            <div className="flex items-center space-x-8">
              <span className="flex items-center">
                <MapPin size={16} className="mr-2" /> {currentCity}
              </span>
              <span>Subuh: {prayerTimes.Fajr}</span>
              <span>•</span>
              <span>Dzuhur: {prayerTimes.Dhuhr}</span>
              <span>•</span>
              <span>Ashar: {prayerTimes.Asr}</span>
              <span>•</span>
              <span>Maghrib: {prayerTimes.Maghrib}</span>
              <span>•</span>
              <span>Isya: {prayerTimes.Isha}</span>
              <span className="ml-8">
                Waktu sholat untuk wilayah {currentCity} dan sekitarnya
              </span>
            </div>
          ) : (
            <span>Memuat jadwal sholat...</span>
          )}
        </Marquee>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center py-24">
        <div 
          className="absolute inset-0 bg-[url('/img/sabilillah.jpg')] bg-center bg-no-repeat bg-cover opacity-10"
          // style={{ transform: `scale(${1 + scrollY * 0.0002})` }}
        />
        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-green-800 mb-6">
              Selamat Datang di <br />
              <span className="text-green-600">SIMASJID</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Aplikasi untuk Pusat ibadah dan kegiatan Islami untuk seluruh umat. Mari bergabung dalam 
              perjalanan spiritual bersama komunitas yang hangat dan ramah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <Calendar size={18} />
                <span>Jadwal Sholat</span>
              </button>
              <button className="bg-white hover:bg-green-50 text-green-600 border border-green-600 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <Building size={18} />
                <span>Reservasi Fasilitas</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section - Responsive Grid */}
      <section id="about" className="relative py-24 bg-white/100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-2">Tentang</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="perspective-1000">
              <div 
                className="relative h-96 rounded-lg overflow-hidden shadow-xl transform transition-transform duration-500 hover:rotate-y-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img 
                  src="/img/sabilillah.jpg"
                  className="w-full h-full object-cover"
                  alt="Masjid Sabilillah"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold">Masjid Sabilillah Malang</h3>
                  <p className="text-white/80">Didirikan sejak 8 Agustus 1974</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Sejarah & Visi Kami</h3>
              <p className="text-gray-600 mb-6">
              Masjid Sabilillah di Malang, Jawa Timur, didirikan untuk menghormati semangat perjuangan 
              para pahlawan kemerdekaan Republik Indonesia, khususnya Laskar Sabilillah yang dipimpin oleh 
              KH. Masjkur. Dibangun pada 8 Agustus 1974, masjid ini menjadi simbol ketaqwaan dan perjuangan 
              dalam membela agama, bangsa, dan tanah air.
              </p>
              <p className="text-gray-600 mb-8">
                Menjadi pusat ibadah, pendidikan, dan kegiatan sosial 
                yang memupuk keimanan dan ketaqwaan kepada Allah SWT 
                serta meningkatkan kemaslahatan umat.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
                    <Home size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Lokasi</h4>
                    <p className="text-sm text-gray-500">Jl. A. Yani No.15, Blimbing, Kec. Blimbing, Kota Malang, Jawa Timur 65126</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Jam Operasional</h4>
                    <p className="text-sm text-gray-500">24 Jam Setiap Hari</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Email</h4>
                    <p className="text-sm text-gray-500">info@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
                    <Bookmark size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Kapasitas</h4>
                    <p className="text-sm text-gray-500">500+ Jamaah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section - Improved Layout */}
      <section id="schedule" className="relative py-24 bg-green-50">
        {/* <div 
          className="absolute inset-0 bg-[url('/img/islamic-pattern.')] bg-repeat opacity-5"
          style={{ backgroundSize: "50px" }}
        /> */}
        <div className="container mx-auto px-4 z-10 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-2">Jadwal Kegiatan</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyelenggarakan berbagai kegiatan rutin untuk meningkatkan keimanan dan 
              memperkuat silaturahmi antar jamaah.
            </p>
          </div>
          
          <div className="grid justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-green-700">
                  Kegiatan Rutin
                </h3>
                <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                  <Calendar size={24} />
                </div>
              </div>

              <div className="space-y-4">
                {data.filter((activity) => activity.status === "Publikasi")
                  .length === 0 ? (
                  <div className="text-gray-500">Tidak ada data kegiatan.</div>
                ) : (
                  data
                    .filter((activity) => activity.status === "Publikasi")
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="font-medium text-green-700">
                          {activity.nama_kegiatan}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-500">
                            {activity.tanggal}
                          </span>
                          <span className="text-sm text-green-600">
                            {activity.waktu}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors"
            >
              <Calendar size={20} />
              <span>Lihat Kalender Kegiatan</span>
            </button>
          </div>
        </div>
      </section>

      {/* Reservation Section - Improved Layout */}
      <section id="reservation" className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-2">Fasilitas</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              SIMASJID menyediakan berbagai fasilitas yang dapat digunakan untuk kegiatan 
              keagamaan, pendidikan, dan sosial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center">
            {[
              {
                name: "Auditorium",
                capacity: "500 Orang",
                image: "/img/auditorium.jpg",
                features: ["Sound System", "AC", "Mimbar", "Proyektor"]
              },
              {
                name: "Perpustakaan",
                capacity: "50 Orang",
                image: "/img/perpustakaan.png",
                features: ["Koleksi Buku", "Wi-Fi", "Ruang Diskusi", "AC"]
              },
              {
                name: "Masjid",
                capacity: "1000 Orang",
                image: "/img/auditorium.jpg",
                features: ["Koleksi Buku", "Wi-Fi", "Ruang Diskusi", "AC"]
              }
            ].map((facility, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={facility.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-white text-xl font-bold">{facility.name}</h3>
                      <p className="text-white/80 text-sm">Kapasitas: {facility.capacity}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium text-green-700 mb-2">Fasilitas:</h4>
                  <ul className="space-y-1">
                    {facility.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-green-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-green-800 mb-4">Cara Reservasi Fasilitas</h3>
          

            {/* Step Details */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-8 mt-8">
              {[
                {
                  icon: <User size={24} />,
                  title: "Login / Register",
                  desc: "Masuk / Buat ke akun Anda untuk mulai reservasi"
                },
                {
                  icon: <Calendar size={24} />,
                  title: "Pilih Jenis Acara",
                  desc: "Pilih jenis kegiatan yang akan dilaksanakan"
                },
                {
                  icon: <Building size={24} />,
                  title: "Pilih Fasilitas",
                  desc: "Pilih fasilitas yang dibutuhkan"
                },
                {
                  icon: <Clock size={24} />,
                  title: "Pilih Tanggal & Sesi",
                  desc: "Tentukan waktu pelaksanaan"
                },
                {
                  icon: <Mail size={24} />,
                  title: "Pengajuan",
                  desc: "Kirim pengajuan reservasi"
                },
                {
                  icon: <CreditCard size={24} />,
                  title: "Pembayaran",
                  desc: "Lakukan pembayaran biaya sewa"
                },
                {
                  icon: <CheckCircle size={24} />,
                  title: "Selesai",
                  desc: "Reservasi siap digunakan"
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out
                      ${currentStep >= index + 1 ? 'bg-green-500 text-white scale-110' : 'bg-white text-gray-400 scale-100'} 
                      shadow-md mb-4`}
                  >
                    {step.icon}
                  </div>
                  <h4 className={`font-semibold mb-2 transition-colors duration-100 ease-in-out
                    ${currentStep === index + 1 ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a href="/home/reservasi">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors">
                <Building size={20} />
                <span>Reservasi Sekarang</span>
              </button>
            </a>
          </div>
        </div>
      </section>
      
      <section id="news" className="relative py-24 bg-green-50/70">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-2">Berita & Informasi</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Informasi terbaru seputar kegiatan dan program di SIMASJID
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {data1.filter((news) => news.status === "Publikasi").length === 0 ? (
              <div className="text-gray-500 justify">Tidak ada berita yang dipublikasikan.</div>
            ) : (
              data1
                .filter((news) => news.status === "Publikasi")
                .map((news, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform transition hover:-translate-y-2"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={`http://localhost:8000/storage/${news.gambar}`}
                        alt={news.judul}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {news.tanggal}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {news.judul}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {news.konten.length > 100 ? news.konten.slice(0, 100) + "..." : news.konten}
                      </p>
                      <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors">
                        Baca Selengkapnya
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M8 3.33337L12.6667 8.00004L8 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors">
              <Newspaper size={20} />
              <span>Lihat Semua Berita</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="relative py-16 bg-green-800 text-white">
          <div className="container mx-auto px-4 z-10 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Bergabunglah Dengan Komunitas Kami</h2>
              <p className="text-green-100 mb-8">
                Mari berpartisipasi dalam berbagai kegiatan bermanfaat dari
                keluarga besar Masjid Sabilillah.
              </p>
              <Link href="/register">
                <button className="bg-white text-green-800 hover:bg-green-100 px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors">
                  <User size={20} />
                  <span>Daftar Sekarang</span>
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

    {/* Footer */}
    <footer className="bg-white py-12 border-t border-green-100">
          <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-600 text-white p-2 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-xl font-bold text-green-800">SIMASJID</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
              Aplikasi untuk Pusat ibadah dan kegiatan Islami untuk seluruh umat. Mari bergabung dalam 
              perjalanan spiritual bersama komunitas yang hangat dan ramah.
              </p>
              <div className="flex gap-3">
                <a href="#" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92922 4.59318 2.50197 4.84824 2.16134 5.19941C1.82071 5.55057 1.57884 5.98541 1.46 6.46C1.14522 8.20556 0.991255 9.97631 1 11.75C0.988852 13.537 1.14279 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17214 18.2945C2.50597 18.6308 2.92518 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8573 8.1787 22.54 6.42Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7616 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                </a>
                </div>
                </div>

                <div>
                <h4 className="text-lg font-semibold text-green-800 mb-4">Tautan Cepat</h4>
                <ul className="space-y-2">
                    <li>
                    <a href="#home" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Beranda</a>
                    </li>
                    <li>
                    <a href="#about" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Tentang Kami</a>
                    </li>
                    <li>
                    <a href="#schedule" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Jadwal Kegiatan</a>
                    </li>
                    <li>
                    <a href="#reservation" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Reservasi Fasilitas</a>
                    </li>
                    <li>
                    <a href="#news" className="text-gray-600 hover:text-green-600 transition-colors text-sm">Berita & Informasi</a>
                    </li>
                </ul>
                </div>

                <div>
                <h4 className="text-lg font-semibold text-green-800 mb-4">Kontak Kami</h4>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="text-sm text-gray-600">
                            Jl. A. Yani No.15, Blimbing, Kec. Blimbing, Kota Malang, Jawa Timur 65126
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0973 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27103 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 2H7.11C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04205 3.23945 9.11 3.72C9.23668 4.68007 9.47151 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0554 17.47 14.19C18.3773 14.5285 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5259 15.5775C21.8424 15.9518 22.0131 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">
                        +62 
                    </span>
                    </li>
                    <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="text-sm text-gray-600">
                        info@gmail.com
                    </span>
                    </li>
                    <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="text-sm text-gray-600">
                        Buka 24 Jam
                    </span>
                    </li>
                </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-4">Lokasi Kami</h4>
                  <div className="w-full h-64 rounded-xl overflow-hidden relative group"> 
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31612.405149631515!2d112.64136!3d-7.941908!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd629c05c689559%3A0xf3162cc40350c050!2sSabilillah%20Mosque!5e0!3m2!1sen!2sid!4v1748175688880!5m2!1sen!2sid"
                      width="100%"
                      height="100%"
                      className="grayscale-[0.1] contrast-[1.1]"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-black mb-4 md:mb-0">
                    © {new Date().getFullYear()} SIMASJID. Hak Cipta Dilindungi.
                    </p>
                    <div className="flex gap-6">
                    </div>
                </div>
            </div>
        </div>
    </footer>

    {/* Modal Jadwal */}
    {showModal && (
      <ModalJadwal 
        data={data} 
        onClose={() => setShowModal(false)} 
        onEventClick={handleEventClick}
      />
    )}

    {/* Modal Detail Kegiatan */}
    {selectedKegiatan && (
      <ModalDetailKegiatan 
        kegiatan={selectedKegiatan}
        onClose={() => setSelectedKegiatan(null)}
      />
    )}
    </div>
  );
}