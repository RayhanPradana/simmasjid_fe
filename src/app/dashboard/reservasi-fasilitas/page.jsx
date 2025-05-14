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
  AlertCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";


// API base URL
const API_BASE_URL = "http://127.0.0.1:8000/api/reservasi"

export default function Page() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    acara_id: "",
    fasilitas_id: "",
    user_id: "",
    tgl_reservasi: "",
    jam_mulai: "",
    jam_selesai: "",
    harga: "",
    status_pembayaran: "unpaid",
  });
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [acara, setAcara] = useState([])
  const [fasilitas, setFasilitas] = useState([])
  const [users, setUsers] = useState([])
  const itemsPerPage = 5

  // Fetch all reservations from API
  const fetchReservations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          return
        }

        toast.error(`Gagal memuat data: ${response.status}`);
        return
      }

      const result = await response.json()
      console.log("API response:", result)
      
      // Check response format and access data correctly
      if (result && Array.isArray(result.data)) {
        setData(result.data)
        setFilteredData(result.data)
      }
      // If result itself is an array
      else if (Array.isArray(result)) {
        setData(result)
        setFilteredData(result)
      }
      // If result.data is an object with property containing array data
      else if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        const dataArray = Object.values(result.data)
        if (Array.isArray(dataArray[0])) {
          setData(dataArray[0])
          setFilteredData(dataArray[0])
        } else {
          setData(dataArray)
          setFilteredData(dataArray)
        }
      }
      // If no valid data
      else {
        console.error("Invalid data format received:", result)
        setData([])
        setFilteredData([])
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error)
      toast.error("Gagal memuat data reservasi");
      setData([])
      setFilteredData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch related data for dropdowns
  const fetchRelatedData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Fetch acara data
      const acaraResponse = await fetch("http://127.0.0.1:8000/api/acara", {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (acaraResponse.ok) {
        const acaraResult = await acaraResponse.json()
        setAcara(acaraResult.data || acaraResult)
      }
      
      // Fetch fasilitas data
      const fasilitasResponse = await fetch("http://127.0.0.1:8000/api/fasilitas", {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (fasilitasResponse.ok) {
        const fasilitasResult = await fasilitasResponse.json()
        setFasilitas(fasilitasResult.data || fasilitasResult)
      }
      
      // Fetch user data
      const userResponse = await fetch("http://127.0.0.1:8000/api/users", {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (userResponse.ok) {
        const userResult = await userResponse.json()
        setUsers(userResult.data || userResult)
      }
      
    } catch (error) {
      console.error("Failed to fetch related data:", error)
      toast.error("Gagal memuat data terkait");
    }
  }

  // Check for time slot conflicts
  const checkTimeConflicts = () => {
    // Reset previous validation errors
    setValidationErrors([]);
    
    if (!formData.fasilitas_id || !formData.tgl_reservasi || !formData.jam_mulai || !formData.jam_selesai) {
      return false; // Not enough data to check conflicts
    }

    // Convert times to minutes for easier comparison
    const convertTimeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartTime = convertTimeToMinutes(formData.jam_mulai);
    const newEndTime = convertTimeToMinutes(formData.jam_selesai);
    
    // Basic validation - end time must be after start time
    if (newEndTime <= newStartTime) {
      setValidationErrors(prev => [...prev, "Jam selesai harus lebih besar dari jam mulai"]);
      return true;
    }

    // Check for overlaps with existing reservations
    let hasConflict = false;
    
    data.forEach(reservation => {
      // Skip checking against the current reservation if we're editing
      if (isEditing && reservation.id == formData.id) return;
      
      // Only check same facility and same date
      if (reservation.fasilitas_id == formData.fasilitas_id && 
          reservation.tgl_reservasi === formData.tgl_reservasi) {
        
        const existingStartTime = convertTimeToMinutes(reservation.jam_mulai);
        const existingEndTime = convertTimeToMinutes(reservation.jam_selesai);
        
        // Check for overlap
        // Two time ranges overlap if one's start time is before the other's end time
        // AND that same range's end time is after the other's start time
        if ((newStartTime < existingEndTime && newEndTime > existingStartTime)) {
          hasConflict = true;
          const facilityName = getFasilitasName(reservation.fasilitas_id);
          const existingUser = getUserName(reservation.user_id);
          
          setValidationErrors(prev => [
            ...prev, 
            `Konflik jadwal: Fasilitas ${facilityName} sudah direservasi oleh ${existingUser} pada jam ${reservation.jam_mulai} - ${reservation.jam_selesai}`
          ]);
        }
      }
    });
    
    return hasConflict;
  };

  // Create new reservation
  const createReservation = async () => {
    // First check for time conflicts
    if (checkTimeConflicts()) {
      return false;
    }
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // Make sure harga is set from the facility price
      const selectedFacility = fasilitas.find(f => f.id == formData.fasilitas_id);
      const dataToSend = {
        ...formData,
        harga: selectedFacility?.harga || 0
      };
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal menambah data: ${response.status}`);
        return false
      }
      
      toast.success("Data reservasi berhasil ditambahkan");
      return true
      
    } catch (error) {
      console.error("Failed to create reservation:", error)
      toast.error("Gagal menambah data reservasi");
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update existing reservation
  const updateReservation = async () => {
    // First check for time conflicts
    if (checkTimeConflicts()) {
      return false;
    }
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // Make sure harga is set from the facility price
      const selectedFacility = fasilitas.find(f => f.id == formData.fasilitas_id);
      const dataToSend = {
        ...formData,
        harga: selectedFacility?.harga || 0
      };
      
      const response = await fetch(`${API_BASE_URL}/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal memperbarui data: ${response.status}`);
        return false
      }
      
      toast.success("Data reservasi berhasil diperbarui");
      return true
      
    } catch (error) {
      console.error("Failed to update reservation:", error)
      toast.error("Gagal memperbarui data reservasi");
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Delete reservation
  const deleteReservation = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_BASE_URL}/${selectedItem.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal menghapus data: ${response.status}`);
        return false
      }
      
      toast.success("Data reservasi berhasil dihapus");
      return true
      
    } catch (error) {
      console.error("Failed to delete reservation:", error)
      toast.error("Gagal menghapus data reservasi");
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchRelatedData()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item =>
      (item.fasilitas?.nama_fasilitas?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.user?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.status_pembayaran?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If the facility changes, update the price
    if (name === "fasilitas_id") {
      const selectedFacility = fasilitas.find(f => f.id == value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        harga: selectedFacility?.harga || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation errors when inputs change
    if (["fasilitas_id", "tgl_reservasi", "jam_mulai", "jam_selesai"].includes(name)) {
      setValidationErrors([]);
    }
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "-"
    
    // If the time is already in HH:MM format, return it
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString.substring(0, 5) // Return only HH:MM
    }
    
    return timeString
  }

  // Format date for input element (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    
    try {
      // Try to convert from DD-MM-YYYY or other formats to YYYY-MM-DD
      const parts = dateString.split(/[-\/]/)
      if (parts.length === 3) {
        // Check format based on part lengths
        if (parts[0].length === 4) {
          // Already YYYY-MM-DD
          return dateString
        } else {
          // Assume DD-MM-YYYY and convert to YYYY-MM-DD
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }
      
      // If can't determine format, create a Date object and format it
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.error("Error formatting date:", error)
    }
    
    return dateString
  }

  const handleAddNew = () => {
    setFormData({
      acara_id: "",
      fasilitas_id: "",
      user_id: "",
      tgl_reservasi: "",
      jam_mulai: "",
      jam_selesai: "",
      harga: "",
      status_pembayaran: "unpaid"
    })
    setIsEditing(false)
    setValidationErrors([])
    setIsAddModalOpen(true)
  }

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      acara_id: item.acara_id,
      fasilitas_id: item.fasilitas_id,
      user_id: item.user_id,
      tgl_reservasi: formatDateForInput(item.tgl_reservasi),
      jam_mulai: item.jam_mulai,
      jam_selesai: item.jam_selesai,
      harga: item.harga || getFasilitasPrice(item.fasilitas_id),
      status_pembayaran: item.status_pembayaran
    })
    setIsEditing(true)
    setValidationErrors([])
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Validate time format
  const validateTimeFormat = (time) => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
  
  // Handle form submission for both create and update
  const handleFormSubmit = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors([]);
      
      // Basic form validation
      const errors = [];
      
      if (!formData.acara_id) errors.push("Acara harus dipilih");
      if (!formData.fasilitas_id) errors.push("Fasilitas harus dipilih");
      if (!formData.user_id) errors.push("Penyewa harus dipilih");
      if (!formData.tgl_reservasi) errors.push("Tanggal reservasi harus diisi");
      
      if (!formData.jam_mulai) {
        errors.push("Jam mulai harus diisi");
      } else if (!validateTimeFormat(formData.jam_mulai)) {
        errors.push("Format jam mulai tidak valid (HH:MM)");
      }
      
      if (!formData.jam_selesai) {
        errors.push("Jam selesai harus diisi");
      } else if (!validateTimeFormat(formData.jam_selesai)) {
        errors.push("Format jam selesai tidak valid (HH:MM)");
      }
      
      // Check if end time is after start time
      if (formData.jam_mulai && formData.jam_selesai) {
        const startTime = new Date(`2000-01-01T${formData.jam_mulai}`);
        const endTime = new Date(`2000-01-01T${formData.jam_selesai}`);
        
        if (endTime <= startTime) {
          errors.push("Jam selesai harus lebih besar dari jam mulai");
        }
      }
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Execute the appropriate operation based on whether we're editing or not
      let success = false;
      if (isEditing) {
        success = await updateReservation();
      } else {
        success = await createReservation();
      }
      
      if (success) {
        setIsAddModalOpen(false);
        fetchReservations(); // Refresh data after successful operation
        
        // Reset form
        setFormData({
          acara_id: "",
          fasilitas_id: "",
          user_id: "",
          tgl_reservasi: "",
          jam_mulai: "",
          jam_selesai: "",
          harga: "",
          status_pembayaran: "unpaid",
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async () => {
    const success = await deleteReservation()
    if (success) {
      setIsDeleteModalOpen(false)
      fetchReservations()
    }
  }

  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  const getFasilitasName = (id) => {
    const facility = fasilitas.find(f => f.id == id)
    return facility ? facility.nama_fasilitas : "-"
  }

  const getAcaraName = (id) => {
    const event = acara.find(a => a.id == id)
    return event ? event.nama_acara : "-"
  }

  const getUserName = (id) => {
    const user = users.find(u => u.id == id)
    return user ? user.name : "-"
  }

  const getFasilitasPrice = (id) => {
    const facility = fasilitas.find(f => f.id == id)
    return facility && facility.harga ? facility.harga : 0
  }

  // Format currency price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "-";
    return `Rp. ${Number(price).toLocaleString()}`;
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

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
                  <BreadcrumbPage>Reservasi Fasilitas</BreadcrumbPage>
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
                    <CardTitle>Reservasi</CardTitle>
                    <CardDescription>Kelola data reservasi fasilitas</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data reservasi..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Reservasi */}
                <div className="rounded-md border overflow-hidden">
                  {/* Header Tabel */}
                  <div className="bg-gray-50 border-b grid grid-cols-11 text-xs font-medium text-gray-500 uppercase">
                    <div className="px-4 py-3 col-span-1">ID</div>
                    <div className="px-4 py-3 col-span-1">Acara</div>
                    <div className="px-4 py-3 col-span-1">Fasilitas</div>
                    <div className="px-4 py-3 col-span-2">Penyewa</div>
                    <div className="px-4 py-3 col-span-1">Tanggal</div>
                    <div className="px-4 py-3 col-span-1">Mulai</div>
                    <div className="px-4 py-3 col-span-1">Selesai</div>
                    <div className="px-4 py-3 col-span-1">Harga</div>
                    <div className="px-4 py-3 col-span-1">Status</div>
                    <div className="px-4 py-3 col-span-1 text-right">Aksi</div>
                  </div>

                  {/* Isi Tabel */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8 text-gray-500 col-span-10">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Memuat data...</span>
                      </div>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-11 border-b text-sm hover:bg-gray-50"
                        >
                          <div className="px-4 py-3 col-span-1">{item.id}</div>
                          <div className="px-4 py-3 col-span-1">{getAcaraName(item.acara_id)}</div>
                          <div className="px-4 py-3 col-span-1">{getFasilitasName(item.fasilitas_id)}</div>
                          <div className="px-4 py-3 col-span-2">{getUserName(item.user_id)}</div>
                          <div className="px-4 py-3 col-span-1">{item.tgl_reservasi}</div>
                          <div className="px-4 py-3 col-span-1">{formatTimeDisplay(item.jam_mulai)}</div>
                          <div className="px-4 py-3 col-span-1">{formatTimeDisplay(item.jam_selesai)}</div>
                          <div className="px-4 py-3 col-span-1">
                            {formatPrice(item.harga || getFasilitasPrice(item.fasilitas_id))}
                          </div>
                          <div className="px-4 py-3 col-span-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.status_pembayaran === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.status_pembayaran}
                            </span>
                          </div>
                          <div className="px-4 py-3 col-span-1 text-right">
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
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center py-8 text-gray-500 col-span-11">
                        {searchTerm ? (
                          <>
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span>Tidak ada data yang sesuai dengan pencarian</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span>Belum ada data reservasi</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {filteredData.length > itemsPerPage && (
                  <div className="flex justify-center mt-4">
                    <nav className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <Button
                          key={number}
                          variant={currentPage === number ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      {/* Reservasi Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap data reservasi
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">ID Reservasi</div>
                <div className="col-span-2">{detailItem.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Acara</div>
                <div className="col-span-2">{getAcaraName(detailItem.acara_id)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Fasilitas</div>
                <div className="col-span-2">{getFasilitasName(detailItem.fasilitas_id)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Penyewa</div>
                <div className="col-span-2">{getUserName(detailItem.user_id)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Tanggal Reservasi</div>
                <div className="col-span-2">{detailItem.tgl_reservasi}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Jam Mulai</div>
                <div className="col-span-2">{formatTimeDisplay(detailItem.jam_mulai)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Jam Selesai</div>
                <div className="col-span-2">{formatTimeDisplay(detailItem.jam_selesai)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Harga</div>
                <div className="col-span-2">
                  {formatPrice(detailItem.harga || getFasilitasPrice(detailItem.fasilitas_id))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Status Pembayaran</div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      detailItem.status_pembayaran === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {detailItem.status_pembayaran}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Dibuat Pada</div>
                <div className="col-span-2">{detailItem.created_at || "-"}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Diperbarui Pada</div>
                <div className="col-span-2">{detailItem.updated_at || "-"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tambah/Edit Reservasi Modal */}
<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
  <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit Reservasi" : "Tambah Reservasi"}</DialogTitle>
      <DialogDescription>
        {isEditing ? "Perbarui data reservasi" : "Tambahkan data reservasi baru"}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="acara_id">Acara</Label>
          <Select
            value={formData.acara_id ? formData.acara_id.toString() : ""}
            onValueChange={(value) => handleInputChange({ target: { name: "acara_id", value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih acara">
                {formData.acara_id && acara.find(item => item.id.toString() === formData.acara_id.toString())?.nama_acara}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {acara.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.nama_acara}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fasilitas_id">Fasilitas</Label>
          <Select
            value={formData.fasilitas_id ? formData.fasilitas_id.toString() : ""}
            onValueChange={(value) => handleInputChange({ target: { name: "fasilitas_id", value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih fasilitas">
                {formData.fasilitas_id && 
                  fasilitas.find(item => item.id.toString() === formData.fasilitas_id.toString())?.nama_fasilitas + 
                  " - " + 
                  formatPrice(fasilitas.find(item => item.id.toString() === formData.fasilitas_id.toString())?.harga)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {fasilitas.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.nama_fasilitas} - {formatPrice(item.harga)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="user_id">Penyewa</Label>
          <Select
            value={formData.user_id ? formData.user_id.toString() : ""}
            onValueChange={(value) => handleInputChange({ target: { name: "user_id", value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih penyewa">
                {formData.user_id && users.find(item => item.id.toString() === formData.user_id.toString())?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tgl_reservasi">Tanggal Reservasi</Label>
          <Input
            type="date"
            id="tgl_reservasi"
            name="tgl_reservasi"
            value={formData.tgl_reservasi}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jam_mulai">Jam Mulai</Label>
            <Input
              type="time"
              id="jam_mulai"
              name="jam_mulai"
              value={formData.jam_mulai}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jam_selesai">Jam Selesai</Label>
            <Input
              type="time"
              id="jam_selesai"
              name="jam_selesai"
              value={formData.jam_selesai}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="harga">Harga</Label>
          <Input
            type="text"
            id="harga"
            name="harga"
            value={formData.harga}
            onChange={handleInputChange}
            disabled
          />
          <p className="text-sm text-gray-500">
            Harga diatur otomatis berdasarkan fasilitas yang dipilih
          </p>
        </div>
        
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status_pembayaran">Status Pembayaran</Label>
            <Select
              value={formData.status_pembayaran || ""}
              onValueChange={(value) => handleInputChange({ target: { name: "status_pembayaran", value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status">
                  {formData.status_pembayaran === "unpaid" && "Belum Dibayar"}
                  {formData.status_pembayaran === "paid" && "Sudah Dibayar"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Belum Dibayar</SelectItem>
                <SelectItem value="paid">Sudah Dibayar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
        Batal
      </Button>
      <Button onClick={handleFormSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>{isEditing ? "Simpan Perubahan" : "Simpan"}</span>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Reservasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data reservasi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}