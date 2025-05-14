"use client";

import { useState, useEffect } from "react";
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
import {
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
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
    judul: "",
    konten: "",
    tanggal: "",
    gambar: null,
    status: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, gambar: e.target.files[0] });
  };

  const handleAddNew = () => {
    setFormData({
      judul: "",
      konten: "",
      //tanggal: "new Date().toISOString().split("T")[0]",
      tanggal: "",
      gambar: null,
      status: "",
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      judul: item.judul,
      konten: item.konten,
      tanggal: item.tanggal,
      gambar: null,
      status: item.status,
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("judul", formData.judul);
    form.append("konten", formData.konten);
    form.append("tanggal", formData.tanggal);
    form.append("status", formData.status);
    if (formData.gambar) {
      form.append("gambar", formData.gambar);
    }

    if (isEditing) {
      form.append("_method", "PUT");
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/berita/${formData.id}`
        : "http://localhost:8000/api/berita";

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
          judul: "",
          konten: "",
          tanggal: "",
          status: "",
          gambar: null,
        });
        // refresh data
        const updated = await fetch("http://localhost:8000/api/berita", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await updated.json();
        setData(result.data || result);
        setFilteredData(result.data || result);
      } else if (dataRes.errors) {
        setError(dataRes.errors);
        console.log("Validation Errors:", dataRes.errors); // debug
      } else {
        setError({ general: [dataRes.message || "Gagal."] });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal terhubung ke server.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/berita/${selectedItem.id}`,
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
        toast.error(
          "Gagal menghapus data: " + (dataRes.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal terhubung ke server.");
    }

    setIsDeleteModalOpen(false); // Tutup modal setelah proses selesai
  };

  const handleDetails = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/berita", {
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
    fetchData();
  }, []);
  // Helper function to generate placeholder image based on filename
  const getImagePlaceholder = (filename) => {
    if (!filename) {
      // fallback color jika filename tidak tersedia
      return "hsl(0, 0%, 80%)";
    }

    // Hitung hash berdasarkan charCode dari setiap karakter dalam filename tanpa .split
    let hash = 0;
    for (let i = 0; i < filename.length; i++) {
      hash += filename.charCodeAt(i);
    }

    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 80%)`;

    return { backgroundColor: color, filename: filename };
  };

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
                  <BreadcrumbPage>Berita</BreadcrumbPage>
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
                    <CardTitle>Berita</CardTitle>
                    <CardDescription>Kelola data berita</CardDescription>
                  </div>
                  <Button
                    onClick={handleAddNew}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Tambah Berita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari berita..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Berita dengan gambar */}
                <div className="rounded-md border overflow-hidden">
                  {/* Header Tabel */}
                  <div className="bg-gray-50 border-b grid grid-cols-12 text-xs font-medium text-gray-500 uppercase">
                    <div className="px-4 py-3 col-span-1">ID</div>
                    <div className="px-4 py-3 col-span-1">Gambar</div>
                    <div className="px-4 py-3 col-span-2">Tanggal</div>
                    <div className="px-4 py-3 col-span-3">Judul</div>
                    <div className="px-4 py-3 col-span-2">Konten</div>
                    <div className="px-4 py-3 col-span-1">Status</div>
                    <div className="px-4 py-3 col-span-2 text-right">Aksi</div>
                  </div>

                  {/* Isi Tabel */}
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => {
                      const imgPlaceholder = getImagePlaceholder(item.gambar);
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 border-b hover:bg-gray-50 text-sm items-center"
                        >
                          <div className="px-4 py-3 col-span-1 flex items-center">
                            {item.id}
                          </div>
                          <div className="px-2 py-2 col-span-1">
                            <div
                              className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center text-xs text-gray-600"
                              style={{
                                backgroundColor: imgPlaceholder.backgroundColor,
                              }}
                              title={item.gambar}
                            >
                              {/* Mengecek apakah gambar ada atau tidak */}
                              <img
                                src={
                                  item.gambar
                                    ? `http://localhost:8000/storage/${item.gambar}` // jika ada gambar
                                    : "/image/logo.png" // jika tidak ada gambar, gunakan gambar default
                                }
                                // onError={(e) => {
                                //   e.target.onerror = null;
                                //   e.target.src =
                                //     "image/logo.png"; // fallback image dari public/image/logo.png
                                // }}
                                alt={item.judul}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="px-4 py-3 col-span-2">
                            {formatDate(item.tanggal)}
                          </div>
                          <div className="px-4 py-3 col-span-3 font-medium">
                            {truncateText(item.judul, 35)}
                          </div>
                          <div className="px-4 py-3 col-span-2 text-gray-600">
                            {truncateText(item.konten, 35)}
                          </div>
                          <div className="px-4 py-3 col-span-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.status === "Publikasi"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.status === "Publikasi"
                                ? "Publikasi"
                                : "Draft"}
                            </span>
                          </div>
                          <div className="px-4 py-3 col-span-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDetails(item)}
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(item)}
                                title="Edit Berita"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                                onClick={() => handleDeleteClick(item)}
                                title="Hapus Berita"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-500 col-span-12">
                      Tidak ada berita ditemukan
                    </div>
                  )}
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
                  <DialogTitle>Detail Berita</DialogTitle>
                  <DialogDescription>
                    Informasi lengkap berita.
                  </DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-4 py-2">
                    <Separator />
                    <div className="space-y-1">
                      <h3 className="font-semibold">{detailItem.judul}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(detailItem.tanggal)}
                      </p>
                    </div>

                    <div className="bg-gray-100 border rounded-md p-4 flex items-center justify-center h-48">
                      {detailItem.gambar && (
                        <div
                          className="w-full h-full rounded-md overflow-hidden flex items-center justify-center"
                          style={{
                            backgroundColor: getImagePlaceholder(
                              detailItem.gambar
                            ).backgroundColor,
                          }}
                        >
                          <img
                            src={`http://localhost:8000/storage/${detailItem.gambar}`}
                            alt={detailItem.judul}
                            className="max-w-full max-h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Konten Berita:</h4>
                      <p className="text-sm">{detailItem.konten}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">Status: </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            detailItem.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {detailItem.status === "published"
                            ? "Publikasi"
                            : "Draft"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ID: {detailItem.id}
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
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Berita" : "Tambah Berita Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Perbarui informasi berita di bawah ini."
                      : "Isi detail berita baru Anda."}
                  </DialogDescription>
                </DialogHeader>

                {/* Mulai form */}
                <form onSubmit={handleFormSubmit}>
                  <div className="grid gap-4 py-4">
                    {/* Judul */}
                    <div className="grid gap-2">
                      <Label htmlFor="judul">Judul Berita</Label>
                      <Input
                        id="judul"
                        name="judul"
                        value={formData.judul}
                        onChange={handleInputChange}
                        placeholder="Masukkan judul berita"
                        
                      />
                      {error?.judul && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.judul[0]}
                        </p>
                      )}
                    </div>

                    {/* Tanggal */}
                    <div className="grid gap-2">
                      <Label htmlFor="tanggal">Tanggal</Label>
                      <Input
                        id="tanggal"
                        name="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={handleInputChange}
                      />
                      {error?.tanggal && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.tanggal[0]}
                        </p>
                      )}
                    </div>

                    {/* Konten */}
                    <div className="grid gap-2">
                      <Label htmlFor="konten">Konten Berita</Label>
                      <textarea
                        id="konten"
                        name="konten"
                        value={formData.konten}
                        onChange={handleInputChange}
                        placeholder="Masukkan konten berita"
                        className="min-h-[120px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      {error?.konten && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.konten[0]}
                        </p>
                      )}
                    </div>

                    {/* Gambar */}
                    <div className="grid gap-2">
                      <Label htmlFor="gambar">Gambar</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gambar"
                          name="gambar"
                          type="file"
                          onChange={handleFileChange}
                          className="flex-1"
                          accept="image/*"
                        />
                        {error?.gambar && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.gambar[0]}
                        </p>
                      )}
                        {/* <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <ImageIcon className="h-4 w-4" /> Pilih
                        </Button> */}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Draf">Draf</option>
                        <option value="Publikasi">Publikasi</option>
                      </select>
                      {error?.status && (
                        <p className="text-xs text-red-500 mt-1">
                          {error.status[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer dengan tombol */}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit">
                      {isEditing ? "Simpan Perubahan" : "Tambah Berita"}
                    </Button>
                  </DialogFooter>
                </form>
                {/* Tutup form */}
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Berita
                    {selectedItem &&
                      ` "${truncateText(selectedItem.judul, 30)}"`}{" "}
                    akan dihapus secara permanen dari database.
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
