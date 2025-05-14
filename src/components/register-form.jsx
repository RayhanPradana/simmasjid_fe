"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CarIcon, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function RegisterForm({ className, ...props }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState({}); 

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "jemaah",
    image: null,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(); 

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    formData.append("role", form.role);
    formData.append("password", form.password);
    formData.append("password_confirmation", form.confirmPassword);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Registrasi berhasil! Silakan login.");
        router.push("/login");
      } else if (data.errors) {
        setError(data.errors); 
      } else {
        setError({ general: [data.message || "Registrasi gagal."] });
      }
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/image/logo.png"
                  alt="Logo SimMasjid"
                  width={80}
                  height={80}
                  className="mb-2"
                />
                <h1 className="text-2xl font-bold">Buat Akun Anda</h1>
                <p className="text-muted-foreground text-balance">
                  Daftar untuk akun baru SiMasjid
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {error?.name && (
                  <p className="text-xs text-red-500 mt-1">{error.name[0]}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {error?.email && (
                  <p className="text-xs text-red-500 mt-1">{error.email[0]}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                {error?.phone && (
                  <p className="text-xs text-red-500 mt-1">{error.phone[0]}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
                {error?.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {error.address[0]}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="image">Foto Profil</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {error?.image && (
                  <p className="text-xs text-red-500 mt-1">{error.image[0]}</p>
                )}
              </div>

              <div className="grid gap-3 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  {error?.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {error.password[0]}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 relative">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {error?.password_confirmation && (
                    <p className="text-xs text-red-500 mt-1">{error.password_confirmation[0]}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error?.general && (
                <div className="text-sm text-red-500 text-center">
                  {error.general[0]}
                </div>
              )}

              <Button type="submit" className="w-full">
                Daftar
              </Button>

              <div className="text-center text-sm">
                Sudah Punya Akun?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/image/img4.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// {/* Delete Confirmation Modal */}
//             <AlertDialog
//               open={isDeleteModalOpen}
//               onOpenChange={setIsDeleteModalOpen}
//             >
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     Tindakan ini tidak dapat dibatalkan. Penghapusan akan
//                     menghilangkan data pengguna
//                     {selectedItem && ` "${selectedItem.name}"`} secara permanen.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Batal</AlertDialogCancel>
//                   <AlertDialogAction
//                     onClick={handleDelete}
//                     className="bg-red-500 hover:bg-red-600"
//                   >
//                     Hapus
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

// {/* Dialog Detail Pengguna */}
//             <Dialog
//               open={isDetailModalOpen}
//               onOpenChange={setIsDetailModalOpen}
//             >
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Detail Pengguna</DialogTitle>
//                   <DialogDescription>
//                     Informasi lengkap pengguna.
//                   </DialogDescription>
//                 </DialogHeader>
//                 {detailItem && (
//                   <div className="grid gap-3 text-sm py-2">
//                     <Separator />
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">ID:</span>
//                       <span className="col-span-2">{detailItem.id}</span>
//                     </div>
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">Nama:</span>
//                       <span className="col-span-2">{detailItem.name}</span>
//                     </div>
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">Email:</span>
//                       <span className="col-span-2">{detailItem.email}</span>
//                     </div>
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">Telepon:</span>
//                       <span className="col-span-2">{detailItem.phone}</span>
//                     </div>
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">Role:</span>
//                       <span className="col-span-2">
//                         <span
//                           className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
//                             detailItem.role === "admin"
//                               ? "bg-blue-100 text-blue-700"
//                               : "bg-green-100 text-green-700"
//                           }`}
//                         >
//                           {detailItem.role}
//                         </span>
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-3 items-center">
//                       <span className="font-semibold">Alamat:</span>
//                       <span className="col-span-2">{detailItem.address}</span>
//                     </div>
//                   </div>
//                 )}
//                 <DialogFooter>
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsDetailModalOpen(false)}
//                   >
//                     Tutup
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>

{/* <CardFooter>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center w-full gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paginate(currentPage > 1 ? currentPage - 1 : 1)
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(i + 1)}
                        className="w-8 h-8"
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paginate(
                          currentPage < totalPages
                            ? currentPage + 1
                            : totalPages
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardFooter> */}



              // CarI
              // <div className="flex items-center mb-4">
              //     <div className="relative flex-1">
              //       <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              //       <Input
              //         placeholder="Cari data pengguna..."
              //         className="pl-8 w-full"
              //         value={searchTerm}
              //         onChange={(e) => setSearchTerm(e.target.value)}
              //       />
              //     </div>
              //   </div>

  //               const handleDelete = async () => {
  //   const token = localStorage.getItem("token");
  //   try {
  //     const res = await fetch(`http://localhost:8000/api/users/${selectedItem.id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  
  //     const dataRes = await res.json();
  
  //     if (res.ok) {
  //       setData(data.filter((d) => d.id !== selectedItem.id));
  //       alert("Data berhasil dihapus!");
  //     } else {
  //       alert("Gagal menghapus data: " + (dataRes.message || "Unknown error"));
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Gagal terhubung ke server.");
  //   }
    
  //   setIsDeleteModalOpen(false);
  // }; 
  

  // const handleDetails = (item) => {
  //   setDetailItem(item);
  //   setIsDetailModalOpen(true);
  // };

  import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

//  useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch("http://127.0.0.1:8000/api/users", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const result = await response.json();
//         setData(result.data || result);
//         setFilteredData(result.data || result);
//       } catch (error) {
//         console.error("Gagal memuat data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//     const paginate = (pageNumber) => setCurrentPage(pageNumber);