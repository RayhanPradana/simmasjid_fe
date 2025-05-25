"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
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
import { Eye, EyeOff } from "lucide-react";
import useAuthRedirect from "@/lib/auth";

const Profile = () => {
  const isLoggedIni = useAuthRedirect();

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    image: "",
  });

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

  const [error, setError] = useState({});

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);

      const response = await fetch("http://127.0.0.1:8000/api/users-profile", {
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
      // ❌ Jangan pakai reload lagi
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan pada jaringan.");
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users-update", {
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
        const response = await fetch("http://127.0.0.1:8000/api/users-photo", {
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
    <div>
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4">
              Login terlebih dahulu...
            </h2>
          </div>
        </div>
      ) : (
        <>
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
                        <BreadcrumbPage>Profil</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              {/* Konten */}
              <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
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

                  <div className="text-end">
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
              </main>

              {/* Modal Ubah Password */}
              {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">
                      Ubah Password
                    </h2>

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
                            {showOldPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
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
                            {showNewPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Konfirmasi Password */}
                      <div>
                        <Label htmlFor="confirm-password">
                          Konfirmasi Password
                        </Label>
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
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
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
            </SidebarInset>
          </SidebarProvider>
        </>
      )}
    </div>
  );
};

export default Profile;
