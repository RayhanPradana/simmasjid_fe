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
  Clock,
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
  const API_BASE_URL = "http://127.0.0.1:8000/api/sesi"

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ 
    jam_mulai: "", 
    jam_selesai: "", 
    deskripsi: "" 
  })
  const [formErrors, setFormErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item =>
      (item.jam_mulai && item.jam_mulai.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.jam_selesai && item.jam_selesai.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  const fetchSessions = async () => {
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
      
      if (Array.isArray(result)) {
        setData(result)
        setFilteredData(result)
      } else if (result && Array.isArray(result.data)) {
        setData(result.data)
        setFilteredData(result.data)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Gagal memuat data sesi:", error)
      setData([])
      setFilteredData([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionDetails = async (id) => {
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
      console.error("Gagal memuat detail sesi:", error)
      setDetailItem(null)
    } finally {
      setIsDetailModalOpen(true)
      setIsLoading(false)
    }
  }

  const createSession = async (sessionData) => {
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
        body: JSON.stringify(sessionData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("Data Sesi berhasil ditambahkan");
        fetchSessions()
        setIsAddModalOpen(false)
        return true
      } else {
        // Handle validation errors
        if (result.errors) {
          setFormErrors(result.errors)
        } else {
          toast.error("Gagal menambahkan sesi");
        }
        return false
      }
    } catch (error) {
      console.error("Gagal menambahkan sesi:", error)
      toast.error("Gagal menambahkan sesi");
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateSession = async (id, sessionData) => {
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
        body: JSON.stringify(sessionData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("Data Sesi berhasil diperbarui");
        fetchSessions()
        setIsAddModalOpen(false)
        return true
      } else {
        // Handle validation errors
        if (result.errors) {
          setFormErrors(result.errors)
        } else {
          toast.error("Gagal memperbarui sesi");
        }
        return false
      }
    } catch (error) {
      console.error("Gagal memperbarui sesi:", error)
      toast.error("Gagal memperbarui sesi");
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSession = async (id) => {
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
      
      if (response.ok) {
        toast.success("Data Sesi berhasil dihapus");
        fetchSessions()
      } else {
        toast.error("Gagal menghapus sesi");
      }
    } catch (error) {
      console.error("Gagal menghapus sesi:", error)
      toast.error("Gagal menghapus sesi");
    } finally {
      setIsLoading(false)
      setIsDeleteModalOpen(false)
    }
  }

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  // Format for display in the table and details
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset specific field error when editing
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
    
    // Special handling for deskripsi field
    if (name === 'deskripsi') {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      // Format as "Sesi-X"
      const formattedValue = numericValue ? `Sesi-${numericValue}` : '';
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
        touched: {
          ...prev.touched,
          [name]: true
        }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      touched: {
        ...prev.touched,
        [name]: true
      }
    }));
  };

  // Time validation
  const validateTimeFields = () => {
    const errors = {};
    
    // Validate jam_mulai
    if (!formData.jam_mulai) {
      errors.jam_mulai = "Jam mulai wajib diisi";
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.jam_mulai)) {
      errors.jam_mulai = "Format jam mulai harus HH:MM";
    }
    
    // Validate jam_selesai
    if (!formData.jam_selesai) {
      errors.jam_selesai = "Jam selesai wajib diisi";
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.jam_selesai)) {
      errors.jam_selesai = "Format jam selesai harus HH:MM";
    }
    
    // Validate jam_selesai is after jam_mulai
    if (formData.jam_mulai && formData.jam_selesai && 
        formData.jam_mulai >= formData.jam_selesai) {
      errors.jam_selesai = "Jam selesai harus setelah jam mulai";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNew = () => {
    setFormData({ 
      jam_mulai: "", 
      jam_selesai: "", 
      deskripsi: "",
      touched: {}
    });
    setFormErrors({});
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      jam_mulai: formatTime(item.jam_mulai),
      jam_selesai: formatTime(item.jam_selesai),
      deskripsi: item.deskripsi || "",
      touched: {}
    });
    setFormErrors({});
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = () => {
    // Validate form before submission
    if (!validateTimeFields()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      deskripsi: formData.deskripsi || ""
    };

    if (isEditing) {
      updateSession(formData.id, submitData);
    } else {
      createSession(submitData);
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    deleteSession(selectedItem.id);
  };

  // Handle detail view
  const handleDetails = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  // Check for duplicate sessions
  const isDuplicateSession = (startTime, endTime) => {
    // If editing, exclude the current item
    const otherSessions = isEditing ? 
      data.filter(session => session.id !== formData.id) : data;
    
    return otherSessions.some(session => {
      const sessionStart = formatTime(session.jam_mulai);
      const sessionEnd = formatTime(session.jam_selesai);
      
      // Check for overlapping time ranges
      return (startTime >= sessionStart && startTime < sessionEnd) || 
             (endTime > sessionStart && endTime <= sessionEnd) ||
             (startTime <= sessionStart && endTime >= sessionEnd);
    });
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
                  <BreadcrumbPage>Sesi</BreadcrumbPage>
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
                    <CardTitle>Data Sesi</CardTitle>
                    <CardDescription>Kelola data sesi waktu</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Sesi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data sesi..."
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Sesi</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  {formatTimeRange(item.jam_mulai, item.jam_selesai)}
                                </div>
                              </td>
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
                            <td colSpan="3" className="px-4 py-6 text-center text-sm text-gray-500">
                              {searchTerm ? "Tidak ada hasil pencarian" : "Tidak ada data sesi"}
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
                    <DialogTitle>{isEditing ? "Edit Sesi" : "Tambah Sesi"}</DialogTitle>
                    <DialogDescription>Isi form berikut untuk {isEditing ? "mengubah" : "menambahkan"} sesi waktu.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jam_mulai">Jam Mulai <span className="text-red-500">*</span></Label>
                        <Input
                          id="jam_mulai"
                          name="jam_mulai"
                          type="time"
                          value={formData.jam_mulai}
                          onChange={handleInputChange}
                          className={formErrors.jam_mulai ? "border-red-500" : ""}
                        />
                        {formErrors.jam_mulai && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.jam_mulai}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="jam_selesai">Jam Selesai <span className="text-red-500">*</span></Label>
                        <Input
                          id="jam_selesai"
                          name="jam_selesai"
                          type="time"
                          value={formData.jam_selesai}
                          onChange={handleInputChange}
                          className={formErrors.jam_selesai ? "border-red-500" : ""}
                        />
                        {formErrors.jam_selesai && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.jam_selesai}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deskripsi">Deskripsi (Nomor Sesi) <span className="text-red-500">*</span></Label>
                        <Input
                          id="deskripsi"
                          name="deskripsi"
                          value={formData.deskripsi}
                          onChange={handleInputChange}
                          placeholder="Contoh: masukkan angka 1 untuk Sesi-1"
                          className={formErrors.deskripsi ? "border-red-500" : ""}
                        />
                        <p className="text-xs text-gray-500">
                          Masukkan angka untuk membuat format Sesi-X (contoh: 1 akan menjadi Sesi-1)
                        </p>
                        {formErrors.deskripsi && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.deskripsi}</p>
                        )}
                    </div>
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                    <Button 
                        onClick={handleFormSubmit} 
                        disabled={isLoading || !formData.jam_mulai || !formData.jam_selesai}
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
                        Sesi waktu <strong>{selectedItem && formatTimeRange(selectedItem.jam_mulai, selectedItem.jam_selesai)}</strong> akan dihapus secara permanen.
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
                  <DialogTitle>Detail Sesi</DialogTitle>
                  <DialogDescription>Informasi lengkap data sesi waktu.</DialogDescription>
                    </DialogHeader>
                    <Separator />
                     {detailItem && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <p className="font-medium text-gray-500">Waktu:</p>
                          <p className="col-span-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            {formatTimeRange(detailItem.jam_mulai, detailItem.jam_selesai)}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <p className="font-medium text-gray-500">Durasi:</p>
                          <p className="col-span-2">
                            {/* Calculate duration in minutes */}
                            {(() => {
                              if (!detailItem.jam_mulai || !detailItem.jam_selesai) return '-';
                              
                              const start = new Date(`2000-01-01T${detailItem.jam_mulai}`);
                              const end = new Date(`2000-01-01T${detailItem.jam_selesai}`);
                              const diffMinutes = Math.round((end - start) / 60000);
                              
                              const hours = Math.floor(diffMinutes / 60);
                              const minutes = diffMinutes % 60;
                              
                              if (hours > 0) {
                                return `${hours} jam${minutes > 0 ? ` ${minutes} menit` : ''}`;
                              }
                              return `${minutes} menit`;
                            })()}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <p className="font-medium text-gray-500">Deskripsi:</p>
                          <p className="col-span-2">{detailItem.deskripsi || '-'}</p>
                        </div>
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