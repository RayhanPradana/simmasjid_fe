"use client"

import { useState, useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

export default function Page() {
  const { toast } = useToast()
  const API_BASE_URL = "http://127.0.0.1:8000/api/keuangan"

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    jenis: "",
    jumlah: "",
    sumber: "",
    deskripsi: "",
    tanggal: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 5

  // Format current date to YYYY-MM-DD for default value
  const getCurrentFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Filter data based on search term
  useEffect(() => {
    const filtered = data.filter(item => 
      item.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jumlah?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tanggal?.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  // READ - Fetch all Data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
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
      toast({
        title: "Error",
        description: "Gagal memuat data. Silakan coba lagi.",
        variant: "destructive",
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  // CREATE - Tambah data baru
  const createData = async (formData) => {
    setIsLoading(true)
    try {
      // Ensure data matches the database structure
      const sanitizedData = {
        jenis: formData.jenis,
        jumlah: parseFloat(formData.jumlah.replace(/[^\d.-]/g, '')), // Remove non-numeric characters except decimal point
        sumber: formData.sumber,
        deskripsi: formData.deskripsi,
        tanggal: formData.tanggal // Pass the date value directly
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      })
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast({
          title: "Error",
          description: "Gagal menambahkan data. " + (errorData.message || ""),
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Berhasil",
        description: "Data keuangan baru berhasil ditambahkan",
      });
      
      return true;
    } catch (error) {
      console.error("Error saat menambah data:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan data",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false)
    }
  }  

  // UPDATE - Update Data
  const updateData = async (id, formData) => {
    setIsLoading(true)
    try {
      // Ensure data matches the database structure
      const sanitizedData = {
        jenis: formData.jenis,
        jumlah: parseFloat(formData.jumlah.replace(/[^\d.-]/g, '')), // Remove non-numeric characters except decimal point
        sumber: formData.sumber,
        deskripsi: formData.deskripsi,
        tanggal: formData.tanggal // Pass the date value directly
      };

      console.log("Sending update with data:", sanitizedData);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal memperbarui data. " + (errorData.message || ""),
          variant: "destructive",
        });
        return false;
      }
  
      toast({
        title: "Berhasil",
        description: "Data keuangan berhasil diperbarui",
      });
      return true;
    } catch (error) {
      console.error("Error saat memperbarui data:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui data",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  
  // DELETE - Delete Data
  const deleteData = async (id) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: "Gagal menghapus data. " + (errorData.message || ""),
          variant: "destructive",
        });
        return false;
      }
  
      toast({
        title: "Berhasil",
        description: "Data keuangan berhasil dihapus",
      });
      return true;
    } catch (error) {
      console.error("Error saat menghapus data:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
      return false;
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "jumlah") {
    // Hapus semua karakter kecuali angka
    const numericOnly = value.replace(/\D/g, "");

    setFormData({
      ...formData,
      [name]: numericOnly // simpan sebagai angka murni
    });
  } else {
    setFormData({
      ...formData,
      [name]: value
    });
  }
};

  const handleAddNew = () => {
    setFormData({
      jenis: "",
      jumlah: "",
      sumber: "",
      deskripsi: "",
      tanggal: getCurrentFormattedDate() // Set default date to today
    })
    setIsEditing(false)
    setIsAddModalOpen(true)
  }

  const handleEdit = (item) => {
    // Format the date string to ensure it's in YYYY-MM-DD format for the date input
    let formattedDate = item.tanggal;
    
    // If the date from API isn't in the right format, try to convert it
    if (item.tanggal && !item.tanggal.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const date = new Date(item.tanggal);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error("Error formatting date:", e);
        formattedDate = getCurrentFormattedDate(); // Fallback to current date
      }
    }

    setFormData({
      ...item,
      tanggal: formattedDate,
      // Ensure jumlah is formatted appropriately if it's already in currency format
      jumlah: item.jumlah.toString().startsWith('Rp') ? item.jumlah : formatCurrency(item.jumlah)
    })
    setIsEditing(true)
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = async () => {
    // Validate form data
    if (!formData.jenis || !formData.jumlah || !formData.sumber || !formData.tanggal) {
      toast({
        title: "Error",
        description: "Semua kolom wajib diisi kecuali deskripsi",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing) {
        const success = await updateData(formData.id, formData);
        if (success) {
          await fetchData();
          setIsAddModalOpen(false);
        }
      } else {
        const success = await createData(formData);
        if (success) {
          await fetchData();
          setIsAddModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Gagal submit form:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async () => {
    try {
      const success = await deleteData(selectedItem.id);
      if (success) {
        await fetchData();
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive",
      });
    }
  }

  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  // Format angka fe
 const formatCurrency = (amount) => {
  if (!amount) return "Rp 0";
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <BreadcrumbPage>Keuangan</BreadcrumbPage>
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
                    <CardTitle>Keuangan</CardTitle>
                    <CardDescription>Kelola data keuangan</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data keuangan..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Keuangan dengan komponen Tabel */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-12 font-medium">ID</TableHead>
                        <TableHead className="font-medium">Tanggal</TableHead>
                        <TableHead className="font-medium">Jenis</TableHead>
                        <TableHead className="font-medium">Jumlah</TableHead>
                        <TableHead className="font-medium">Sumber</TableHead>
                        <TableHead className="font-medium">Deskripsi</TableHead>
                        <TableHead className="text-right font-medium">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {item.tanggal}
                              </div>
                            </TableCell>
                            <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.jenis === "pemasukan"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.jenis === "pemasukan" ? (
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownCircle className="h-3 w-3 mr-1" />
                              )}
                              {item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}
                            </span>
                            </TableCell>
                            <TableCell className={item.jenis === "pemasukan" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {formatCurrency(item.jumlah)}
                            </TableCell>
                            <TableCell>{item.sumber}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={item.deskripsi}>
                              {item.deskripsi}
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
                          <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                            Tidak ada data keuangan
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
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
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
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Dialog Detail Keuangan */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detail</DialogTitle>
                  <DialogDescription>Informasi lengkap data keuangan.</DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-3 text-sm py-2">
                    <Separator />
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">ID:</span>
                      <span className="col-span-2">{detailItem.id}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Tanggal:</span>
                      <span className="col-span-2">{detailItem.tanggal}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Jenis:</span>
                      <span className="col-span-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            detailItem.jenis === "pemasukan"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {detailItem.jenis === "pemasukan" ? (
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 mr-1" />
                          )}
                          {detailItem.jenis.charAt(0).toUpperCase() + detailItem.jenis.slice(1)}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Jumlah:</span>
                      <span className={`col-span-2 ${detailItem.jenis === "pemasukan" ? "text-green-600 font-medium" : "text-red-600 font-medium"}`}>
                        {formatCurrency(detailItem.jumlah)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Sumber:</span>
                      <span className="col-span-2">{detailItem.sumber}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                      <span className="font-semibold">Deskripsi:</span>
                      <span className="col-span-2">{detailItem.deskripsi}</span>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Data" : "Tambah Data Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Ubah data di bawah ini." : "Isi detail untuk data baru."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tanggal">Tanggal <span className="text-red-500">*</span></Label>
                    <Input
                      id="tanggal"
                      name="tanggal"
                      type="date"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={formData.touched?.tanggal && !formData.tanggal ? "border-red-500" : ""}
                      onBlur={() => {
                        setFormData(prev => ({
                          ...prev,
                          touched: {
                            ...prev.touched,
                            tanggal: true
                          }
                        }))
                      }}
                    />
                    {formData.touched?.tanggal && !formData.tanggal && (
                      <p className="text-sm text-red-500 mt-1">Tanggal harus diisi</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenis">Jenis <span className="text-red-500">*</span></Label>
                    <select
                      id="jenis"
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className={`flex h-10 w-full rounded-md border ${formData.touched?.jenis && !formData.jenis ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      disabled={isLoading}
                      onBlur={() => {
                        setFormData(prev => ({
                          ...prev,
                          touched: {
                            ...prev.touched,
                            jenis: true
                          }
                        }))
                      }}
                    >
                      <option value="">Pilih jenis</option>
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                    {formData.touched?.jenis && !formData.jenis && (
                      <p className="text-sm text-red-500 mt-1">Jenis harus dipilih</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jumlah">Jumlah <span className="text-red-500">*</span></Label>
                    <Input
                      id="jumlah"
                      name="jumlah"
                      value={
                        formData.jumlah
                          ? `Rp ${Number(formData.jumlah).toLocaleString("id-ID")}`
                          : ""
                      }
                      onChange={handleInputChange}
                      placeholder="Rp 0"
                      disabled={isLoading}
                      className={formData.touched?.jumlah && !formData.jumlah ? "border-red-500" : ""}
                      onBlur={() => {
                        setFormData(prev => ({
                          ...prev,
                          touched: {
                            ...prev.touched,
                            jumlah: true
                          }
                        }))
                      }}
                    />
                    {formData.touched?.jumlah && !formData.jumlah && (
                      <p className="text-sm text-red-500 mt-1">Jumlah harus diisi</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sumber">Sumber <span className="text-red-500">*</span></Label>
                    <select
                      id="sumber"
                      name="sumber"
                      value={formData.sumber}
                      onChange={handleInputChange}
                      className={`flex h-10 w-full rounded-md border ${formData.touched?.sumber && !formData.sumber ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      disabled={isLoading}
                      onBlur={() => {
                        setFormData(prev => ({
                          ...prev,
                          touched: {
                            ...prev.touched,
                            sumber: true
                          }
                        }))
                      }}
                    >
                      <option value="">Pilih sumber</option>
                      <option value="infaq">Infaq</option>
                      <option value="sedekah">Sedekah</option>
                      <option value="donasi">Donasi</option>
                      <option value="zakat">Zakat</option>
                      <option value="wakaf">Wakaf</option>
                      <option value="kegiatan">Dana Kegiatan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                    {formData.touched?.sumber && !formData.sumber && (
                      <p className="text-sm text-red-500 mt-1">Sumber harus dipilih</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Input
                      id="deskripsi"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      placeholder="Masukkan deskripsi"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>Batal</Button>
                  <Button onClick={handleFormSubmit} disabled={isLoading || !formData.tanggal || !formData.jenis || !formData.jumlah || !formData.sumber}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Menyimpan..." : "Menambahkan..."}
                      </>
                    ) : (
                      isEditing ? "Simpan Perubahan" : "Tambah Data"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Penghapusan akan menghilangkan data keuangan
                    {selectedItem && ` dengan ID: ${selectedItem.id}`} secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}