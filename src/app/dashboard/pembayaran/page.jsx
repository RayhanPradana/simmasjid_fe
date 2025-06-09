"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Eye,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Clock4,
  FileText,
  CreditCard as PaymentIcon,
  CalendarCheck,
  Banknote,
  Upload,
  Info, 
  Edit,
  Trash2,
  X, // Add this import
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import Loading from "@/components/loading";


// Define useAuthRedirect hook before using it
const useAuthRedirect = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  return isLoggedIn
}

// API base URLs
// const API_BASE_URL = "http://127.0.0.1:8000/api/pembayaran"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";



export default function Page() {
  const isLoggedIn = useAuthRedirect();

  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("all")
  const [userRole, setUserRole] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState("paid")
  const [paymentMethod, setPaymentMethod] = useState("transfer")
  const [paymentType, setPaymentType] = useState("dp")
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  
  const itemsPerPage = 5

  // Update paymentData state
  const [paymentData, setPaymentData] = useState({
    reservasi_fasilitas_id: '',
    jenis: 'dp',
    metode_pembayaran: 'transfer',
    jumlah_pembayaran: 0, // Add this field
    bukti_transfer: null
  });

  // Price details state
  const [priceDetails, setPriceDetails] = useState({
    totalPrice: 0,
    dpAmount: 0,
    remainingAmount: 0
  });

  // New state variables for filters
  const [nameFilter, setNameFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "Tidak ada token",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      })
    }
    return token
  }

  // Get user role from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserRole(user.role || "user")
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-"
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Get payment status badge
  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    let variant = "outline"
    let icon = null
    
    if (statusLower === "paid") {
      variant = "success"
      icon = <CheckCircle className="h-3 w-3 mr-1" />
    } else if (statusLower === "pending") {
      variant = "warning"
      icon = <Clock4 className="h-3 w-3 mr-1" />
    } else if (statusLower === "belum lunas") {
      variant = "warning" 
      icon = <AlertCircle className="h-3 w-3 mr-1" />
    } else if (statusLower === "unpaid") {
      variant = "destructive"
      icon = <XCircle className="h-3 w-3 mr-1" />
    }
    
    return (
      <Badge variant={variant} className="capitalize flex items-center text-xs">
        {icon}
        {status === "paid" ? "Dibayar" : 
         status === "pending" ? "Pending" :
         status === "belum lunas" ? "Belum Lunas" :
         "Belum Dibayar"}
      </Badge>
    )
  }

  // Get payment type badge
  const getPaymentTypeBadge = (type) => {
    if (!type) return null
    
    const typeLower = type.toLowerCase()
    let variant = "outline"
    
    switch(typeLower) {
      case "dp":
        variant = "warning"
        return <Badge variant={variant}>DP</Badge>
      case "pelunasan":
        variant = "info"
        return <Badge variant={variant}>Pelunasan</Badge>
      case "lunas":
        variant = "success"
        return <Badge variant={variant}>Lunas</Badge>
      default:
        return <Badge variant={variant}>{type}</Badge>
    }
  }

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    if (!method) return null
    
    const methodLower = method.toLowerCase()
    let icon = null
    
    if (methodLower === "transfer") {
      icon = <Banknote className="h-3 w-3 mr-1" />
    } else if (methodLower === "tunai") {
      icon = <CreditCard className="h-3 w-3 mr-1" />
    }
    
    return (
      <Badge variant="outline" className="capitalize flex items-center text-xs">
        {icon}
        {method}
      </Badge>
    )
  }

  // Define fetchPayments function
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/pembayaran`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Sesi berakhir",
            description: "Sesi login Anda telah berakhir. Silakan login kembali.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      let paymentData = [];
      if (Array.isArray(result)) {
        paymentData = result;
      } else if (result && Array.isArray(result.data)) {
        paymentData = result.data;
      }
      
      setPayments(paymentData);
      filterPaymentsByTab(paymentData, currentTab);
      
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast({
        title: "Error",
        description: `Gagal memuat data pembayaran: ${error.message}`,
        variant: "destructive",
      });
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Update useEffect for filters
  useEffect(() => {
    filterPaymentsByTab(payments, currentTab);
  }, [searchTerm, nameFilter, dateFilter, currentTab, payments]); // Add nameFilter and dateFilter to dependencies

  // Update filterPaymentsByTab function
  const filterPaymentsByTab = (paymentsData, tabValue) => {
    if (!paymentsData.length) return;
    
    let filtered = [...paymentsData];
    
    // Filter by tab
    if (tabValue !== "all") {
      filtered = filtered.filter(item => {
        if (tabValue === "pending") return item.status?.toLowerCase() === "pending"
        if (tabValue === "paid") return item.status?.toLowerCase() === "paid"
        if (tabValue === "unpaid") return item.status?.toLowerCase() === "unpaid"
        if (tabValue === "belum lunas") return item.status?.toLowerCase() === "belum lunas"
        if (tabValue === "dp") return item.jenis?.toLowerCase() === "dp"
        if (tabValue === "lunas") return item.jenis?.toLowerCase() === "lunas"
        return true
      })
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const reservasiId = item.reservasi_fasilitas_id?.toString().toLowerCase() || "";
        const status = item.status?.toLowerCase() || "";
        const jenis = item.jenis?.toLowerCase() || "";
        const metode = item.metode_pembayaran?.toLowerCase() || "";
        
        return (
          reservasiId.includes(searchLower) ||
          status.includes(searchLower) ||
          jenis.includes(searchLower) ||
          metode.includes(searchLower)
        );
      });
    }

    // Filter by tenant name
    if (nameFilter) {
      const nameLower = nameFilter.toLowerCase();
      filtered = filtered.filter(item => {
        const penyewaName = getPenyewaName(item)?.toLowerCase() || "";
        return penyewaName.includes(nameLower);
      });
    }

    // Filter by reservation date
    if (dateFilter) {
      filtered = filtered.filter(item => 
        item?.reservasi?.tgl_reservasi === dateFilter
      );
    }
    
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }

  // Handle detail view
  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  // Handle verification modal (admin only)
  const handleVerificationModal = (item) => {
    setDetailItem(item)
    setVerificationStatus("paid") // Reset to default
    setIsVerificationModalOpen(true)
  }

  // Handle payment modal for lunas payment
  const handlePaymentModal = (item) => {
    setDetailItem(item);
    const totalPrice = getPrice(item);
    setPriceDetails({
      totalPrice,
      dpAmount: totalPrice * 0.3,
      remainingAmount: totalPrice * 0.7
    });
    setPaymentType("lunas")
    setPaymentMethod("transfer")
    setSelectedFile(null)
    setFilePreview(null)
    setIsPaymentModalOpen(true)
  }

  // Submit verification status (admin only)
  const handleSubmitVerification = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/pembayaran/${detailItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: verificationStatus,
          // Include payment amount if needed
          jumlah_pembayaran: detailItem.jumlah_pembayaran,
          // Update reservation status based on payment type and verification
          update_reservation: true,
          reservation_status: verificationStatus === 'paid' 
            ? (detailItem.jenis === 'dp' ? 'menunggu_lunas' : 
               detailItem.jenis === 'pelunasan' ? 'siap_digunakan' : 'siap_digunakan')
            : 'pending'
        })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      toast({
        title: "Berhasil",
        description: `Pembayaran ${detailItem.jenis === 'dp' ? 'DP' : 'pelunasan'} berhasil diverifikasi`
      });

      fetchPayments();
      setIsVerificationModalOpen(false);

    } catch (error) {
      console.error("Verification failed:", error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Submit lunas payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Calculate payment amount based on type
      const amount = paymentType === 'dp' 
        ? priceDetails.dpAmount      // 30% for DP
        : priceDetails.totalPrice;   // 100% for full payment

      // Set payment type (only dp or lunas as per controller)
      const paymentJenis = paymentType === 'dp' ? 'dp' : 'lunas';

      // Append form data matching controller validation
      formData.append('reservasi_fasilitas_id', paymentData.reservasi_fasilitas_id);
      formData.append('jenis', paymentJenis);
      formData.append('metode_pembayaran', paymentData.metode_pembayaran);
      formData.append('jumlah_pembayaran', amount);

      // Only append bukti_transfer if method is transfer and file exists
      if (paymentData.metode_pembayaran === 'transfer' && paymentData.bukti_transfer) {
        formData.append('bukti_transfer', paymentData.bukti_transfer);
      }

      // Debug logging
      console.log('Sending payment data:', {
        reservasi_fasilitas_id: paymentData.reservasi_fasilitas_id,
        jenis: paymentJenis,
        metode_pembayaran: paymentData.metode_pembayaran,
        jumlah_pembayaran: amount,
        bukti_transfer: paymentData.bukti_transfer ? 'File present' : 'No file'
      });

      const response = await fetch(`${apiUrl}/api/pembayaran`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      toast.success(result.message || "Pembayaran berhasil dikirim");
      
      // Clear localStorage and redirect
      localStorage.removeItem("pendingPaymentReservationId");
      localStorage.removeItem("paymentType");
      router.push('/home/riwayat');

    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Gagal melakukan pembayaran");
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update payment data
      setPaymentData(prev => ({
        ...prev,
        bukti_transfer: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle tab change
  const handleTabChange = (value) => {
    setCurrentTab(value)
    filterPaymentsByTab(payments, value)
  }
  

  // Handle search
  useEffect(() => {
    filterPaymentsByTab(payments, currentTab)
  }, [searchTerm, payments, currentTab])

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Get reservation date from item
  const getReservasiDate = (item) => {
    if (!item) return "-"
    
    // Get date from the reservasi relationship
    if (item.reservasi && item.reservasi.tgl_reservasi) {
      return formatDate(item.reservasi.tgl_reservasi)
    }
    
    return "-"
  }

  // Get penyewa name from reservasi
  const getPenyewaName = (item) => {
    if (!item) return "-"
    
    // First try to get from nama_penyewa field
    if (item.nama_penyewa) {
      return item.nama_penyewa
    }
    
    // Then try to get from nested relations
    if (item.reservasi) {
      if (item.reservasi.user) {
        return item.reservasi.user.name
      }
    }
    
    return "-"
  }

  // Get price from reservasi
  const getPrice = (item) => {
    if (!item || !item.reservasi) return 0
    
    return item.reservasi.total_harga || 
           item.reservasi.harga || 
           item.reservasi.biaya || 
           0
  }

  // Determine if admin can update payment status
  const canUpdatePayment = (item) => {
    return userRole === "admin"
  }

  // Determine if can make full payment (only for DP payments that are already paid)
  const canMakeFullPayment = (item) => {
    return item.jenis?.toLowerCase() === "dp" && 
           item.status?.toLowerCase() === "paid" && 
           userRole !== "admin"
  }

  // Update the table row status cell to use consistent styling
  const StatusCell = ({ status }) => {
    const statusLower = status?.toLowerCase()
    let variant = "outline"
    let icon = null
    let label = status
    let bgColor = "bg-gray-50"
    let textColor = "text-gray-700"

    switch (statusLower) {
      case "paid":
        variant = "success"
        icon = <CheckCircle className="h-3 w-3 mr-1" />
        label = "Dibayar"
        bgColor = "bg-green-50"
        textColor = "text-green-700"
        break
      case "pending":
        variant = "warning"
        icon = <Clock4 className="h-3 w-3 mr-1" />
        label = "Pending"
        bgColor = "bg-yellow-50"
        textColor = "text-yellow-700"
        break
      case "belum lunas":
        variant = "warning"
        icon = <AlertCircle className="h-3 w-3 mr-1" />
        label = "Belum Lunas"
        bgColor = "bg-orange-50"
        textColor = "text-orange-700"
        break
      case "unpaid":
        variant = "destructive"
        icon = <XCircle className="h-3 w-3 mr-1" />
        label = "Belum Dibayar"
        bgColor = "bg-red-50"
        textColor = "text-red-700"
        break
    }

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {label}
      </div>
    )
  }

  // Delete handler
  const handleDelete = async () => {
    if (!selectedItemId) return
    
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${apiUrl}/api/pembayaran/${selectedItemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      toast({
        title: "Berhasil",
        description: "Data pembayaran berhasil dihapus",
      })
      
      fetchPayments()
      setIsDeleteModalOpen(false)
      
    } catch (error) {
      console.error("Failed to delete payment:", error)
      toast({
        title: "Error",
        description: `Gagal menghapus data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update getPaymentOptions function
  const getPaymentOptions = () => {
    // Only show dp or lunas options
    return (
      <select
        name="jenis"
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="dp">DP (30%)</option>
        <option value="lunas">Lunas (100%)</option>
      </select>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
                  <BreadcrumbPage>Pembayaran</BreadcrumbPage>
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
                    <CardTitle>Data Pembayaran</CardTitle>
                    <CardDescription>Daftar data pembayaran reservasi fasilitas</CardDescription>
                  </div>
                  <Button onClick={() => fetchPayments()}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 mr-2" />
                    )}
                    Refresh Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Tabs */}
                <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="mb-4">
                  <TabsList className="grid grid-cols-3 md:grid-cols-3   w-full">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="belum lunas">Belum Lunas</TabsTrigger>
                    <TabsTrigger value="paid">Dibayar</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Pencarian */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari berdasarkan ID, status, atau metode..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari berdasarkan nama penyewa..."
                      className="pl-10"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                    />
                  </div>
                  <div className="w-48">
                    <Input
                      type="date"
                      className="w-full"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  {(searchTerm || nameFilter || dateFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setNameFilter("")
                        setDateFilter("")
                      }}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reset Filter
                    </Button>
                  )}
                </div>

                {/* Tabel Data */}
                <div className="rounded-md border overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Tabel */}
                    <thead>
                      <tr className="bg-gray-50">
                        {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Reservasi</th> */}
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Reservasi</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penyewa</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pembayaran</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah Pembayaran
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    {/* Body Tabel */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500">
                            <div className="text-center py-10 text-gray-500">
                                <div className="flex justify-center mb-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                                <p className="font-medium">Memuat data...</p>
                            </div>
                          </td>
                        </tr>
                      ) : currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">#{item.reservasi_fasilitas_id}</td> */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{getReservasiDate(item)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{getPenyewaName(item)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {getPaymentTypeBadge(item.jenis)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-green-600">
                              {formatCurrency(getPrice(item))}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-green-600">
                              {formatCurrency(item.jumlah_pembayaran)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <StatusCell status={item.status} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleDetails(item)} title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {canMakeFullPayment(item) && (
                                  <Button variant="ghost" size="icon"
                                    onClick={() => handlePaymentModal(item)} 
                                    title="Bayar Lunas">
                                    <Banknote className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500">
                            <div className="text-center py-10 text-gray-500">
                              <div className="flex justify-center mb-2">
                                <Search className="h-6 w-6" />
                              </div>
                              <p className="font-medium">Tidak ada data yang ditemukan</p>
                              <p className="mt-1">Ubah kriteria pencarian atau segarkan data.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredPayments.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPayments.length)} dari {filteredPayments.length} data
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1
                        const showPage = pageNum <= 2 || pageNum > totalPages - 2 || Math.abs(pageNum - currentPage) <= 1
                        
                        if (!showPage && pageNum === 3 && currentPage > 4) return (
                          <span key="ellipsis-1" className="px-2 py-2">...</span>
                        )
                        
                        if (!showPage && pageNum === totalPages - 2 && currentPage < totalPages - 3) return (
                          <span key="ellipsis-2" className="px-2 py-2">...</span>
                        )
                        
                        if (!showPage) return null
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detail Pembayaran</DialogTitle>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Status Pembayaran</h3>
                  <div className="flex gap-2 items-center">
                  <StatusCell status={detailItem.status} />
                  </div>
                </div>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID Pembayaran</Label>
                    <p className="text-sm font-medium">{detailItem.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID Reservasi</Label>
                    <p className="text-sm font-medium">#{detailItem.reservasi_fasilitas_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <User className="h-4 w-4 inline mr-1" /> Nama Penyewa
                    </Label>
                    <p className="text-sm font-medium">{getPenyewaName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-1" /> Tanggal Reservasi
                    </Label>
                    <p className="text-sm font-medium">{getReservasiDate(detailItem)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <PaymentIcon className="h-4 w-4 inline mr-1" /> Jenis Pembayaran
                    </Label>
                    <p className="text-sm font-medium">{getPaymentTypeBadge(detailItem.jenis)}</p>
                  </div>
                <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <Banknote className="h-4 w-4 inline mr-1" /> Total Harga
                    </Label>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(getPrice(detailItem))}</p>
                  </div>
                </div>
                
                {detailItem.metode_pembayaran && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <CreditCard className="h-4 w-4 inline mr-1" /> Metode Pembayaran
                    </Label>
                    <p className="text-sm font-medium">{getPaymentMethodBadge(detailItem.metode_pembayaran)}</p>
                  </div>
                )}
                
                {detailItem.tgl_pembayaran && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <CalendarCheck className="h-4 w-4 inline mr-1" /> Tanggal Pembayaran
                    </Label>
                    <p className="text-sm font-medium">{formatDate(detailItem.tgl_pembayaran)}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <CreditCard className="h-4 w-4 inline mr-1" /> Jumlah Pembayaran
                    </Label>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(detailItem.jumlah_pembayaran)}
                    </p>
                  </div>
                </div>
                
                {detailItem.bukti_transfer && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <FileText className="h-4 w-4 inline mr-1" /> Bukti Transfer
                    </Label>
                    <div className="mt-2">
                      <img 
                        src={`http://127.0.0.1:8000/storage/${detailItem.bukti_transfer}`}
                        alt="Bukti Transfer" 
                        className="max-w-full h-auto max-h-48 rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden p-4 border rounded bg-gray-50 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Bukti transfer tidak dapat ditampilkan</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Modal (Admin Only) */}
        <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Status Pembayaran</DialogTitle>
              <DialogDescription>
                Ubah status pembayaran untuk ID Reservasi #{detailItem?.reservasi_fasilitas_id}
              </DialogDescription>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nama Penyewa</Label>
                    <p className="text-sm text-gray-600">{getPenyewaName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Jenis Pembayaran</Label>
                    <p className="text-sm text-gray-600">{getPaymentTypeBadge(detailItem.jenis)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status Saat Ini</Label>
                    <div className="mt-1">{getStatusBadge(detailItem.status)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="verification-status">Status Baru</Label>
                  <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Dibayar
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <Clock4 className="h-4 w-4 mr-2 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="belum lunas">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                          Belum Lunas
                        </div>
                      </SelectItem>
                      <SelectItem value="unpaid">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Belum Dibayar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {verificationStatus === "paid" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Konfirmasi Pembayaran</AlertTitle>
                    <AlertDescription>
                      Status akan diubah menjadi "Dibayar". Pastikan pembayaran sudah diterima.
                    </AlertDescription>
                  </Alert>
                )}
                
                {verificationStatus === "unpaid" && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Perhatian</AlertTitle>
                    <AlertDescription>
                      Status akan diubah menjadi "Belum Dibayar". Ini akan membatalkan verifikasi pembayaran.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVerificationModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmitVerification} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Modal for Lunas */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Pembayaran Lunas</DialogTitle>
              <DialogDescription>
                Lakukan pembayaran lunas untuk reservasi #{detailItem?.reservasi_fasilitas_id}
              </DialogDescription>
            </DialogHeader>
            {detailItem && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nama Penyewa</Label>
                    <p className="text-sm text-gray-600">{getPenyewaName(detailItem)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Harga</Label>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(getPrice(detailItem))}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status DP</Label>
                    <div className="mt-1">{getStatusBadge(detailItem.status)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Metode Pembayaran</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">
                          <div className="flex items-center">
                            <Banknote className="h-4 w-4 mr-2" />
                            Transfer Bank
                          </div>
                        </SelectItem>
                        <SelectItem value="tunai">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Tunai
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentMethod === "transfer" && (
                    <div className="space-y-2">
                      <Label htmlFor="bukti-transfer">Bukti Transfer</Label>
                      <div className="space-y-2">
                        <Input
                          id="bukti-transfer"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        {filePreview && (
                          <div className="mt-2">
                            <img 
                              src={filePreview} 
                              alt="Preview Bukti Transfer" 
                              className="max-w-full h-auto max-h-32 rounded border"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload gambar bukti transfer (JPG, PNG, max 2MB)
                      </p>
                    </div>
                  )}
                  
                  {/* Payment amount info box in payment modal */}
                  <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <p className="text-blue-800 font-medium">
                      Jumlah yang harus dibayar: {formatCurrency(
                        detailItem?.jenis === 'dp' 
                          ? priceDetails.remainingAmount  // Show remaining amount for DP payments
                          : priceDetails.totalPrice       // Show total for full payments
                      )}
                    </p>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Informasi Pembayaran</AlertTitle>
                    <AlertDescription>
                      Pembayaran lunas akan dikirim untuk verifikasi admin. Status akan menjadi "Pending" hingga diverifikasi.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmitPayment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Kirim Pembayaran
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pembayaran</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data pembayaran ini? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}