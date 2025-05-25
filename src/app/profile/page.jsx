"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { ChevronsUpDown, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  Calendar as CalendarIcon,
  User,
  LogOut,
} from "lucide-react";
import useAuthRedirect from "@/lib/auth";

export default function Page() {
  const router = useRouter();
  const isLoggedIni = useAuthRedirect();
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isLoading = isLoggedIni === null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!token) return;

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          role: parsedUser.role || "",
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          image: parsedUser.image || "",
        });

        setName(parsedUser.name || "");
        setEmail(parsedUser.email || "");
        setPhone(parsedUser.phone || "");
        setAddress(parsedUser.address || "");
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token tidak ditemukan, Anda perlu login kembali.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response Status:", response.status);

      if (response.ok) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        const errorData = await response.json();
        console.error("Logout gagal:", errorData.message);
        alert("Logout gagal: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saat logout:", error);
      alert("Terjadi kesalahan saat logout");
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    image: "",
  });

  const [error, setError] = useState({});

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);

      const response = await fetch("http://127.0.0.1:8000/api/users1-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.errors || { general: ["Terjadi kesalahan saat update."] }
        );
        toast.error(data.message || "Update gagal.");
        return;
      }

      toast.success(data.message);

      const updatedUser = {
        ...user,
        name,
        email,
        phone,
        address,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan pada jaringan.");
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users1-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.errors || { general: ["Terjadi kesalahan saat update."] }
        );
        toast.error(data.message || "Update gagal.");
        return;
      }

      toast.success(data.message);
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/users1-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.errors || { general: ["Terjadi kesalahan saat update."] }
          );
          toast.error(data.message || "Update gagal.");
          return;
        }

        toast.success(data.message);

        const updatedUser = {
          ...user,
          image: data.image_url || URL.createObjectURL(file),
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.location.reload();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoggedIni === null) {
    return;
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
    <div className="relative min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-bold text-green-800">SIMASJID</h1>
          </div>

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
                        <div
                          className={`${
                            activeSection === section.id
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
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

      {/* Profile */}
      <section id="profile" className="relative py-20 bg-green-50">
        <div className="container mx-auto px-4 z-10 relative">
          <main className="flex flex-1 flex-col p-6 bg-gray-50 min-h-screen font-sans">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Kelola Profile</CardDescription>
                  </div>
                  <div
                    className="flex flex-col items-center gap-2 relative group cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Avatar className="h-30 w-24 border-2 border-green-600 shadow-md hover:opacity-80 transition">
                      <AvatarImage
                        src={user.image || "/default-avatar.png"}
                        alt="Foto Profil"
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {error?.image && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.image[0]}
                      </p>
                    )}
                    {/* <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 transition">
                    Ganti Foto
                  </div> */}
                  </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {error?.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.name[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {error?.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.email[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Peran</Label>
                    <Input id="role" defaultValue={user.role} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {error?.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.phone[0]}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    {error?.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.address[0]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between items-center space-x-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={() => router.push("/")}
                >
                  Kembali ke Beranda
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    className="mr-2"
                  >
                    Ubah Password
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleUpdateProfile}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>

            <div className="space-y-4">
              {/* Password Lama */}
              <div>
                <Label htmlFor="old-password">Password Lama</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  {error?.old_password && (
                    <p className="text-xs text-red-500 mt-1">
                      {error.old_password[0]}
                    </p>
                  )}
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <Label htmlFor="new-password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {error?.new_password && (
                    <p className="text-xs text-red-500 mt-1">
                      {error.new_password[0]}
                    </p>
                  )}
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {error?.new_password_confirmation && (
                    <p className="text-xs text-red-500 mt-1">
                      {error.new_password_confirmation[0]}
                    </p>
                  )}
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleChangePassword}
                className="bg-green-600 hover:bg-green-700"
              >
                Simpan Password
              </Button>
            </div>
          </div>
        </div>
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
                Aplikasi untuk Pusat ibadah dan kegiatan Islami untuk seluruh
                umat. Mari bergabung dalam perjalanan spiritual bersama
                komunitas yang hangat dan ramah.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92922 4.59318 2.50197 4.84824 2.16134 5.19941C1.82071 5.55057 1.57884 5.98541 1.46 6.46C1.14522 8.20556 0.991255 9.97631 1 11.75C0.988852 13.537 1.14279 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17214 18.2945C2.50597 18.6308 2.92518 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8573 8.1787 22.54 6.42Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7616 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.5 6.5H17.51"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-green-800 mb-4">
                Kontak Kami
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Jl. A. Yani No.15, Blimbing, Kec. Blimbing, Kota Malang,
                    Jawa Timur 65126
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0973 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27103 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 2H7.11C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04205 3.23945 9.11 3.72C9.23668 4.68007 9.47151 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0554 17.47 14.19C18.3773 14.5285 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5259 15.5775C21.8424 15.9518 22.0131 16.4296 22 16.92Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">+62</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 6L12 13L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">info@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-md text-green-600 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 18V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.93 4.93L7.76 7.76"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.24 16.24L19.07 19.07"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 12H22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.93 19.07L7.76 16.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.24 7.76L19.07 4.93"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Buka 24 Jam</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-black mb-4 md:mb-0">
                © 2025 MasjidKu. Hak Cipta Dilindungi.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-sm text-gray-1000 hover:text-green-600 transition-colors"
                >
                  Syarat & Ketentuan
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  Kebijakan Privasi
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  Peta Situs
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    //     </>
    //   )}
    // </div>
  );
}
