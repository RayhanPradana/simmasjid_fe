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
  Eye,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  User,
  Building,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// API base URLs
const API_BASE_URL = "http://127.0.0.1:8000/api/pembayaran"

export default function Page() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const itemsPerPage = 5

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    
    try {
      // Check if dateString contains time component
      const hasTime = dateString.includes('T') || dateString.includes(' ')
      
      // Parse the date string
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString
      
      // Format the date to DD-MM-YYYY
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
    
    if (statusLower === "sukses") {
      variant = "success"
    } else if (statusLower === "pending") {
      variant = "warning"
    } else if (statusLower === "gagal") {
      variant = "destructive"
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    )
  }

  // Fetch all payment data with reservations
  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Sesi berakhir",
            description: "Sesi login Anda telah berakhir. Silakan login kembali.",
            variant: "destructive",
          })
          return
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      const result = await response.json()
      
      // Process payment data
      let paymentData = []
      
      if (result && Array.isArray(result.data)) {
        paymentData = result.data
      } else if (Array.isArray(result)) {
        paymentData = result
      } else if (result.data && typeof result.data === 'object') {
        // Handle nested data object
        const dataValues = Object.values(result.data)
        if (Array.isArray(dataValues) && dataValues.length > 0) {
          if (Array.isArray(dataValues[0])) {
            paymentData = dataValues[0]
          } else {
            paymentData = dataValues
          }
        }
      }
      
      setPayments(paymentData)
      setFilteredPayments(paymentData)
      
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast({
        title: "Error",
        description: `Gagal memuat data pembayaran: ${error.message}`,
        variant: "destructive",
      })
      setPayments([])
      setFilteredPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle detail view
  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  // Handle search
  useEffect(() => {
    if (!payments.length) return
    
    const filtered = payments.filter(item => {
      // Get all searchable fields (include nested reservasi data)
      const reservasiId = item.reservasi_id ? item.reservasi_id.toString().toLowerCase() : ""
      const userId = item.user_id ? item.user_id.toString().toLowerCase() : ""
      const status = item.status ? item.status.toLowerCase() : ""
      
      // Search in reservasi data if available
      let reservasiData = ""
      if (item.reservasi) {
        const reservasi = item.reservasi
        // Add any relevant reservasi fields for searching
        reservasiData = `${reservasi.id || ""} ${reservasi.tgl_reservasi || ""} ${reservasi.status || ""}`
        reservasiData = reservasiData.toLowerCase()
      }
      
      const searchLower = searchTerm.toLowerCase()
      
      return (
        reservasiId.includes(searchLower) ||
        userId.includes(searchLower) ||
        status.includes(searchLower) ||
        reservasiData.includes(searchLower)
      )
    })
    
    setFilteredPayments(filtered)
    setCurrentPage(1)
  }, [searchTerm, payments])

  // Load data when component mounts
  useEffect(() => {
    fetchPayments()
  }, [])

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Get reservation date from item
  const getReservasiDate = (item) => {
    if (!item) return "-"
    
    // First try to get date from the reservasi relationship
    if (item.reservasi && item.reservasi.tgl_reservasi) {
      return formatDate(item.reservasi.tgl_reservasi)
    }
    
    // Fallback to direct tanggal_reservasi if available
    if (item.tanggal_reservasi) {
      return formatDate(item.tanggal_reservasi)
    }
    
    return "-"
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
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari ID reservasi..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Data - Simplified */}
                <div className="rounded-md border overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Tabel - Simplified */}
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Reservasi</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Reservasi</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pembayaran</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    {/* Body Tabel - Simplified */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
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
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.reservasi_id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{getReservasiDate(item)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.tanggal_pembayaran ? formatDate(item.tanggal_pembayaran) : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.jumlah)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="icon" onClick={() => handleDetails(item)} title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID Pembayaran</Label>
                    <p className="text-sm font-medium">{detailItem.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID Reservasi</Label>
                    <p className="text-sm font-medium">{detailItem.reservasi_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <User className="h-4 w-4 inline mr-1" /> User ID
                    </Label>
                    <p className="text-sm font-medium">{detailItem.user_id || "-"}</p>
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
                      <Calendar className="h-4 w-4 inline mr-1" /> Tanggal Pembayaran
                    </Label>
                    <p className="text-sm font-medium">
                      {detailItem.tanggal_pembayaran ? formatDate(detailItem.tanggal_pembayaran) : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      <CreditCard className="h-4 w-4 inline mr-1" /> Jumlah
                    </Label>
                    <p className="text-sm font-medium">{formatCurrency(detailItem.jumlah)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status Pembayaran</Label>
                  <p className="text-sm font-medium mt-1">{getStatusBadge(detailItem.status)}</p>
                </div>
                
                {/* Data dari relasi reservasi */}
                {detailItem.reservasi && (
                  <div className="border-t pt-4 mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Informasi Reservasi</Label>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">ID Reservasi</Label>
                        <p className="text-sm">{detailItem.reservasi.id}</p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">
                          <Building className="h-4 w-4 inline mr-1" /> Fasilitas
                        </Label>
                        <p className="text-sm">
                          {detailItem.reservasi.fasilitas?.nama_fasilitas || 
                           (detailItem.reservasi.fasilitas_id ? `ID: ${detailItem.reservasi.fasilitas_id}` : '-')}
                        </p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">
                          <Calendar className="h-4 w-4 inline mr-1" /> Tanggal Reservasi
                        </Label>
                        <p className="text-sm">{formatDate(detailItem.reservasi.tgl_reservasi)}</p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" /> Jam Mulai
                        </Label>
                        <p className="text-sm">{detailItem.reservasi.jam_mulai || '-'}</p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" /> Jam Selesai
                        </Label>
                        <p className="text-sm">{detailItem.reservasi.jam_selesai || '-'}</p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">Status Reservasi</Label>
                        <p className="text-sm">
                          {detailItem.reservasi.status ? (
                            <Badge variant={
                              detailItem.reservasi.status.toLowerCase() === 'approved' ? 'success' :
                              detailItem.reservasi.status.toLowerCase() === 'pending' ? 'warning' :
                              detailItem.reservasi.status.toLowerCase() === 'rejected' ? 'destructive' : 'outline'
                            } className="capitalize">
                              {detailItem.reservasi.status}
                            </Badge>
                          ) : '-'}
                        </p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">Dibuat Pada</Label>
                        <p className="text-sm">{formatDate(detailItem.reservasi.created_at)}</p>
                      </div>
                      
                      <div className="mb-2">
                        <Label className="text-sm font-medium text-gray-500">Diupdate Pada</Label>
                        <p className="text-sm">{formatDate(detailItem.reservasi.updated_at)}</p>
                      </div>
                      
                      {detailItem.reservasi.keterangan && (
                        <div className="col-span-2 mb-2">
                          <Label className="text-sm font-medium text-gray-500">Keterangan</Label>
                          <p className="text-sm">{detailItem.reservasi.keterangan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!detailItem.reservasi && (
                  <Alert className="border-amber-400 bg-amber-50 text-amber-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Data reservasi tidak tersedia
                    </AlertDescription>
                  </Alert>
                )}
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
      </SidebarInset>
    </SidebarProvider>
  )
}