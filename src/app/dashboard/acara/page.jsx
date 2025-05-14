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
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
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
    DialogTitle } from "@/components/ui/dialog"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle } from "@/components/ui/alert-dialog"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast";


export default function Page() {
  const API_BASE_URL = "http://127.0.0.1:8000/api/acara"

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ 
    nama_acara: "", 
    deskripsi: "", 
    tanggal: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item =>
      (item.nama_acara && item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tanggal && item.tanggal.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      const result = await response.json()
      
      if (result && result.data && Array.isArray(result.data)) {
        setData(result.data)
        setFilteredData(result.data)
      } else if (result && Array.isArray(result)) {
        setData(result)
        setFilteredData(result)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Gagal memuat data acara:", error)
      setData([])
      setFilteredData([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEventDetails = async (id) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      const result = await response.json()
      
      if (result && result.data) {
        setDetailItem(result.data)
      } else {
        setDetailItem(result)
      }
    } catch (error) {
      console.error("Gagal memuat detail acara:", error)
      setDetailItem(null)
    } finally {
      setIsDetailModalOpen(true)
      setIsLoading(false)
    }
  }

  const createEvent = async (eventData) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      })
      
      const result = await response.json()
      if (result && result.status === "success") {
        toast.success("Data Acara berhasil ditambahkan");
      }
    } catch (error) {
      console.error("Gagal menambahkan acara:", error)
    } finally {
      fetchEvents()
      setIsLoading(false)
    }
  }

  const updateEvent = async (id, eventData) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      })
      
      const result = await response.json()
      if (result && result.status === "success") {
        toast.success("Data Acara berhasil diperbarui");
      }
    } catch (error) {
      console.error("Gagal memperbarui acara:", error)
    } finally {
      fetchEvents()
      setIsLoading(false)
    }
  }

  const deleteEvent = async (id) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      if (result && result.status === "success") {
        toast.success("Data Acara berhasil dihapus");
      }
    } catch (error) {
      console.error("Gagal menghapus acara:", error)
    } finally {
      fetchEvents()
      setIsLoading(false)
    }
  }

  // Modifikasi handleInputChange untuk langsung mengecek duplikasi saat input berubah
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      touched: {
        ...prev.touched,
        [name]: true
      }
    }));
    
    if (name === 'nama_acara') {
      checkDuplicateName(value);
    }
  };

  // Fixed form initialization to include touched property
  const handleAddNew = () => {
    setFormData({ 
      nama_acara: "", 
      deskripsi: "", 
      tanggal: "",
      touched: {},
      namaDuplicate: false
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  // Fixed handleEdit to include touched property and reset namaDuplicate
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama_acara: item.nama_acara || "",
      deskripsi: item.deskripsi || "",
      tanggal: item.tanggal || "",
      touched: {},
      namaDuplicate: false
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formData.nama_acara) {
      toast({ title: "Error", description: "Nama acara wajib diisi", variant: "destructive" })
      return
    }

    if (isEditing) {
      updateEvent(formData.id, formData)
    } else {
      createEvent(formData)
    }
    setIsAddModalOpen(false)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = () => {
    deleteEvent(selectedItem.id)
    setIsDeleteModalOpen(false)
  }

  // Handle detail view
  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  // Fixed checkDuplicateName function
  const checkDuplicateName = (nama) => {
    // If editing, ignore the current item's name to avoid false duplicate detection
    if (isEditing && formData.id) {
      const isDuplicate = data.some(event => 
        event.id !== formData.id && 
        event.nama_acara && 
        event.nama_acara.toLowerCase() === nama.toLowerCase()
      );
      
      setFormData(prev => ({
        ...prev,
        namaDuplicate: isDuplicate
      }));
      return;
    }
    
    // Check against all existing events
    const isDuplicate = data.some(event => 
      event.nama_acara && 
      event.nama_acara.toLowerCase() === nama.toLowerCase()
    );
    
    setFormData(prev => ({
      ...prev,
      namaDuplicate: isDuplicate
    }));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
                  <BreadcrumbPage>Acara</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data Acara</CardTitle>
                    <CardDescription>Kelola data acara </CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Acara
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data acara..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">
                      <div className="flex justify-center mb-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <p className="font-medium">Memuat data...</p>
                    </div>
                ) : (
                  <div className="rounded-md border overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Acara</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.nama_acara}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                                {item.deskripsi && item.deskripsi.length > 70 
                                  ? `${item.deskripsi.substring(0, 70)}...` 
                                  : item.deskripsi || '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDetails(item)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDeleteClick(item)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                              {searchTerm ? "Tidak ada hasil pencarian" : "Tidak ada data acara"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center w-full gap-1 mt-2">
                    <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => paginate(i + 1)} className="w-8 h-8">
                        {i + 1}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Modal Tambah/Edit */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Acara" : "Tambah Acara"}</DialogTitle>
                    <DialogDescription>Isi form berikut untuk {isEditing ? "mengubah" : "menambahkan"} acara.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nama_acara">Nama Acara <span className="text-red-500">*</span></Label>
                        <Input
                        id="nama_acara"
                        name="nama_acara"
                        value={formData.nama_acara}
                        onChange={handleInputChange}
                        placeholder="Isi nama acara di sini..."
                        className={
                            (formData.nama_acara === "" && formData.touched?.nama_acara) || 
                            formData.namaDuplicate ? 
                            "border-red-500" : ""
                        }
                        onBlur={() => {
                            // Validasi ketika field kehilangan fokus
                            setFormData(prev => ({
                                ...prev,
                                touched: {
                                    ...prev.touched,
                                    nama_acara: true
                                }
                            }));
                            
                            // Cek duplikasi nama
                            checkDuplicateName(formData.nama_acara);
                        }}
                        />
                        {formData.nama_acara === "" && formData.touched?.nama_acara && (
                            <p className="text-sm text-red-500 mt-1">Nama acara harus diisi</p>
                        )}
                        {formData.namaDuplicate && (
                            <p className="text-sm text-red-500 mt-1">Nama acara sudah digunakan. Harap gunakan nama lain.</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deskripsi">Deskripsi </Label>
                        <Textarea
                        id="deskripsi"
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        placeholder="Isi deskripsi acara di sini..."
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                    <Button 
                        onClick={handleFormSubmit} 
                        disabled={isLoading || formData.nama_acara === "" || formData.namaDuplicate}
                    >
                        {isLoading ? "Menyimpan..." : isEditing ? "Update" : "Tambah"}
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Hapus */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Data acara <strong>{selectedItem?.nama_acara}</strong> akan dihapus secara permanen.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isLoading}>
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal Detail */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail Pembayaran</DialogTitle>
                  <DialogDescription>Informasi lengkap data pembayaran.</DialogDescription>
                    </DialogHeader>
                    <Separator />
                     {detailItem && (
                      <div className="grid grid-cols-4 gap-1">
                        <p className="font-medium text-gray-500">Nama Acara:</p>
                        <p className="col-span-1">{detailItem.nama_acara}</p>
                      </div>
                    )}
                    {detailItem && (
                      <div className="grid grid-cols-4 gap-1">
                        <p className="font-medium text-gray-500">Deskripsi:</p>
                        <p className="col-span-1">{detailItem.deskripsi}</p>
                      </div>
                    )}
                </DialogContent>
            </Dialog>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}