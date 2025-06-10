"use client"

import { useState, useEffect, useRef } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react"

export default function Page() {
  // const API_BASE_URL = "http://127.0.0.1:8000/api/fasilitas"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ 
    nama_fasilitas: "", 
    keterangan: "", 
    harga: "",
    status: "",
    gambar: null,
    touched: {}
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDuplicateName, setIsDuplicateName] = useState(false)
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef(null);
  const itemsPerPage = 5

  const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || '4vf36i6pphb405aikdue5x3v9zo1ae5igdpehc3t8dcwni8f'; 

  // Reset form data function
  const resetFormData = () => {
    setFormData({
      nama_fasilitas: "",
      keterangan: "",
      harga: "",
      status: "",
      gambar: null,
      touched: {}
    });
    setIsDuplicateName(false);
  };

  // Fetch facilities data on component mount
  useEffect(() => {
    fetchFacilities()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item =>
      (item.nama_fasilitas && item.nama_fasilitas.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  // Check for duplicate facility name
  const checkDuplicateName = (name, currentId = null) => {
    return data.some(item => 
      item.nama_fasilitas && 
      item.nama_fasilitas.toLowerCase() === name.toLowerCase() && 
      item.id !== currentId
    );
  };

  // Fetch all facilities from API
  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/fasilitas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          return;
        }

        toast.error(`Gagal memuat data: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log("API response:", result); // Melihat format respons API
      
      // Perbaikan: Periksa format respons dan akses data dengan benar
      // Periksa apakah result.data ada dan merupakan array
      if (result && Array.isArray(result.data)) {
        setData(result.data);
        setFilteredData(result.data);
      }
      // Jika result sendiri adalah array
      else if (Array.isArray(result)) {
        setData(result);
        setFilteredData(result);
      }
      // Jika result.data adalah objek dengan properti yang berisi array data
      else if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        const dataArray = Object.values(result.data);
        if (Array.isArray(dataArray[0])) {
          setData(dataArray[0]);
          setFilteredData(dataArray[0]);
        } else {
          setData(dataArray);
          setFilteredData(dataArray);
        }
      }
      // Jika tidak ada data yang valid
      else {
        console.error("Invalid data format received:", result);
        setData([]);
        setFilteredData([]);
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
      toast.error("Gagal memuat data fasilitas");
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Perbaikan fungsi fetchFacilityDetails
  const fetchFacilityDetails = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/fasilitas/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          return;
        }
        
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Detail response:", result); // Log untuk debugging
      
      // Perbaikan: Periksa format respons dan akses data dengan benar
      if (result && result.data) {
        setDetailItem(result.data);
      } else if (result && typeof result === 'object') {
        // Jika data langsung ada di root result
        setDetailItem(result);
      } else {
        toast.error("Format data detail tidak valid");
      }
      
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error(`Failed to fetch facility details for ID ${id}:`, error);
      toast.error("Gagal memuat detail fasilitas");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Improve error handling in createFacility function
  const createFacility = async (facilityData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Check for duplicate facility name
      if (checkDuplicateName(facilityData.nama_fasilitas)) {
        setIsDuplicateName(true);
        toast.error("Nama fasilitas sudah ada. Gunakan nama yang berbeda.");
        setIsLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('nama_fasilitas', facilityData.nama_fasilitas);
      formDataToSend.append('keterangan', facilityData.keterangan || '');
      formDataToSend.append('harga', facilityData.harga || '0');
      formDataToSend.append('status', facilityData.status);
      if (facilityData.gambar) {
        formDataToSend.append('gambar', facilityData.gambar);
      }
      
      const response = await fetch(`${apiUrl}/api/fasilitas`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Gagal menambahkan fasilitas');
      }
      
      await fetchFacilities();
      toast.success("Data fasilitas berhasil ditambahkan");
    } catch (error) {
      console.error("Failed to create facility:", error);
      toast.error(`Gagal menambahkan fasilitas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Similarly update updateFacility function with better error handling
  const updateFacility = async (id, facilityData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Check for duplicate facility name, excluding the current item
      if (checkDuplicateName(facilityData.nama_fasilitas, id)) {
        setIsDuplicateName(true);
        toast.error("Nama fasilitas sudah ada. Gunakan nama yang berbeda.");
        setIsLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT'); // Add this for Laravel to handle PUT request
      formDataToSend.append('nama_fasilitas', facilityData.nama_fasilitas);
      formDataToSend.append('keterangan', facilityData.keterangan || '');
      formDataToSend.append('harga', facilityData.harga || '0');
      formDataToSend.append('status', facilityData.status);
      if (facilityData.gambar) {
        formDataToSend.append('gambar', facilityData.gambar);
      }
      
      const response = await fetch(`${apiUrl}/api/fasilitas/${id}`, {
        method: "POST", // Keep as POST for FormData
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Gagal memperbarui fasilitas');
      }
      
      await fetchFacilities();
      toast.success("Data fasilitas berhasil diperbarui");
    } catch (error) {
      console.error(`Failed to update facility ID ${id}:`, error);
      toast.error(`Gagal memperbarui fasilitas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Delete facility
  const deleteFacility = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/fasilitas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      await fetchFacilities(); // Refresh data
      toast.success("Data fasilitas berhasil dihapus");
    } catch (error) {
      console.error(`Failed to delete facility ID ${id}:`, error);
      toast.error(`Gagal menghapus fasilitas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        toast.error('Format file harus jpeg, png, jpg, atau svg');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset duplicate name error when changing name field
    if (name === "nama_fasilitas") {
      setIsDuplicateName(false);
    }
    
    // For price field, ensure proper decimal formatting
    if (name === "harga") {
      // Allow empty string or valid number with up to 2 decimal places
      const formattedValue = value === "" ? "" : parseFloat(value).toString();
      setFormData({ ...formData, harga: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const handleAddNew = () => {
    resetFormData();
    setIsEditing(false);
    setIsAddModalOpen(true);
  }

  const handleEdit = (item) => {
    console.log("Editing item:", item);
    
    setFormData({
      id: item.id,
      nama_fasilitas: item.nama_fasilitas || "",
      keterangan: item.keterangan || "",
      harga: item.harga || "",
      status: item.status || "",
      gambar: null, // Reset gambar when editing
      touched: {}
    });
    
    setIsEditing(true);
    setIsDuplicateName(false);
    setEditorKey(prev => prev + 1); // Force re-render when editing
    setIsAddModalOpen(true);
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  }

  const handleFormSubmit = () => {
    // Log the form data before submission to make sure fields are properly set
    console.log("Form data before submission:", formData);
    
    // Validate required fields
    if (!formData.nama_fasilitas || !formData.status) {
      // Mark fields as touched to show validation errors
      setFormData(prev => ({
        ...prev,
        touched: {
          ...prev.touched,
          nama_fasilitas: true,
          status: true
        }
      }));
      
      toast.error("Nama fasilitas dan status harus diisi");
      return;
    }
    
    // Check for duplicate name
    const isDuplicate = isEditing 
      ? checkDuplicateName(formData.nama_fasilitas, formData.id)
      : checkDuplicateName(formData.nama_fasilitas);
    
    if (isDuplicate) {
      setIsDuplicateName(true);
      toast.error("Nama fasilitas sudah ada. Gunakan nama yang berbeda.");
      return;
    }
    
    if (isEditing) {
      updateFacility(formData.id, formData);
    } else {
      createFacility(formData);
    }
    setIsAddModalOpen(false);
  }

  const handleDelete = () => {
    deleteFacility(selectedItem.id);
    setIsDeleteModalOpen(false);
  }

  const handleDetails = (item) => {
    fetchFacilityDetails(item.id);
  }
  
  // Format price to Indonesian Rupiah
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
  
  // Fungsi untuk memformat status dengan kapitalisasi yang benar
  const formatStatus = (status) => {
    if (!status) return '';
    
    status = status.toLowerCase();
    if (status === 'tersedia') {
      return 'Tersedia';
    } else if (status === 'tidaktersedia') {
      return 'Tidak Tersedia';
    } else {
      return status; // Mengembalikan status asli jika tidak cocok dengan kriteria
    }
  }
  
  // Status badge styling
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    status = status.toLowerCase();
    if (status === 'tersedia') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (status === 'tidaktersedia') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      editorRef.current = editor;
      editor.on('init', () => {
        setIsEditorLoading(false);
      });
    },
    init_instance_callback: (editor) => {
      editor.setContent(formData.keterangan || '');
      // Add error handling
      editor.on('error', (e) => {
        console.error('TinyMCE error:', e);
        setEditorKey(prev => prev + 1);
      });
    }
  };

  // Add handleEditorChange
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      keterangan: content
    }));
  };

  // Add useEffect for editor initialization
  useEffect(() => {
    if (isAddModalOpen) {
      setEditorKey(prev => prev + 1);
      setIsEditorLoading(true);
    }
  }, [isAddModalOpen]);

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
                  <BreadcrumbPage>Fasilitas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Data Fasilitas</CardTitle>
                    <CardDescription>Kelola data fasilitas dan aset</CardDescription>
                  </div>
                  <Button 
                    onClick={handleAddNew} 
                    size="sm" 
                    className="flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" /> Tambah Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data fasilitas..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Facilities Table */}
                <div className="rounded-md border shadow-sm overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b grid grid-cols-11 text-xs font-medium text-gray-500 uppercase">
                    <div className="px-4 py-3 col-span-1 text-left">Gambar</div>
                    <div className="px-4 py-3 col-span-2 text-left">Nama Fasilitas</div>
                    <div className="px-4 py-3 col-span-3 text-left">Keterangan</div>
                    <div className="px-4 py-3 col-span-2 text-left">Harga</div>
                    <div className="px-4 py-3 col-span-2 text-left">Status</div>
                    <div className="px-4 py-3 col-span-1 text-right">Aksi</div>
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="text-center py-10 text-gray-500">
                      <div className="flex justify-center mb-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <p className="font-medium">Memuat data...</p>
                    </div>
                  )}

                  {/* Table Content */}
                  {!isLoading && currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-11 border-b text-sm hover:bg-gray-50 transition-colors items-center">
                        <div className="px-4 py-3 col-span-1">
                          {item.gambar ? (
                            <img
                              src={`http://127.0.0.1:8000/storage/${item.gambar}`}
                              alt="Fasilitas"
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
                        </div>
                        <div className="px-4 py-3 col-span-2 font-medium text-left">{item.nama_fasilitas}</div>
                        <div 
                          className="px-4 py-3 col-span-3 text-gray-600 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleDetails(item)}
                        >
                          <div className="max-h-[100px] overflow-hidden relative">
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: item.keterangan && item.keterangan.length > 150
                                  ? `${item.keterangan.substring(0, 150)}...` 
                                  : item.keterangan || '-'
                              }}
                            />
                            {item.keterangan?.length > 150 && (
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent">
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 absolute bottom-0 left-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDetails(item);
                                  }}
                                >
                                  Lihat selengkapnya
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-4 py-3 col-span-2 font-medium text-gray-700 text-left">{formatPrice(item.harga)}</div>
                        <div className="px-4 py-3 col-span-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                            {formatStatus(item.status)}
                          </span>
                        </div>
                        <div className="px-4 py-3 col-span-1 flex justify-end">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDetails(item)}
                              title="Lihat Detail"
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => handleDeleteClick(item)}
                              title="Hapus"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : !isLoading && (
                    <div className="text-center py-10 text-gray-500">
                      <p className="font-medium">Tidak ada data fasilitas</p>
                      <p className="text-sm mt-1">Tambahkan fasilitas baru atau ubah kata kunci pencarian</p>
                    </div>
                  )}
                </div> 
              </CardContent>
              <CardFooter className="flex justify-center">
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1 || isLoading}
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
                        disabled={isLoading}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Detail Facility Dialog */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail Fasilitas</DialogTitle>
                  <DialogDescription>Informasi lengkap fasilitas.</DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-3 text-sm py-2">
                    <Separator />
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">ID:</p>
                      <p className="col-span-2">{detailItem.id}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Nama Fasilitas:</p>
                      <p className="col-span-2">{detailItem.nama_fasilitas}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Keterangan:</p>
                      <div 
                        className="col-span-2 prose prose-sm max-w-none overflow-y-auto max-h-[400px]"
                        dangerouslySetInnerHTML={{ 
                          __html: detailItem.keterangan || '-'
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Harga:</p>
                      <p className="col-span-2">{formatPrice(detailItem.harga)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Status:</p>
                      <p className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(detailItem.status)}`}>
                          {formatStatus(detailItem.status)}
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Gambar:</p>
                      <div className="col-span-2">
                        {detailItem.gambar ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${detailItem.gambar}`}
                            alt="Fasilitas"
                            className="max-w-[200px] rounded-md"
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
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add/Edit Facility Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
              if (!isLoading) {
                setIsAddModalOpen(open);
                // Reset form data when closing the modal
                if (!open) {
                  resetFormData();
                }
              }
            }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Perbarui detail fasilitas di bawah ini." : "Isi detail untuk fasilitas baru."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleFormSubmit();
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nama_fasilitas">
                        Nama Fasilitas <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nama_fasilitas"
                        name="nama_fasilitas"
                        value={formData.nama_fasilitas}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama fasilitas"
                        disabled={isLoading}
                        className={
                          (formData.touched?.nama_fasilitas && !formData.nama_fasilitas) || isDuplicateName 
                            ? "border-red-500 focus:ring-red-500" 
                            : ""
                        }
                      />
                      {isDuplicateName && (
                        <p className="text-xs text-red-500 mt-1">Nama fasilitas sudah digunakan.</p>
                      )}
                      {formData.touched?.nama_fasilitas && !formData.nama_fasilitas && (
                        <p className="text-xs text-red-500 mt-1">Nama fasilitas harus diisi.</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="keterangan">Keterangan</Label>
                      <div className="border rounded-md relative min-h-[300px]">
                        {isEditorLoading && (
                          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        )}
                        {isAddModalOpen && (
                          <Editor
                            key={`editor-${editorKey}`}
                            id={`tinymce-editor-${editorKey}`}
                            apiKey={TINYMCE_API_KEY}
                            init={editorConfig}
                            value={formData.keterangan}
                            onEditorChange={handleEditorChange}
                            onInit={() => {
                              setIsEditorLoading(false);
                            }}
                            onError={(e) => {
                              console.error('Editor failed to load:', e);
                              setIsEditorLoading(false);
                              setEditorKey(prev => prev + 1);
                            }}
                          />
                        )}
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
                      <Label htmlFor="status">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value, touched: { ...formData.touched, status: true } })}
                        disabled={isLoading}
                      >
                        <SelectTrigger 
                          id="status" 
                          className={
                            formData.touched?.status && !formData.status 
                              ? "border-red-500 focus:ring-red-500" 
                              : ""
                          }
                        >
                          <SelectValue placeholder="Pilih status fasilitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tersedia">Tersedia</SelectItem>
                          <SelectItem value="tidaktersedia">Tidak Tersedia</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.touched?.status && !formData.status && (
                        <p className="text-xs text-red-500 mt-1">Status harus dipilih.</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gambar">
                        Gambar Fasilitas
                      </Label>
                      <Input
                        id="gambar"
                        name="gambar"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Format: JPEG, PNG, JPG, SVG (Max. 2MB)
                      </p>
                      {formData.gambar && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">File terpilih: {formData.gambar.name}</p>
                          {typeof formData.gambar === 'object' && (
                            <img
                              src={URL.createObjectURL(formData.gambar)}
                              alt="Preview"
                              className="mt-2 h-32 w-32 object-cover rounded-md"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading || isDuplicateName}
                      className="gap-1"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isEditing ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus fasilitas <span className="font-medium">{selectedItem?.nama_fasilitas}</span>? 
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-1"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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