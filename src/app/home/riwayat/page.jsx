'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppSidebarUser from '@/components/app-sidebar-user';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  Eye, 
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Loader2,
  CircleEllipsis,
} from 'lucide-react';

// const API_BASE_URL = "http://127.0.0.1:8000/api";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ReservasiPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  // Get current user info
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      console.log("Current token:", token);
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("Current user:", user);
        setCurrentUser(user);
        return user;
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
    return null;
  };

  // Check if the user is logged in
  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Silakan login terlebih dahulu untuk melihat riwayat reservasi");
      router.push("/login");
      return false;
    }
    return true;
  };

  // Fetch all reservations from API
  const fetchReservations = async () => {
    if (!checkAuthentication()) return;
    
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/reservasiuser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        toast.error(`Gagal memuat data: ${response.status}`);
        return;
      }

      const result = await response.json();
      
      // Controller returns direct array
      if (Array.isArray(result)) {
        setReservations(result);
      } else if (result.data && Array.isArray(result.data)) {
        setReservations(result.data);
      } else {
        console.error("Format data tidak valid:", result);
        setReservations([]);
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast.error("Gagal memuat data reservasi");
      setReservations([]);
    }
  };

  // Fetch detailed reservation data from controller
  const fetchReservationDetail = async (reservationId) => {
    if (!checkAuthentication()) return null;
    
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/reservasiuser/${reservationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return null;
        }
        if (response.status === 404) {
          toast.error("Reservasi tidak ditemukan atau bukan milik Anda");
          return null;
        }
        toast.error(`Gagal memuat detail reservasi: ${response.status}`);
        return null;
      }

      const result = await response.json();
      console.log("Detail reservation data:", result);
      return result;
    } catch (error) {
      console.error("Failed to fetch reservation detail:", error);
      toast.error("Gagal memuat detail reservasi");
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Check authentication first
        if (!checkAuthentication()) {
          setIsLoading(false);
          return;
        }
        
        getCurrentUser();
        await fetchReservations();
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("Gagal memuat data. Periksa koneksi internet Anda.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Update handlePayment function
  const handlePayment = (reservationId, type) => {
    localStorage.setItem("pendingPaymentReservationId", reservationId);
    localStorage.setItem("paymentType", type); // 'dp' or 'remaining'
    router.push('/home/pembayaran');
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'pending':
      case 'diajukan':
        return 'warning';
      case 'disetujui':
        return 'success';
      case 'ditolak':
        return 'destructive';
      case 'selesai':
        return 'default';
      case 'menunggu lunas':
        return 'orange';
      case 'pembayaran_pending':
        return 'secondary';
      case 'siap digunakan':
        return 'success';
      case 'sedang berlangsung':
        return 'info';
      case 'dibatalkan':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
      case 'diajukan':
        return <AlertCircle className="w-4 h-4" />;
      case 'disetujui':
      case 'siap digunakan':
        return <CheckCircle className="w-4 h-4" />;
      case 'ditolak':
      case 'dibatalkan':
        return <XCircle className="w-4 h-4" />;
      case 'selesai':
        return <CheckCircle className="w-4 h-4" />;
      case 'menunggu lunas':
      case 'pembayaran_pending':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Update cancelReservation function
  const cancelReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/reservasiuser/${reservationId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }

      await fetchReservations(); // Refresh the reservations list
      toast.success("Reservasi berhasil dibatalkan");
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Gagal membatalkan reservasi");
    }
  };

  // Add handleCancelClick and handleConfirmCancel functions
  const handleCancelClick = (reservation) => {
    setReservationToCancel(reservation);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/reservasiuser/${reservationToCancel.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }

      await fetchReservations();
      toast.success("Reservasi berhasil dibatalkan");
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Gagal membatalkan reservasi");
    } finally {
      setIsCancelDialogOpen(false);
      setReservationToCancel(null);
    }
  };

  // Replace the existing getActionButton function
  const getActionButton = (reservation) => {
    const status = reservation.status_reservasi;
    
    const ButtonContainer = ({ children }) => (
      <div className="flex flex-col space-y-2 min-w-[200px]">
        {children}
      </div>
    );

    const StatusDisplay = ({ color, icon: Icon, text }) => (
      <div className={`text-sm ${color} italic flex items-center justify-center w-full`}>
        <Icon className="w-4 h-4 mr-2" />
        {text}
      </div>
    );
    
    switch (status) {
      case 'pending':
        return (
          <ButtonContainer>
            <Button
              onClick={() => handleCancelClick(reservation)}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan Reservasi
            </Button>
          </ButtonContainer>
        );
      
      case 'disetujui':
        return (
          <ButtonContainer>
            <Button
              onClick={() => handlePayment(reservation.id, 'dp')}
              variant="default"
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Bayar DP (30%)
            </Button>
            <Button
              onClick={() => handlePayment(reservation.id, 'full')}
              variant="default"
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Bayar Lunas (100%)
            </Button>
            <Button
              onClick={() => handleCancelClick(reservation)}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan Reservasi
            </Button>
          </ButtonContainer>
        );
      
      case 'menunggu lunas':
        return (
          <ButtonContainer>
            <Button
              onClick={() => handlePayment(reservation.id, 'pelunasan')}
              variant="default"
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Bayar Pelunasan (70%)
            </Button>
            <Button
              onClick={() => handleCancelClick(reservation)}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan Reservasi
            </Button>
          </ButtonContainer>
        );

      case 'ditolak':
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-red-600" 
              icon={XCircle} 
              text="Reservasi ditolak" 
            />
          </ButtonContainer>
        );

      case 'siap digunakan':
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-green-600" 
              icon={CheckCircle} 
              text="Siap digunakan" 
            />
          </ButtonContainer>
        );

      case 'sedang berlangsung':
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-blue-600" 
              icon={Clock} 
              text="Sedang berlangsung" 
            />
          </ButtonContainer>
        );

      case 'selesai':
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-gray-600" 
              icon={CheckCircle} 
              text="Selesai" 
            />
          </ButtonContainer>
        );

      case 'dibatalkan':
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-red-600" 
              icon={XCircle} 
              text="Dibatalkan" 
            />
          </ButtonContainer>
        );

      default:
        return (
          <ButtonContainer>
            <StatusDisplay 
              color="text-gray-600" 
              icon={AlertCircle} 
              text="Menunggu proses" 
            />
          </ButtonContainer>
        );
    }
  };

  // Get formatted status text for display
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'Menunggu Persetujuan';
      case 'diajukan':
        return 'Menunggu Persetujuan';
      case 'disetujui':
        return 'Disetujui';
      case 'ditolak':
        return 'Ditolak';
      case 'selesai':
        return 'Selesai';
      case 'menunggu lunas':
        return 'Menunggu Pelunasan';
      case 'pembayaran_pending':
        return 'Menunggu Pembayaran';
      case 'siap digunakan':
        return 'Siap Digunakan';
      case 'sedang berlangsung':
        return 'Sedang Berlangsung';
      case 'dibatalkan':
        return 'Dibatalkan';
      default:
        return status || 'Unknown';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '-';
  };

  // Updated function to fetch and open detail modal
  const openDetailModal = async (reservation) => {
    const detailData = await fetchReservationDetail(reservation.id);
    if (detailData) {
      setSelectedReservation(detailData);
      setIsDetailOpen(true);
    }
  };

  const getSesiNames = (sesiArray) => {
    if (!sesiArray || !Array.isArray(sesiArray) || sesiArray.length === 0) return "-"
    return sesiArray.map(s => s.nama_sesi || `Sesi ${s.id}`).join(", ")
  }

  const getSesiTimes = (sesiArray) => {
    if (!sesiArray || !Array.isArray(sesiArray) || sesiArray.length === 0) return "-"
    return sesiArray.map(s => `${s.jam_mulai} - ${s.jam_selesai}`).join(", ")
  }

  const DetailModal = () => {
    if (!selectedReservation) return null;

    return (
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detail Reservasi #{selectedReservation.id}</span>
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap reservasi fasilitas
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Memuat detail...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Status Reservasi</span>
                    <Badge variant={getStatusBadgeVariant(selectedReservation.status_reservasi)} className="flex items-center space-x-1">
                      {getStatusIcon(selectedReservation.status_reservasi)}
                      <span>{getStatusText(selectedReservation.status_reservasi)}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tanggal Reservasi</p>
                        <p className="font-semibold">{formatDate(selectedReservation.tgl_reservasi)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nama Acara</p>
                        <p className="font-semibold">{selectedReservation.acara?.nama_acara || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fasilitas</p>
                        <p className="font-semibold">{selectedReservation.fasilitas?.nama_fasilitas || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Waktu Sesi</p>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>{getSesiNames(selectedReservation.sesi)}</div>
                          <div className="text-xs text-gray-500">{getSesiTimes(selectedReservation.sesi)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              {selectedReservation.acara && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Acara</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Acara</p>
                      <p className="font-semibold">{selectedReservation.acara.nama_acara || '-'}</p>
                    </div>
                    
                    {selectedReservation.acara.deskripsi && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deskripsi</p>
                        <div 
                          className="text-gray-800 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: formatDescription(selectedReservation.acara.deskripsi) 
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {selectedReservation.acara.harga && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Biaya Acara</p>
                          <p className="font-semibold text-green-600">{formatCurrency(selectedReservation.acara.harga)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Facility Details */}
              {selectedReservation.fasilitas && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Fasilitas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fasilitas</p>
                        <p className="font-semibold">{selectedReservation.fasilitas.nama_fasilitas}</p>
                      </div>
                      {selectedReservation.fasilitas.harga && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Biaya Fasilitas</p>
                          <p className="font-semibold text-green-600">{formatCurrency(selectedReservation.fasilitas.harga)}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedReservation.fasilitas.deskripsi && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deskripsi Fasilitas</p>
                        <p className="text-gray-800">{selectedReservation.fasilitas.deskripsi}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* User Information */}
              {selectedReservation.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Pemesan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nama</p>
                        <p className="font-semibold">{selectedReservation.user.name || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="font-semibold">{selectedReservation.user.email || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Biaya</p>
                      <p className="font-semibold text-lg text-green-600">
                        {selectedReservation.harga ? formatCurrency(selectedReservation.harga) : 'Belum ditentukan'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment breakdown if available */}
                  {selectedReservation.acara?.harga && selectedReservation.fasilitas?.harga && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">Rincian Biaya:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Biaya Acara:</span>
                          <span>{formatCurrency(selectedReservation.acara.harga)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Biaya Fasilitas:</span>
                          <span>{formatCurrency(selectedReservation.fasilitas.harga)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedReservation.harga)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Waktu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dibuat pada</p>
                      <p className="font-semibold">
                        {selectedReservation.created_at ? 
                          new Date(selectedReservation.created_at).toLocaleString('id-ID') : '-'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Terakhir diperbarui</p>
                      <p className="font-semibold">
                        {selectedReservation.updated_at ? 
                          new Date(selectedReservation.updated_at).toLocaleString('id-ID') : '-'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                {getActionButton(selectedReservation)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebarUser />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Reservasi</h1>
                <p className="text-gray-600">Kelola dan pantau semua reservasi fasilitas Anda</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reservasi</p>
                    <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reservations.filter(r => r.status_reservasi === 'disetujui').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sedang Berlangsung</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {reservations.filter(r => ['sedang berlangsung'].includes(r.status_reservasi)).length}
                    </p>
                  </div>
                  <CircleEllipsis className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selesai</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reservations.filter(r => r.status_reservasi === 'selesai').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 text-gray-300 mb-6">
                  <FileText className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum Ada Reservasi
                </h3>
                <p className="text-gray-600 mb-6">
                  Anda belum membuat reservasi apapun. Mulai dengan membuat reservasi pertama Anda.
                </p>
                <Button
                  onClick={() => router.push('/home/reservasi')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Reservasi Sekarang
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Daftar Reservasi</span>
                </CardTitle>
                <CardDescription>
                  Berikut adalah semua reservasi yang telah Anda buat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Acara</TableHead>
                        <TableHead>Fasilitas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Biaya</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id} className="hover:bg-gray-50">
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="w-4 h-4 text-blue-600" />
                              <span>{formatDate(reservation.tgl_reservasi)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {reservation.acara?.nama_acara || 'Tidak ada nama acara'}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-red-600" />
                              <span>{reservation.fasilitas?.nama_fasilitas || 'Fasilitas tidak diketahui'}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge 
                              variant={getStatusBadgeVariant(reservation.status_reservasi)}
                              className="flex items-center space-x-1 w-fit"
                            >
                              {getStatusIcon(reservation.status_reservasi)}
                              <span>{getStatusText(reservation.status_reservasi)}</span>
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              {reservation.harga ? formatCurrency(reservation.harga) : 'Belum ditentukan'}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                onClick={() => openDetailModal(reservation)}
                                variant="outline"
                                size="sm"
                                className="min-w-[80px]"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Detail
                              </Button>
                              
                              <div className="min-w-[120px]">
                                {getActionButton(reservation)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Konfirmasi Pembatalan
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                <span className="block text-sm text-muted-foreground">
                  Anda akan membatalkan reservasi untuk:
                </span>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {reservationToCancel?.acara?.nama_acara || 'Tidak ada nama acara'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {reservationToCancel?.tgl_reservasi ? 
                        formatDate(reservationToCancel.tgl_reservasi) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {reservationToCancel?.fasilitas?.nama_fasilitas || 'Tidak ada fasilitas'}
                    </span>
                  </div>
                </div>
                <span className="block text-destructive font-medium">
                  Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Tidak, Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Ya, Batalkan Reservasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add this helper function near other utility functions
const formatDescription = (text) => {
  if (!text) return '';
  // Handle bold text (between ** or __)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  // Handle bullet points
  text = text.replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-4">$1</ul>');
  // Handle line breaks
  // text = text.replace(/\n/g, '<br/>');
  return text;
};