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
import { Editor } from "@tinymce/tinymce-react"


export default function Page() {
  // Add editor loading state
  const [isEditorLoading, setIsEditorLoading] = useState(true);

  // Add TinyMCE API key
  const TINYMCE_API_KEY = '4vf36i6pphb405aikdue5x3v9zo1ae5igdpehc3t8dcwni8f' // Replace with your actual API key

  // const API_BASE_URL = "http://127.0.0.1:8000/api/acara"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Update editor config
  const editorConfig = {
    height: 300,
    menubar: false,
    branding: false,
    statusbar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap',
      'anchor', 'searchreplace', 'visualblocks',
      'insertdatetime', 'table', 'wordcount'
    ],
    toolbar: 'styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | removeformat',
    toolbar_mode: 'sliding',
    toolbar_sticky: true,
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; font-size: 14px }',
    style_formats: [
      { title: 'Paragraph', format: 'p' },
      { title: 'Heading 1', format: 'h1' },
      { title: 'Heading 2', format: 'h2' },
      { title: 'Heading 3', format: 'h3' }
    ],
    style_formats_merge: false,
    style_formats_autohide: true,
    setup: (editor) => {
      editor.on('init', () => {
        setIsEditorLoading(false);
      });
    }
  }

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
    harga: "",
    gambar: null,
    status: "tersedia",
    touched: {},
    namaDuplicate: false
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
      (item.harga && item.harga.toString().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/api/acara`, {
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
      const response = await fetch(`${apiUrl}/api/acara/${id}`, {
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
      const formDataToSend = new FormData()
      formDataToSend.append('nama_acara', eventData.nama_acara)
      formDataToSend.append('deskripsi', eventData.deskripsi)
      formDataToSend.append('harga', eventData.harga)
      formDataToSend.append('status', eventData.status)
      if (eventData.gambar) {
        formDataToSend.append('gambar', eventData.gambar)
      }

      const response = await fetch(`${apiUrl}/api/acara`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
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
      const formDataToSend = new FormData()
      // Add _method field for Laravel to handle PUT request
      formDataToSend.append('_method', 'PUT')
      formDataToSend.append('nama_acara', eventData.nama_acara)
      formDataToSend.append('deskripsi', eventData.deskripsi)
      formDataToSend.append('harga', eventData.harga)
      formDataToSend.append('status', eventData.status)
      if (eventData.gambar) {
        formDataToSend.append('gambar', eventData.gambar)
      }

      const response = await fetch(`${apiUrl}/api/acara/${id}`, {
        method: "POST", // Keep as POST for FormData
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      })
      
      const result = await response.json()
      if (result && result.status === "success") {
        toast.success("Data Acara berhasil diperbarui");
        setIsAddModalOpen(false);
      } else {
        toast.error(result.message || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Gagal memperbarui acara:", error)
      toast.error("Gagal memperbarui data");
    } finally {
      fetchEvents()
      setIsLoading(false)
    }
  }

  const deleteEvent = async (id) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/api/acara/${id}`, {
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

  // Format currency to IDR
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Modifikasi handleInputChange untuk langsung mengecek duplikasi saat input berubah
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
        touched: {
          ...prev.touched,
          [name]: true
        }
      }));
    } else if (name === 'harga') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
        touched: {
          ...prev.touched,
          [name]: true
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        touched: {
          ...prev.touched,
          [name]: true
        }
      }));
    }
    
    if (name === 'nama_acara') {
      checkDuplicateName(value);
    }
  };

  // Fixed form initialization to include touched property
  const handleAddNew = () => {
    setFormData({ 
      nama_acara: "", 
      deskripsi: "", 
      harga: "",
      status: "tersedia",
      gambar: null,
      touched: {},
      namaDuplicate: false
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  // Update handleEdit to include gambar_url for showing existing image
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama_acara: item.nama_acara || "",
      deskripsi: item.deskripsi || "",
      harga: item.harga || "",
      status: item.status || "tersedia",
      gambar: null,
      gambar_url: item.gambar_url, // Add this to show existing image
      touched: {},
      namaDuplicate: false
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  // Add handleFileChange function
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        toast.error('Format file harus jpeg, png, atau jpg');
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        toast.error('Ukuran file maksimal 2MB');
        e.target.value = '';
        return;
      }

      setFormData(prev => ({ ...prev, gambar: file }));
    }
  };

  // Add handleEditorChange function
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      deskripsi: content
    }));
  };

  const handleFormSubmit = () => {
    if (!formData.nama_acara) {
      toast.error("Nama acara wajib diisi");
      return;
    }

    if (!formData.harga) {
      toast.error("Harga acara wajib diisi");
      return;
    }

    if (!formData.status) {
      toast.error("Status acara wajib diisi");
      return;
    }

    // Prepare data for submission with FormData
    const submitData = {
      nama_acara: formData.nama_acara,
      deskripsi: formData.deskripsi || '',
      harga: parseInt(formData.harga),
      status: formData.status,
      gambar: formData.gambar
    };

    if (isEditing) {
      updateEvent(formData.id, submitData);
    } else {
      createEvent(submitData);
    }
    setIsAddModalOpen(false);
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

  // Add new function near other handlers
  const handleDescriptionClick = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Acara</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {item.gambar_url ? (
                                  <img
                                    src={item.gambar_url}
                                    alt={item.nama_acara}
                                    className="h-16 w-16 object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.src = "https://placehold.co/64x64?text=No+Image";
                                    }}
                                  />
                                ) : (
                                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                                    <span className="text-gray-400 text-xs text-center">No Image</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.nama_acara}</td>
                              <td 
                                className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs cursor-pointer hover:bg-gray-100"
                                onClick={() => handleDescriptionClick(item)}
                                title="Klik untuk melihat deskripsi lengkap"
                              >
                                <div 
                                  dangerouslySetInnerHTML={{ 
                                    __html: item.deskripsi && item.deskripsi.length > 70 
                                      ? `${item.deskripsi.substring(0, 70)}...` 
                                      : item.deskripsi || '-'
                                  }}
                                  className="prose prose-sm max-w-none"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(item.harga)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  item.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {item.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                                </span>
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
                            <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
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
                        <div className="border rounded-md relative min-h-[300px]">
                          {isEditorLoading && (
                            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                          )}
                          <Editor
                            id="tinymce-editor"
                            apiKey={TINYMCE_API_KEY}
                            init={editorConfig}
                            value={formData.deskripsi}
                            onEditorChange={handleEditorChange}
                            onInit={() => {
                              // Reset loading state when editor is initialized
                              setIsEditorLoading(false);
                            }}
                          />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="harga">Harga <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1.5 text-gray-500">Rp</span>
                          <Input
                            id="harga"
                            name="harga"
                            type="text"
                            value={formData.harga}
                            onChange={handleInputChange}
                            placeholder="0"
                            className={
                              (formData.harga === "" && formData.touched?.harga) ? 
                              "pl-12 border-red-500" : "pl-12"
                            }
                            onBlur={() => {
                              setFormData(prev => ({
                                ...prev,
                                touched: {
                                  ...prev.touched,
                                  harga: true
                                }
                              }));
                            }}
                          />
                        </div>
                        {formData.harga === "" && formData.touched?.harga && (
                          <p className="text-sm text-red-500 mt-1">Harga acara harus diisi</p>
                        )}
                        {formData.harga && (
                          <p className="text-sm text-gray-500 mt-1">
                            Preview: {formatCurrency(formData.harga)}
                          </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label>Gambar {!isEditing && <span className="text-red-500">*</span>}</Label>
                        {isEditing ? (
                          <div className="space-y-4">
                            {formData.gambar_url && (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-500">Gambar saat ini:</p>
                                <img
                                  src={formData.gambar_url}
                                  alt="Current"
                                  className="h-32 w-32 object-cover rounded-md border"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Upload gambar baru (opsional):</p>
                              <Input
                                type="file"
                                name="gambar"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleFileChange}
                                disabled={isLoading}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Format: JPEG, PNG, JPG (Max. 2MB)
                              </p>
                              {formData.gambar && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500">Preview gambar baru:</p>
                                  <img
                                    src={URL.createObjectURL(formData.gambar)}
                                    alt="Preview"
                                    className="mt-2 h-32 w-32 object-cover rounded-md border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Input
                              type="file"
                              name="gambar"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handleFileChange}
                              disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Format: JPEG, PNG, JPG (Max. 2MB)
                            </p>
                            {formData.gambar && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Preview:</p>
                                <img
                                  src={URL.createObjectURL(formData.gambar)}
                                  alt="Preview"
                                  className="mt-2 h-32 w-32 object-cover rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="tersedia">Tersedia</option>
                          <option value="tidaktersedia">Tidak Tersedia</option>
                        </select>
                    </div>
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                    <Button 
                        onClick={handleFormSubmit} 
                        disabled={isLoading || formData.nama_acara === "" || formData.harga === "" || formData.namaDuplicate}
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
              <DialogContent className="max-w-3xl"> {/* Changed from sm:max-w-md to max-w-3xl */}
                <DialogHeader>
                  <DialogTitle>Detail Acara</DialogTitle>
                  <DialogDescription>Informasi lengkap data acara.</DialogDescription>
                </DialogHeader>
                <Separator />
                {detailItem && (
                  <div className="space-y-4"> {/* Increased spacing */}
                    <div className="grid grid-cols-5 gap-4"> {/* Changed from grid-cols-3 to grid-cols-5 for better layout */}
                      <p className="font-medium text-gray-500">Nama Acara:</p>
                      <p className="col-span-4">{detailItem.nama_acara}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <p className="font-medium text-gray-500">Deskripsi:</p>
                      <div 
                        className="col-span-4 prose prose-sm max-w-none h-auto overflow-y-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: detailItem.deskripsi || '-'
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <p className="font-medium text-gray-500">Harga:</p>
                      <p className="col-span-4 font-semibold text-green-600">
                        {formatCurrency(detailItem.harga)}
                      </p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <p className="font-medium text-gray-500">Gambar:</p>
                      <div className="col-span-4">
                        {detailItem.gambar_url ? (
                          <img 
                            src={detailItem.gambar_url} 
                            alt={detailItem.nama_acara}
                            className="max-h-[300px] object-contain rounded-md" // Updated image sizing
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = document.createElement('p');
                              placeholder.className = 'text-gray-500';
                              placeholder.textContent = 'Gambar tidak dapat dimuat';
                              e.target.parentNode.appendChild(placeholder);
                            }}
                          />
                        ) : (
                          <p className="text-gray-500">Tidak ada gambar</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <p className="font-medium text-gray-500">Status:</p>
                      <div className="col-span-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          detailItem.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {detailItem.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                        </span>
                      </div>
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