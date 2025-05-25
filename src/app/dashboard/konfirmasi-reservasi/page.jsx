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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  ThumbsUp,
  ThumbsDown,
  Filter,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

const API_BASE_URL = "http://127.0.0.1:8000/api/reservasi"

export default function Page() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [showAllReservations, setShowAllReservations] = useState(false)
  
  // Form data state
  const [formData, setFormData] = useState({
    acara_id: "",
    fasilitas_id: "",
    tgl_reservasi: "",
    sesi_id: [],
    user_id: "", // untuk admin
    status_reservasi: "pending",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Reference data for dropdowns
  const [acara, setAcara] = useState([])
  const [fasilitas, setFasilitas] = useState([])
  const [sesi, setSesi] = useState([])
  const [users, setUsers] = useState([]) // untuk admin
  const itemsPerPage = 5

  // Get current user info
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
        return user
      }
    } catch (error) {
      console.error("Failed to parse user data:", error)
    }
    return null
  }

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
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.")
          // Redirect to login page
          window.location.href = "/login"
          return
        }
        toast.error(`Gagal memuat data: ${response.status}`)
        return
      }

      const result = await response.json()
      
      // Controller returns direct array
      if (Array.isArray(result)) {
        setData(result)
        
        // By default, only show pending reservations
        const pendingOnly = result.filter(item => item.status_reservasi === 'pending')
        setFilteredData(pendingOnly)
      } else {
        console.error("Format data tidak valid:", result)
        setData([])
        setFilteredData([])
        toast.error("Format data tidak valid")
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error)
      toast.error("Gagal memuat data reservasi")
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
      const user = getCurrentUser()
      
      // Fetch acara data
      try {
        const acaraResponse = await fetch("http://127.0.0.1:8000/api/acara", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (acaraResponse.ok) {
          const acaraResult = await acaraResponse.json()
          setAcara(Array.isArray(acaraResult) ? acaraResult : acaraResult.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch acara:", error)
      }
      
      // Fetch fasilitas data
      try {
        const fasilitasResponse = await fetch("http://127.0.0.1:8000/api/fasilitas", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (fasilitasResponse.ok) {
          const fasilitasResult = await fasilitasResponse.json()
          setFasilitas(Array.isArray(fasilitasResult) ? fasilitasResult : fasilitasResult.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch fasilitas:", error)
      }
      
      // Fetch sesi data
      try {
        const sesiResponse = await fetch("http://127.0.0.1:8000/api/sesi", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        
        if (sesiResponse.ok) {
          const sesiResult = await sesiResponse.json()
          setSesi(Array.isArray(sesiResult) ? sesiResult : sesiResult.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch sesi:", error)
      }

      // Fetch users for admin
      if (user && user.role === 'admin') {
        try {
          const usersResponse = await fetch("http://127.0.0.1:8000/api/users", {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })
          
          if (usersResponse.ok) {
            const usersResult = await usersResponse.json()
            setUsers(Array.isArray(usersResult) ? usersResult : usersResult.data || [])
          }
        } catch (error) {
          console.error("Failed to fetch users:", error)
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch related data:", error)
      toast.error("Gagal memuat data terkait")
    }
  }

  // Create new reservation
  const createReservation = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const user = getCurrentUser()
      
      // Prepare form data
      const submitData = {
        acara_id: formData.acara_id,
        fasilitas_id: formData.fasilitas_id,
        tgl_reservasi: formData.tgl_reservasi,
        sesi_id: formData.sesi_id.map(id => parseInt(id)) // Ensure integers
      }

      // Add user_id for admin
      if (user && user.role === 'admin' && formData.user_id) {
        submitData.user_id = parseInt(formData.user_id)
      }
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal menambah data: ${response.status}`)
        return false
      }
      
      const result = await response.json()
      toast.success(result.message || "Data reservasi berhasil ditambahkan")
      return true
      
    } catch (error) {
      console.error("Failed to create reservation:", error)
      toast.error("Gagal menambah data reservasi")
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update existing reservation
  const updateReservation = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const user = getCurrentUser()
      
      // Prepare form data - sesuai dengan controller update
      const submitData = {
        tgl_reservasi: formData.tgl_reservasi,
        sesi_id: formData.sesi_id.map(id => parseInt(id)) // Ensure integers
      }

      // Add status for admin
      if (user && user.role === 'admin' && formData.status_reservasi) {
        submitData.status_reservasi = formData.status_reservasi
      }
      
      const response = await fetch(`${API_BASE_URL}/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal memperbarui data: ${response.status}`)
        return false
      }
      
      const result = await response.json()
      toast.success(result.message || "Data reservasi berhasil diperbarui")
      return true
      
    } catch (error) {
      console.error("Failed to update reservation:", error)
      toast.error("Gagal memperbarui data reservasi")
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
        toast.error(errorData.message || `Gagal menghapus data: ${response.status}`)
        return false
      }
      
      const result = await response.json()
      toast.success(result.message || "Data reservasi berhasil dihapus")
      return true
      
    } catch (error) {
      console.error("Failed to delete reservation:", error)
      toast.error("Gagal menghapus data reservasi")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update reservation status (approve/reject)
  const updateReservationStatus = async (reservationId, newStatus) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // Use the dedicated confirmation endpoint in the controller
      const response = await fetch(`http://127.0.0.1:8000/api/reservasi/confirm/${reservationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal memperbarui status: ${response.status}`)
        return false
      }
      
      let successMessage = "Status reservasi berhasil diperbarui"
      if (newStatus === "disetujui") {
        successMessage = "Reservasi berhasil disetujui"
      } else if (newStatus === "ditolak") {
        successMessage = "Reservasi berhasil ditolak"
      }
      
      toast.success(successMessage)
      return true
      
    } catch (error) {
      console.error("Failed to update reservation status:", error)
      toast.error("Gagal memperbarui status reservasi")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // This function is called when the confirm action button is clicked
  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return
    
    let success = false
    if (actionType === 'approve') {
      success = await updateReservationStatus(selectedItem.id, "disetujui")
    } else if (actionType === 'reject') {
      success = await updateReservationStatus(selectedItem.id, "ditolak")
    }
    
    if (success) {
      setIsConfirmActionModalOpen(false)
      
      // Automatically remove this item if we're only showing pending reservations
      if (!showAllReservations) {
        setFilteredData(prev => prev.filter(item => item.id !== selectedItem.id))
      } else {
        // Refresh all data to show updated statuses
        fetchReservations()
      }
    }
  }

  useEffect(() => {
    getCurrentUser()
    fetchReservations()
    fetchRelatedData()
  }, [])

  useEffect(() => {
    // Apply filtering when data, search, or show all setting changes
    const baseData = showAllReservations ? data : data.filter(item => item.status_reservasi === 'pending')
    
    const filtered = baseData.filter(item => {
      const searchTermLower = searchTerm.toLowerCase()
      return (
        (item.fasilitas?.nama_fasilitas?.toLowerCase() || "").includes(searchTermLower) ||
        (item.acara?.nama_acara?.toLowerCase() || "").includes(searchTermLower) ||
        (item.status_reservasi?.toLowerCase() || "").includes(searchTermLower) ||
        (item.user?.name?.toLowerCase() || "").includes(searchTermLower)
      )
    })
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data, showAllReservations])

  // Toggle between showing all reservations or just pending ones
  const handleToggleView = () => {
    setShowAllReservations(prev => !prev)
  }

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation errors when inputs change
    setValidationErrors([])
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation errors when inputs change
    setValidationErrors([])
  }

  // Handle session selection
  const handleSesiChange = (sesiId) => {
    setFormData(prev => {
      const sesiIdString = sesiId.toString()
      if (prev.sesi_id.includes(sesiIdString)) {
        return {
          ...prev,
          sesi_id: prev.sesi_id.filter(id => id !== sesiIdString)
        }
      } else {
        return {
          ...prev,
          sesi_id: [...prev.sesi_id, sesiIdString]
        }
      }
    })
    
    // Clear validation errors when inputs change
    setValidationErrors([])
  }

  const handleAddNew = () => {
    setFormData({
      acara_id: "",
      fasilitas_id: "",
      tgl_reservasi: "",
      sesi_id: [],
      user_id: "",
      status_reservasi: "pending"
    })
    setIsEditing(false)
    setValidationErrors([])
    setIsAddModalOpen(true)
  }

  const handleEdit = (item) => {
    // Extract sesi IDs from the relationship
    const sesiIds = item.sesi ? item.sesi.map(s => s.id.toString()) : []
    
    setFormData({
      id: item.id,
      acara_id: item.acara_id.toString(),
      fasilitas_id: item.fasilitas_id.toString(),
      tgl_reservasi: item.tgl_reservasi,
      sesi_id: sesiIds,
      user_id: item.user_id ? item.user_id.toString() : "",
      status_reservasi: item.status_reservasi
    })
    setIsEditing(true)
    setValidationErrors([])
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Handle approve/reject click
  const handleActionClick = (item, action) => {
    setSelectedItem(item)
    setActionType(action)
    setIsConfirmActionModalOpen(true)
  }
  
  // Handle form submission for both create and update
  const handleFormSubmit = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors([])
      
      // Basic form validation
      const errors = []
      
      if (!formData.acara_id && !isEditing) errors.push("Acara harus dipilih")
      if (!formData.fasilitas_id && !isEditing) errors.push("Fasilitas harus dipilih")
      if (!formData.tgl_reservasi) errors.push("Tanggal reservasi harus diisi")
      if (formData.sesi_id.length === 0) errors.push("Minimal satu sesi harus dipilih")
      
      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }

      // Execute the appropriate operation based on whether we're editing or not
      let success = false
      if (isEditing) {
        success = await updateReservation()
      } else {
        success = await createReservation()
      }
      
      if (success) {
        setIsAddModalOpen(false)
        fetchReservations() // Refresh data after successful operation
        
        // Reset form
        setFormData({
          acara_id: "",
          fasilitas_id: "",
          tgl_reservasi: "",
          sesi_id: [],
          user_id: "",
          status_reservasi: "pending"
        })
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast.error("Terjadi kesalahan saat menyimpan data")
    }
  }

  const handleDelete = async () => {
    const success = await deleteReservation()
    if (success) {
      setIsDeleteModalOpen(false)
      
      // Update local data by removing deleted item
      setFilteredData(prev => prev.filter(item => item.id !== selectedItem.id))
      setData(prev => prev.filter(item => item.id !== selectedItem.id))
    }
  }

  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  const getFasilitasName = (item) => {
    return item.fasilitas?.nama_fasilitas || "-"
  }

  const getAcaraName = (item) => {
    return item.acara?.nama_acara || "-"
  }

  const getUserName = (item) => {
    return item.user?.name || "-"
  }

  const getSesiNames = (sesiArray) => {
    if (!sesiArray || !Array.isArray(sesiArray) || sesiArray.length === 0) return "-"
    
    return sesiArray.map(s => s.nama_sesi || `Sesi ${s.id}`).join(", ")
  }

  const getSesiTimes = (sesiArray) => {
    if (!sesiArray || !Array.isArray(sesiArray) || sesiArray.length === 0) return "-"
    
    return sesiArray.map(s => `${s.jam_mulai} - ${s.jam_selesai}`).join(", ")
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disetujui':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ditolak':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Timer className="h-3 w-3" />
      case 'disetujui':
        return <CheckCircle className="h-3 w-3" />
      case 'ditolak':
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  // Check if user can edit/delete reservation
  const canEditReservation = (item) => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.id === item.user_id
  }

  const canDeleteReservation = (item) => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.id === item.user_id
  }

  // Check if user can approve/reject reservation
  const canApproveRejectReservation = (item) => {
    if (!currentUser) return false
    // Only admin can approve/reject, and only for pending reservations
    return currentUser.role === 'admin' && item.status_reservasi === 'pending'
  }

  // Pagination setup
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
                  <BreadcrumbPage>Reservasi</BreadcrumbPage>
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
                    <CardTitle>Konfirmasi Reservasi</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter and Search */}
                <div className="flex items-center mb-4 gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari berdasarkan fasilitas, acara, status, atau user..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleToggleView}
                    className="flex items-center gap-1 min-w-40"
                  >
                    <Filter className="h-4 w-4" />
                    {showAllReservations ? "Tampilkan Hanya Pending" : "Tampilkan Semua"}
                  </Button>
                </div>

                {/* Status Information */}
                {!showAllReservations && (
                  <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hanya menampilkan reservasi dengan status "Pending". {" "}
                      <button 
                        className="text-blue-600 underline" 
                        onClick={() => setShowAllReservations(true)}
                      >
                        Tampilkan semua reservasi
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tabel Reservasi */}
                <div className="rounded-md border overflow-hidden">
                  {/* Header Tabel */}
                  <div className="bg-gray-50 border-b grid grid-cols-12 text-xs font-medium text-gray-500 uppercase">
                    <div className={`px-4 py-3 ${currentUser?.role === 'admin' ? 'col-span-2' : 'col-span-2'}`}>Tanggal</div>
                    {currentUser?.role === 'admin' && (
                      <div className="px-4 py-3 col-span-2">Penyewa</div>
                    )}
                    <div className="px-4 py-3 col-span-2">Acara</div>
                    <div className="px-4 py-3 col-span-1">Fasilitas</div>
                    <div className="px-4 py-3 col-span-2">Sesi</div>
                    <div className="px-4 py-3 col-span-2">Status</div>
                    <div className="px-4 py-3 col-span-1 text-right">Aksi</div>
                  </div>

                  {/* Isi Tabel */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Memuat data...</span>
                      </div>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 border-b text-sm hover:bg-gray-50"
                        >
                          <div className={`px-4 py-3 ${currentUser?.role === 'admin' ? 'col-span-2' : 'col-span-2'}`}>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                              {item.tgl_reservasi}
                            </div>
                          </div>
                          {currentUser?.role === 'admin' && (
                            <div className="px-4 py-3 col-span-2 truncate">
                              {getUserName(item)}
                            </div>
                          )}
                          <div className="px-4 py-3 col-span-2 truncate">
                            {getAcaraName(item)}
                          </div>
                          <div className="px-4 py-3 col-span-1 truncate">
                            {getFasilitasName(item)}
                          </div>
                          <div className="px-4 py-3 col-span-2 truncate">
                            {getSesiNames(item.sesi)}
                          </div>
                          <div className="px-4 py-3 col-span-2">
                            <Badge className={`flex items-center gap-1 w-min ${getStatusBadgeClass(item.status_reservasi)}`}>
                              {getStatusIcon(item.status_reservasi)}
                              {item.status_reservasi}
                            </Badge>
                          </div>
                          <div className="px-4 py-3 col-span-1">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDetails(item)}
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canApproveRejectReservation(item) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleActionClick(item, 'approve')}
                                    title="Setujui"
                                  >
                                    <ThumbsUp className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleActionClick(item, 'reject')}
                                    title="Tolak"
                                  >
                                    <ThumbsDown className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center py-8 text-gray-500">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <span>Tidak ada data reservasi ditemukan</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {filteredData.length > itemsPerPage && (
                  <div className="flex justify-center mt-4">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Reservasi</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Tanggal</div>
                <div className="col-span-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  {detailItem.tgl_reservasi}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Penyewa</div>
                <div className="col-span-2">{getUserName(detailItem)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Acara</div>
                <div className="col-span-2">{getAcaraName(detailItem)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Fasilitas</div>
                <div className="col-span-2">{getFasilitasName(detailItem)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Sesi</div>
                <div className="col-span-2">{getSesiNames(detailItem.sesi)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Waktu</div>
                <div className="col-span-2 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  {getSesiTimes(detailItem.sesi)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Status</div>
                <div className="col-span-2">
                  <Badge className={`flex items-center gap-1 w-min ${getStatusBadgeClass(detailItem.status_reservasi)}`}>
                    {getStatusIcon(detailItem.status_reservasi)}
                    {detailItem.status_reservasi}
                  </Badge>
                </div>
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

      {/* Approve/Reject Confirmation Modal */}
      <AlertDialog 
        open={isConfirmActionModalOpen} 
        onOpenChange={(open) => !isLoading && setIsConfirmActionModalOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem && (
                <>
                  Apakah Anda yakin ingin {actionType === 'approve' ? 'menyetujui' : 'menolak'} reservasi untuk{" "}
                  <span className="font-semibold">{getFasilitasName(selectedItem)}</span> pada tanggal{" "}
                  <span className="font-semibold">{selectedItem.tgl_reservasi}</span>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              disabled={isLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Ya, {actionType === 'approve' ? 'Setujui' : 'Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}