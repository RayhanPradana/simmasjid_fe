"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
import {
  CalendarCheck2,
  CreditCard,
  Newspaper,
  Users,
  Building2,
  ArrowDownCircle,
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function Page() {
  // Sample data untuk kegiatan
  const [data, setData] = useState([]);
  const [error, setError] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    hari: "",
    waktu: "",
    tempat: "",
    penanggung_jawab: "",
    keterangan: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle search
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hari.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.penanggung_jawab
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.tempat.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

 const handleInputChange = (e) => {
  const { id, value } = e.target;
  setFormData({
    ...formData,
    [id]: value,
  });
};

  // Open add modal
  const handleAddNew = () => {
    setFormData({
      nama_kegiatan: "",
      hari: "",
      waktu: "",
      tempat: "",
      penanggung_jawab: "",
      keterangan: "",
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama_kegiatan: item.nama_kegiatan || "",
      hari: item.hari || "",
      waktu: item.waktu || "",
      tempat: item.tempat || "",
      penanggung_jawab: item.penanggung_jawab || "",
      keterangan: item.keterangan || "",
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  // Open delete modal
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle detail view
  const handleDetails = (item) => {
    // Implementasi view detail bisa ditambahkan di sini
    setDetailItem(item);
    setIsDetailModalOpen(true);  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("nama_kegiatan", formData.nama_kegiatan);
    form.append("hari", formData.hari);
    form.append("waktu", formData.waktu);
    form.append("tempat", formData.tempat);
    form.append("penanggung_jawab", formData.penanggung_jawab);
    form.append("keterangan", formData.keterangan);

    if (isEditing) {
      form.append("_method", "PUT");
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/jadwal/${formData.id}`
        : "http://localhost:8000/api/jadwal";

      const method = isEditing ? "POST" : "POST";

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const dataRes = await res.json();

      if (res.ok) {
        toast.success(
          isEditing ? "Berhasil mengupdate data!" : "Berhasil menambahkan data!"
        );
        setIsAddModalOpen(false);
        setFormData({
          nama_kegiatan: "",
          hari: "",
          waktu: "",
          tempat: "",
          penanggung_jawab: "",
          keterangan: "",
        });
        // refresh data
        const updated = await fetch("http://localhost:8000/api/jadwal", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      toast.error("Gagal terhubung ke server.");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/jadwal/${selectedItem.id}`,
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
        // Hapus data dari state jika berhasil menghapus di server
        setData(data.filter((d) => d.id !== selectedItem.id));
        toast.success("Data berhasil dihapus!");
      } else {
        toast.error("Gagal menghapus data: " + (dataRes.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal terhubung ke server.");
    }

    setIsDeleteModalOpen(false); // Tutup modal setelah proses selesai
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const isLoggedIni = useAuthRedirect();

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/jadwal", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.data || result);
        setFilteredData(result.data || result);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };
    if (isLoggedIni) {
      fetchData();
    }
  }, [isLoggedIni]);

  
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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Jadwal Kegiatan</BreadcrumbPage>
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
                    <CardTitle>Kegiatan</CardTitle>
                    <CardDescription>Kelola data kegiatan</CardDescription>
                  </div>
                  <Button
                    onClick={handleAddNew}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Tambah data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari jadwal kegiatan..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Data */}
                <div className="rounded-md border overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Tabel */}
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56"
                        >
                          Nama Kegiatan
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                        >
                          Hari
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36"
                        >
                          Waktu
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                        >
                          Tempat
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                        >
                          Penanggung Jawab
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Keterangan
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    {/* Body Tabel */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.nama_kegiatan}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.hari}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.waktu}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.tempat}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.penanggung_jawab}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.keterangan}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleDeleteClick(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-6 text-center text-sm text-gray-500"
                          >
                            Tidak ada data kegiatan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
              </CardFooter>
            </Card>

            {/* Dialog Detail Berita */}
                        <Dialog
                          open={isDetailModalOpen}
                          onOpenChange={setIsDetailModalOpen}
                        >
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Detail Jadwal</DialogTitle>
                              <DialogDescription>
                                Informasi lengkap Jadwal Kegiatan.
                              </DialogDescription>
                            </DialogHeader>
                            {detailItem && (
                              <div className="grid gap-4 py-2">
                                <Separator />
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium">Nama Kegiatan:</h4>
                                  <p className="font-sm">{detailItem.nama_kegiatan}</p>
                                </div>
            
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Hari:</h4>
                                  <p className="text-sm">{detailItem.hari}</p>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Waktu:</h4>
                                  <p className="text-sm">{detailItem.waktu}</p>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Tempat:</h4>
                                  <p className="text-sm">{detailItem.tempat}</p>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Penanggung Jawab:</h4>
                                  <p className="text-sm">{detailItem.penanggung_jawab}</p>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Keterangan:</h4>
                                  <p className="text-sm">{detailItem.keterangan}</p>
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
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Perbarui detail kegiatan di bawah ini."
                      : "Isi detail untuk kegiatan baru Anda."}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nama_kegiatan">Nama Kegiatan</Label>
                    <Input
                      id="nama_kegiatan"
                      name="nama_kegiatan"
                      value={formData.nama_kegiatan}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama kegiatan"
                      required
                    />
                    {error?.nama_kegiatan && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.nama_kegiatan[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hari">Hari</Label>
                    <select
                      id="hari"
                      name="hari"
                      value={formData.hari}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Pilih hari</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                      <option value="Minggu">Minggu</option>
                    </select>
                    {error?.hari && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.hari[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="waktu">Waktu</Label>
                    <Input
                      id="waktu"
                      name="waktu"
                      type="time"
                      value={formData.waktu}
                      onChange={handleInputChange}
                      placeholder="Contoh: 09:00-12:00"
                      required
                    />
                    {error?.waktu && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.waktu[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tempat">Tempat</Label>
                    <Input
                      id="tempat"
                      name="tempat"
                      value={formData.tempat}
                      onChange={handleInputChange}
                      placeholder="Masukkan lokasi kegiatan"
                      required
                    />
                    {error?.tempat && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.tempat[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                    <Input
                      id="penanggung_jawab"
                      name="penanggung_jawab"
                      value={formData.penanggung_jawab}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama penanggung jawab"
                      required
                    />
                    {error?.penanggung_jawab && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.penanggung_jawab[0]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Input
                      id="keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      placeholder="Masukkan keterangan tambahan"
                      required
                    />
                    {error?.keterangan && (
                      <p className="text-xs text-red-500 mt-1">
                        {error.keterangan[0]}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleFormSubmit}>
                    {isEditing ? "Simpan Perubahan" : "Tambah Kegiatan"}
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
                  <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                    kegiatan
                    {selectedItem && ` "${selectedItem.nama_kegiatan}"`} secara
                    permanen dari database.
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
  );
}