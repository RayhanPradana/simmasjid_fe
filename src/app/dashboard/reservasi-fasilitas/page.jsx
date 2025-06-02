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
  CreditCard,
  DollarSign,
  Tag,
  Filter,
  X,
  ShieldCheck,
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  
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
  const [pricePreview, setPricePreview] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('disetujui')
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
        setFilteredData(result)
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

  // Confirm reservation status (for admin)
  const confirmReservation = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_BASE_URL}/confirm/${selectedItem.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal mengubah status: ${response.status}`)
        return false
      }
      
      const result = await response.json()
      toast.success(result.message || "Status reservasi berhasil diperbarui")
      return true
      
    } catch (error) {
      console.error("Failed to confirm reservation:", error)
      toast.error("Gagal mengubah status reservasi")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate price preview when form inputs change
  useEffect(() => {
    if (formData.acara_id && formData.fasilitas_id && !isEditing) {
      const selectedAcara = acara.find(a => a.id.toString() === formData.acara_id)
      const selectedFasilitas = fasilitas.find(f => f.id.toString() === formData.fasilitas_id)
      
      if (selectedAcara && selectedFasilitas) {
        // Ensure both values are parsed as numbers before adding
        const acaraHarga = selectedAcara.harga ? parseFloat(selectedAcara.harga) : 0
        const fasilitasHarga = selectedFasilitas.harga ? parseFloat(selectedFasilitas.harga) : 0
        const totalHarga = acaraHarga + fasilitasHarga
        setPricePreview(totalHarga)
      }
    } else {
      setPricePreview(null)
    }
  }, [formData.acara_id, formData.fasilitas_id, acara, fasilitas, isEditing])

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
      
      const responseData = await response.json()
      
      if (!response.ok) {
        toast.error(responseData.message || `Gagal menambah data: ${response.status}`)
        return false
      }
      
      toast.success(responseData.message || "Data reservasi berhasil ditambahkan")
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
      
      const responseData = await response.json()
      
      if (!response.ok) {
        toast.error(responseData.message || `Gagal memperbarui data: ${response.status}`)
        return false
      }
      
      toast.success(responseData.message || "Data reservasi berhasil diperbarui")
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

  // Update status otomatis (admin only)
  const updateStatusOtomatis = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_BASE_URL}/update-status-otomatis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || `Gagal memperbarui status: ${response.status}`)
        return false
      }
      
      const result = await response.json()
      toast.success(result.message || "Status reservasi berhasil diperbarui secara otomatis")
      return true
      
    } catch (error) {
      console.error("Failed to update status automatically:", error)
      toast.error("Gagal memperbarui status secara otomatis")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  {/* Add this handler function in your component */}
  const handleUpdateStatusOtomatis = async () => {
    const success = await updateStatusOtomatis()
    if (success) {
      fetchReservations() // Refresh data after successful update
    }
  }

  {/* Handler for individual status update */}
  const handleUpdateSingleStatus = async (item) => {
    // You might want to create a specific endpoint for single item status update
    // or modify the existing function to accept an item ID
    const success = await updateStatusOtomatis()
    if (success) {
      fetchReservations()
    }
  }

  useEffect(() => {
    getCurrentUser()
    fetchReservations()
    fetchRelatedData()
  }, [])

  // Updated filtering effect with status and date filters
  useEffect(() => {
    let filtered = data.filter(item => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch = (
        (item.fasilitas?.nama_fasilitas?.toLowerCase() || "").includes(searchTermLower) ||
        (item.acara?.nama_acara?.toLowerCase() || "").includes(searchTermLower) ||
        (item.status_reservasi?.toLowerCase() || "").includes(searchTermLower) ||
        (item.user?.name?.toLowerCase() || "").includes(searchTermLower)
      )
      
      const matchesStatus = statusFilter === "all" || item.status_reservasi === statusFilter
      const matchesDate = !dateFilter || item.tgl_reservasi === dateFilter
      
      return matchesSearch && matchesStatus && matchesDate
    })
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, data])

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

  // Handle status change in confirmation modal
  const handleStatusChange = (value) => {
    setSelectedStatus(value)
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

  const handleConfirmClick = (item) => {
    setSelectedItem(item)
    // Set default next status based on current status
    let nextStatus = 'disetujui'
    switch(item.status_reservasi) {
      case 'pending':
        nextStatus = 'disetujui'
        break
      case 'disetujui':
        nextStatus = 'menunggu lunas'
        break
      case 'menunggu lunas':
        nextStatus = 'siap digunakan'
        break
      case 'siap digunakan':
        nextStatus = 'sedang berlangsung'
        break
      case 'sedang berlangsung':
        nextStatus = 'selesai'
        break
      default:
        nextStatus = 'disetujui'
    }
    setSelectedStatus(nextStatus)
    setIsConfirmModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
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
      fetchReservations()
    }
  }

  const handleConfirm = async () => {
    const success = await confirmReservation()
    if (success) {
      setIsConfirmModalOpen(false)
      fetchReservations()
    }
  }

  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter("")
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

  // Format currency (IDR)
  const formatRupiah = (amount) => {
    if (amount === null || amount === undefined) return "Rp0"
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disetujui':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ditolak':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'menunggu lunas':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'siap digunakan':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'sedang berlangsung':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dibatalkan':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'selesai':
        return 'bg-purple-100 text-purple-800 border-purple-200'
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
      case 'menunggu lunas':
        return <CreditCard className="h-3 w-3" />
      case 'siap digunakan':
        return <ShieldCheck className="h-3 w-3" />
      case 'sedang berlangsung':
        return <Clock className="h-3 w-3" />
      case 'dibatalkan':
        return <XCircle className="h-3 w-3" />
      case 'selesai':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  // Check if user can edit/delete/confirm reservation
  const canEditReservation = (item) => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.id === item.user_id
  }

  const canDeleteReservation = (item) => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.id === item.user_id
  }

  const canConfirmReservation = (item) => {
    if (!currentUser || currentUser.role !== 'admin') return false
    // Only allow confirmation for specific status transitions
    const allowedStatuses = ['pending', 'disetujui', 'menunggu lunas', 'siap digunakan', 'sedang berlangsung']
    return allowedStatuses.includes(item.status_reservasi)
  }

  // Get unique statuses from data for filter dropdown
  const getUniqueStatuses = () => {
    const statuses = [...new Set(data.map(item => item.status_reservasi).filter(Boolean))]
    return statuses
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
                    <CardTitle>Reservasi Fasilitas</CardTitle>
                    <CardDescription>
                      {currentUser?.role === 'admin' 
                        ? 'Kelola semua data reservasi fasilitas' 
                        : 'Kelola reservasi fasilitas Anda'
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Auto Update Status Button - Only for Admin */}
                    {currentUser?.role === 'admin' && (
                      <Button 
                        onClick={handleUpdateStatusOtomatis} 
                        variant="outline"
                        size="sm" 
                        className="flex items-center gap-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        Update Status Otomatis
                      </Button>
                    )}
                    
                    <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Tambah Reservasi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Section */}
                <div className="space-y-4 mb-6">
                  {/* Search Bar */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Cari berdasarkan fasilitas, acara, status, atau user..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">Status:</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          {getUniqueStatuses().map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">Tanggal:</Label>
                      <Input
                        type="date"
                        className="w-48"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || statusFilter !== "all" || dateFilter) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <X className="h-3 w-3" />
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Results Counter */}
                  <div className="text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari {data.length} reservasi
                  </div>
                </div>

                {/* Data Table */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Memuat data...</span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {data.length === 0 ? "Belum ada data" : "Tidak ada hasil"}
                    </h3>
                    <p className="text-gray-500">
                      {data.length === 0 
                        ? "Belum ada reservasi yang dibuat." 
                        : "Coba ubah filter atau kata kunci pencarian."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="p-3 text-left text-sm font-medium text-gray-900">No</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Fasilitas</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Acara</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Penyewa</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Tanggal</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Sesi</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Status</th>
                            <th className="p-3 text-left text-sm font-medium text-gray-900">Total Harga</th>
                            <th className="p-3 text-right text-sm font-medium text-gray-900">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((item, index) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 text-sm text-gray-900 text-left">
                                {indexOfFirstItem + index + 1}
                              </td>
                              <td className="p-3 text-sm text-gray-900 text-left">
                                {getFasilitasName(item)}
                              </td>
                              <td className="p-3 text-sm text-gray-900 text-left">
                                {getAcaraName(item)}
                              </td>
                              <td className="p-3 text-sm text-gray-900 text-left">
                                {getUserName(item)}
                              </td>
                              <td className="p-3 text-sm text-gray-900 text-left">
                                {new Date(item.tgl_reservasi).toLocaleDateString('id-ID')}
                              </td>
                              <td className="p-3 text-sm text-gray-900 text-left">
                                <div className="space-y-1">
                                  <div>{getSesiNames(item.sesi)}</div>
                                  <div className="text-xs text-gray-500">{getSesiTimes(item.sesi)}</div>
                                </div>
                              </td>
                              <td className="p-3 text-left">
                                <Badge className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(item.status_reservasi)}`}>
                                  {getStatusIcon(item.status_reservasi)}
                                  {item.status_reservasi}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-gray-900 font-medium text-left">
                                {formatRupiah(item.harga)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDetails(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  {canEditReservation(item) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(item)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {canConfirmReservation(item) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleConfirmClick(item)}
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Auto Status Update for specific reservation - Admin only */}
                                  {currentUser?.role === 'admin' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateSingleStatus(item)}
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                      title="Update Status Otomatis"
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {canDeleteReservation(item) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteClick(item)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <Button
                              key={number}
                              variant={currentPage === number ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(number)}
                              className="w-8 h-8 p-0"
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
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Reservasi</DialogTitle>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Fasilitas</Label>
                    <p className="text-sm text-gray-600 mt-1">{getFasilitasName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Acara</Label>
                    <p className="text-sm text-gray-600 mt-1">{getAcaraName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">User</Label>
                    <p className="text-sm text-gray-600 mt-1">{getUserName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Tanggal Reservasi</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(detailItem.tgl_reservasi).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Sesi</Label>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{getSesiNames(detailItem.sesi)}</div>
                      <div className="text-xs text-gray-500">{getSesiTimes(detailItem.sesi)}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Status</Label>
                    <div className="mt-1">
                      <Badge className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(detailItem.status_reservasi)}`}>
                        {getStatusIcon(detailItem.status_reservasi)}
                        {detailItem.status_reservasi}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Harga Acara</Label>
                    <p className="text-sm text-gray-600 mt-1">{formatRupiah(detailItem.acara?.harga)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Harga Fasilitas</Label>
                    <p className="text-sm text-gray-600 mt-1">{formatRupiah(detailItem.fasilitas?.harga)}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-900">Total Harga</Label>
                    <p className="text-lg font-semibold text-green-600 mt-1">{formatRupiah(detailItem.harga)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Dibuat Pada</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(detailItem.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Terakhir Diupdate</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(detailItem.updated_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Reservasi" : "Tambah Reservasi Baru"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Perbarui informasi reservasi yang sudah ada."
                  : "Isi formulir di bawah untuk membuat reservasi baru."
                }
              </DialogDescription>
            </DialogHeader>
            
            {validationErrors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Acara Selection (only for new reservations) */}
              {!isEditing && (
                <div>
                  <Label htmlFor="acara_id">Acara *</Label>
                  <Select onValueChange={(value) => handleSelectChange("acara_id", value)} value={formData.acara_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih acara" />
                    </SelectTrigger>
                    <SelectContent>
                      {acara.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nama_acara} - {formatRupiah(item.harga)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fasilitas Selection (only for new reservations) */}
              {!isEditing && (
                <div>
                  <Label htmlFor="fasilitas_id">Fasilitas *</Label>
                  <Select onValueChange={(value) => handleSelectChange("fasilitas_id", value)} value={formData.fasilitas_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih fasilitas" />
                    </SelectTrigger>
                    <SelectContent>
                      {fasilitas.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nama_fasilitas} - {formatRupiah(item.harga)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User Selection (only for admin on new reservations) */}
              {!isEditing && currentUser?.role === 'admin' && (
                <div>
                  <Label htmlFor="user_id">User</Label>
                  <Select onValueChange={(value) => handleSelectChange("user_id", value)} value={formData.user_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih user (kosongkan untuk diri sendiri)" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tanggal Reservasi */}
              <div>
                <Label htmlFor="tgl_reservasi">Tanggal Reservasi *</Label>
                <Input
                  type="date"
                  id="tgl_reservasi"
                  name="tgl_reservasi"
                  value={formData.tgl_reservasi}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Sesi Selection */}
              <div>
                <Label>Sesi *</Label>
                <div className="space-y-2 mt-2">
                  {sesi.map(s => (
                    <div key={s.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sesi-${s.id}`}
                        checked={formData.sesi_id.includes(s.id.toString())}
                        onCheckedChange={() => handleSesiChange(s.id)}
                      />
                      <Label htmlFor={`sesi-${s.id}`} className="text-sm">
                        {s.nama_sesi} ({s.jam_mulai} - {s.jam_selesai})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Selection (only for admin when editing) */}
              {isEditing && currentUser?.role === 'admin' && (
                <div>
                  <Label htmlFor="status_reservasi">Status</Label>
                  <Select onValueChange={(value) => handleSelectChange("status_reservasi", value)} value={formData.status_reservasi}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disetujui">Disetujui</SelectItem>
                      <SelectItem value="ditolak">Ditolak</SelectItem>
                      <SelectItem value="menunggu lunas">Menunggu Lunas</SelectItem>
                      <SelectItem value="siap digunakan">Siap Digunakan</SelectItem>
                      <SelectItem value="sedang berlangsung">Sedang Berlangsung</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Preview (only for new reservations) */}
              {!isEditing && pricePreview !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <Label className="text-sm font-medium text-green-800">Estimasi Total Harga</Label>
                  </div>
                  <p className="text-lg font-semibold text-green-700 mt-1">
                    {formatRupiah(pricePreview)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleFormSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Menyimpan..." : "Menambah..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Simpan" : "Tambah"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Confirmation Modal */}
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Status</DialogTitle>
              <DialogDescription>
                Ubah status reservasi untuk melanjutkan proses.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Status Saat Ini</Label>
                <div className="mt-1">
                  <Badge className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(selectedItem?.status_reservasi)}`}>
                    {getStatusIcon(selectedItem?.status_reservasi)}
                    {selectedItem?.status_reservasi}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label htmlFor="new_status">Status Baru</Label>
                <Select onValueChange={handleStatusChange} value={selectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disetujui">Disetujui</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                    <SelectItem value="menunggu lunas">Menunggu Lunas</SelectItem>
                    <SelectItem value="siap digunakan">Siap Digunakan</SelectItem>
                    <SelectItem value="sedang berlangsung">Sedang Berlangsung</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Konfirmasi"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}