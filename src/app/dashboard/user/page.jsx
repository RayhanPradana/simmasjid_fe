"use client";

import { useState, useEffect } from "react";
import useAuthRedirect from "@/lib/auth";

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
import { Eye, EyeOff, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

export default function Page() {
  const isLoggedIn = useAuthRedirect(); 

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
const isLoggedIni = useAuthRedirect();

  //const isLoading = isLoggedIn === null;

  // Fetch data hanya jika login
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://127.0.0.1:8000/api/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data");

        const result = await response.json();
        setData(result.data || result);
        setFilteredData(result.data || result);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Filter pencarian
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => b.id - a.id);
    setFilteredData(sorted);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleAddNew = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      role: "jemaah",
      image: null,
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      role: item.role,
      image: null,
      password: "",
      confirmPassword: "",
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    formData.append("role", form.role);
    if (form.password) {
      formData.append("password", form.password);
      formData.append("password_confirmation", form.confirmPassword);
    }
    if (form.image) {
      formData.append("image", form.image);
    }
    if (isEditing) formData.append("_method", "PUT");

    try {
      const url = isEditing
        ? `http://localhost:8000/api/users/${form.id}`
        : "http://localhost:8000/api/users";

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const dataRes = await res.json();

      if (res.ok) {
        toast.success(
          isEditing
            ? "🎉 Berhasil mengupdate data!"
            : "🎉 Berhasil menambahkan data!"
        );
        setIsAddModalOpen(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          confirmPassword: "",
          role: "jemaah",
          image: null,
        });

        // Refresh data
        const updated = await fetch("http://localhost:8000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await updated.json();
        setData(result.data || result);
        setFilteredData(result.data || result);
      } else if (dataRes.errors) {
        setError(dataRes.errors);
      } else {
        setError({ general: [dataRes.message || "Gagal."] });
      }
    } catch (error) {
      console.error(error);
      setError("Gagal terhubung ke server.");
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${selectedItem.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const dataRes = await res.json();

      if (res.ok) {
        setData(data.filter((d) => d.id !== selectedItem.id));
        toast.success("🎉 Data berhasil dihapus!");
      } else {
        toast.error(
          "Gagal menghapus data: " + (dataRes.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke server.");
    }

    setIsDeleteModalOpen(false);
  };

  const handleDetails = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                        <BreadcrumbPage>Pengguna</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              {/* Konten Dashboard */}
              <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Pengguna</CardTitle>
                          <CardDescription>
                            Kelola data pengguna
                          </CardDescription>
                        </div>
                        <Button
                          onClick={handleAddNew}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" /> Tambah Pengguna
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Pencarian */}
                      <div className="flex items-center mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Cari data pengguna..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Tabel Pengguna dengan komponen Table */}
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableHead className="w-12 font-medium">
                                ID
                              </TableHead>
                              <TableHead className="font-medium">
                                Nama
                              </TableHead>
                              <TableHead className="font-medium">
                                Email
                              </TableHead>
                              <TableHead className="font-medium">
                                Telepon
                              </TableHead>
                              <TableHead className="font-medium">
                                Role
                              </TableHead>
                              <TableHead className="font-medium">
                                Alamat
                              </TableHead>
                              <TableHead className="text-right font-medium">
                                Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentItems.length > 0 ? (
                              currentItems.map((item, index) => (
                                <TableRow
                                  key={item.id}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell className="font-medium">
                                    {(currentPage - 1) * itemsPerPage +
                                      index +
                                      1}
                                  </TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.email}</TableCell>
                                  <TableCell>{item.phone}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        item.role === "admin"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {item.role}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="max-w-[200px] truncate"
                                    title={item.address}
                                  >
                                    {item.address}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleDetails(item)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEdit(item)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteClick(item)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-6 text-gray-500"
                                >
                                  Tidak ada data pengguna
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>

                    <CardFooter>
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
                              variant={
                                currentPage === i + 1 ? "default" : "outline"
                              }
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
                    </CardFooter>
                  </Card>

                  {/* Dialog Detail Pengguna */}
                  <Dialog
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detail Pengguna</DialogTitle>
                        <DialogDescription>
                          Informasi lengkap pengguna.
                        </DialogDescription>
                      </DialogHeader>
                      {detailItem && (
                        <div className="grid gap-3 text-sm py-2">
                          <Separator />

                          <div className="flex justify-center mb-4">
                            {detailItem.image ? (
                              <img
                                src={detailItem.image || "/image/logo.png"}
                                alt="Foto Pengguna"
                                className="w-24 h-24 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">ID:</span>
                            <span className="col-span-2">{detailItem.id}</span>
                          </div>
                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">Nama:</span>
                            <span className="col-span-2">
                              {detailItem.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">Email:</span>
                            <span className="col-span-2">
                              {detailItem.email}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">Telepon:</span>
                            <span className="col-span-2">
                              {detailItem.phone}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">Role:</span>
                            <span className="col-span-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  detailItem.role === "admin"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {detailItem.role}
                              </span>
                            </span>
                          </div>
                          <div className="grid grid-cols-3 items-center">
                            <span className="font-semibold">Alamat:</span>
                            <span className="col-span-2">
                              {detailItem.address}
                            </span>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDetailModalOpen(false)}
                        >
                          Tutup
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Add/Edit Modal */}
                  <Dialog
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {isEditing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                        </DialogTitle>
                        <DialogDescription>
                          {isEditing
                            ? "Ubah data pengguna di bawah ini."
                            : "Isi detail untuk pengguna baru."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nama</Label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama pengguna"
                            required
                          />
                          {error?.name && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.name[0]}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Masukkan email"
                            required
                          />
                          {error?.email && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.email[0]}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Telepon</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Masukkan nomor telepon"
                            required
                          />
                          {error?.phone && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.phone[0]}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="image">Foto Profil</Label>
                          

                          <Input
                            id="image"
                            name="image"
                            type="file"
                            onChange={handleFileChange}
                            placeholder="Masukkan foto profil"
                            accept="image/*"
                            required={!isEditing}
                          />
                          {error?.image && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.image[0]}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Pilih role</option>
                            <option value="admin">Admin</option>
                            <option value="jemaah">User</option>
                          </select>

                          {error?.role && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.role[0]}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="address">Alamat</Label>
                          <Input
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Masukkan alamat"
                            required
                          />
                          {error?.address && (
                            <p className="text-xs text-red-500 mt-1">
                              {error.address[0]}
                            </p>
                          )}
                        </div>
                        {!isEditing && (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="password">Password</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  name="password"
                                  type={showPassword ? "text" : "password"}
                                  value={form.password}
                                  onChange={handleChange}
                                  placeholder="Masukkan password"
                                  required
                                />
                                {error?.password && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {error.password[0]}
                                  </p>
                                )}
                                <span
                                  className="absolute right-3 top-3 cursor-pointer"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff /> : <Eye />}
                                </span>
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="confirmPassword">
                                Konfirmasi Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  value={form.confirmPassword}
                                  onChange={handleChange}
                                  placeholder="Konfirmasi password"
                                  required
                                />
                                {error?.password_confirmation && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {error.password_confirmation[0]}
                                  </p>
                                )}
                                <span
                                  className="absolute right-3 top-3 cursor-pointer"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        {error?.general && (
                          <div className="text-sm text-red-500 text-center">
                            {error.general[0]}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button onClick={handleFormSubmit}>
                          {isEditing ? "Simpan Perubahan" : "Tambah Pengguna"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Modal */}
                  <AlertDialog
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Yakin ingin menghapus?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Penghapusan akan
                          menghilangkan data pengguna
                          {selectedItem && ` "${selectedItem.name}"`} secara
                          permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
    //     </>
    //   )}
    // </div>
  );
}
