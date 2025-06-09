'use client';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/calendar';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/utils/format';
import { toast } from 'react-hot-toast';
import AppSidebarUser from '@/components/app-sidebar-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function ReservasiPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fasilitas, setFasilitas] = useState([]);
  const [acara, setAcara] = useState([]);
  const [sesi, setSesi] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSesi, setSelectedSesi] = useState([]);
  const [selectedFasilitas, setSelectedFasilitas] = useState('');
  const [selectedAcara, setSelectedAcara] = useState('');
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHarga, setTotalHarga] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingReservations, setExistingReservations] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  

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
      toast.error("Silakan login terlebih dahulu untuk melakukan reservasi");
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

      const response = await fetch(`${API_BASE_URL}/reservasiuser`, {
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
        setExistingReservations(result);
      } else if (result.data && Array.isArray(result.data)) {
        setReservations(result.data);
        setExistingReservations(result.data);
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

  // Fetch related data for dropdowns
  const fetchRelatedData = async () => {
    if (!checkAuthentication()) return;
    
    try {
      const token = localStorage.getItem("token");
      const user = getCurrentUser();
      
      // Fetch acara data
      try {
        const acaraResponse = await fetch(`${API_BASE_URL}/acarauser`, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (acaraResponse.ok) {
          const acaraResult = await acaraResponse.json();
          const acaraData = Array.isArray(acaraResult) ? acaraResult : (acaraResult.data || []);
          setAcara(acaraData);
          console.log("Acara data loaded:", acaraData);
        } else if (acaraResponse.status === 401 || acaraResponse.status === 403) {
          console.error("Authentication error fetching acara:", acaraResponse.status);
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        } else {
          console.error("Error fetching acara:", acaraResponse.status);
          toast.error(`Gagal memuat data acara: ${acaraResponse.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch acara:", error);
      }
      
      // Fetch fasilitas data
      try {
        const fasilitasResponse = await fetch(`${API_BASE_URL}/fasilitasuser`, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (fasilitasResponse.ok) {
          const fasilitasResult = await fasilitasResponse.json();
          const fasilitasData = Array.isArray(fasilitasResult) ? fasilitasResult : (fasilitasResult.data || []);
          setFasilitas(fasilitasData);
          console.log("Fasilitas data loaded:", fasilitasData);
        } else if (fasilitasResponse.status === 401 || fasilitasResponse.status === 403) {
          console.error("Authentication error fetching fasilitas:", fasilitasResponse.status);
          // Don't redirect again if already handled in acara fetch
        } else {
          console.error("Error fetching fasilitas:", fasilitasResponse.status);
          toast.error(`Gagal memuat data fasilitas: ${fasilitasResponse.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch fasilitas:", error);
      }
      
      // Fetch sesi data
      try {
        const sesiResponse = await fetch(`${API_BASE_URL}/sesiuser`, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (sesiResponse.ok) {
          const sesiResult = await sesiResponse.json();
          const sesiData = Array.isArray(sesiResult) ? sesiResult : (sesiResult.data || []);
          setSesi(sesiData);
          console.log("Sesi data loaded:", sesiData);
        } else if (sesiResponse.status === 401 || sesiResponse.status === 403) {
          console.error("Authentication error fetching sesi:", sesiResponse.status);
          // Don't redirect again if already handled in acara fetch
        } else {
          console.error("Error fetching sesi:", sesiResponse.status);
          toast.error(`Gagal memuat data sesi: ${sesiResponse.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch sesi:", error);
      }

      // Fetch users for admin
      if (user && user.role === 'admin') {
        try {
          const usersResponse = await fetch(`${API_BASE_URL}/usersuser`, {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (usersResponse.ok) {
            const usersResult = await usersResponse.json();
            const usersData = Array.isArray(usersResult) ? usersResult : (usersResult.data || []);
            setUsers(usersData);
          } else if (usersResponse.status === 401 || usersResponse.status === 403) {
            console.error("Authentication error fetching users:", usersResponse.status);
            // Don't redirect again if already handled in acara fetch
          } else {
            console.error("Error fetching users:", usersResponse.status);
            toast.error(`Gagal memuat data pengguna: ${usersResponse.status}`);
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch related data:", error);
      toast.error("Gagal memuat data terkait");
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
        
        await fetchRelatedData();
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

  // Calculate total price based on selections
  useEffect(() => {
    if (selectedAcara && selectedFasilitas) {
      const selectedAcaraData = acara.find(item => item.id === parseInt(selectedAcara));
      const selectedFasilitasData = fasilitas.find(item => item.id === parseInt(selectedFasilitas));
      
      if (selectedAcaraData && selectedFasilitasData) {
        // Ensure both values are parsed as numbers before adding
        const acaraHarga = selectedAcaraData.harga ? parseFloat(selectedAcaraData.harga) : 0;
        const fasilitasHarga = selectedFasilitasData.harga ? parseFloat(selectedFasilitasData.harga) : 0;
        const totalHarga = acaraHarga + fasilitasHarga;
        setTotalHarga(totalHarga);
      }
    }
  }, [selectedAcara, selectedFasilitas, acara, fasilitas]);

  // Check if a session is already booked for the selected date and facility
  const isSessionBooked = (sesiId) => {
    if (!selectedDate || !selectedFasilitas) return false;
    
    const formattedDate = formatDate(selectedDate);
    
    return existingReservations.some(reservation => 
      reservation.fasilitas_id === parseInt(selectedFasilitas) && 
      reservation.tgl_reservasi === formattedDate &&
      reservation.sesi.some(s => s.id === sesiId) &&
      ['disetujui', 'sedang berlangsung', 'diajukan', 'selesai'].includes(reservation.status_reservasi)
    );
  };

  // New function to check if all sessions are booked for a specific date
  const isDateFullyBooked = (date) => {
    if (!selectedFasilitas || !sesi.length) return false;
    
    const formattedDate = formatDate(date);
    
    // Get all sessions that are already booked for this date and facility
    const bookedSessions = [];
    existingReservations.forEach(reservation => {
      if (
        reservation.fasilitas_id === parseInt(selectedFasilitas) && 
        reservation.tgl_reservasi === formattedDate &&
        ['disetujui', 'sedang berlangsung', 'diajukan', 'selesai'].includes(reservation.status_reservasi)
      ) {
        reservation.sesi.forEach(s => {
          if (!bookedSessions.includes(s.id)) {
            bookedSessions.push(s.id);
          }
        });
      }
    });
    
    // Check if all available sessions are booked
    return bookedSessions.length >= sesi.length;
  };

  // Calculate unavailable dates when facility or reservations change
  useEffect(() => {
    if (selectedFasilitas && existingReservations.length > 0 && sesi.length > 0) {
      // Get all unique dates from reservations for this facility
      const allDates = [...new Set(
        existingReservations
          .filter(r => r.fasilitas_id === parseInt(selectedFasilitas))
          .map(r => r.tgl_reservasi)
      )];
      
      // Check each date to see if all sessions are booked
      const fullyBookedDates = allDates.filter(date => {
        const dateObj = new Date(date);
        return isDateFullyBooked(dateObj);
      });
      
      setUnavailableDates(fullyBookedDates);
    }
  }, [selectedFasilitas, existingReservations, sesi]);

  const handleDateSelect = (date) => {
    // Check if the date is fully booked
    if (isDateFullyBooked(date)) {
      toast.error("Semua sesi pada tanggal ini sudah direservasi. Silakan pilih tanggal lain.");
      return;
    }
    
    setSelectedDate(date);
    setSelectedSesi([]);
    
    // Move to next step after date selection
    if (currentStep === 3) {
      nextStep();
    }
  };

  const handleSesiSelect = (sesiId) => {
    // If the session is already booked, don't select it
    if (isSessionBooked(sesiId)) {
      toast.error("Sesi ini sudah direservasi pada tanggal tersebut");
      return;
    }
    
    setSelectedSesi(prev => {
      if (prev.includes(sesiId)) {
        return prev.filter(id => id !== sesiId);
      } else {
        return [...prev, sesiId];
      }
    });
  };

  const handleFasilitasSelect = (facilityId) => {
    setSelectedFasilitas(facilityId);
    setSelectedSesi([]);
    nextStep();
  };

  const handleAcaraSelect = (acaraId) => {
    setSelectedAcara(acaraId);
    nextStep();
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Silakan login terlebih dahulu untuk melakukan reservasi");
        router.push("/login");
        return;
      }
      
      // Validate all selections are made
      if (!selectedAcara || !selectedFasilitas || !selectedDate || selectedSesi.length === 0) {
        toast.error("Silakan lengkapi semua pilihan reservasi");
        return;
      }
      
      // Create payload with updated structure based on new flow
      const payload = {
        acara_id: parseInt(selectedAcara),
        fasilitas_id: parseInt(selectedFasilitas),
        tgl_reservasi: formatDate(selectedDate),
        sesi_id: selectedSesi.map(id => parseInt(id)),
        status_reservasi: "diajukan" // Default status when submitting new reservation
      };

      console.log("Submitting reservation payload:", payload);

      const response = await fetch(`${API_BASE_URL}/reservasiuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi login Anda telah berakhir. Silakan login kembali.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }
        
        const errorData = await response.json();
        toast.error(errorData.message || "Terjadi kesalahan saat membuat reservasi");
        return;
      }
      
      const result = await response.json();
      toast.success("Pengajuan reservasi berhasil dibuat!");
      
      // Redirect to reservations list or details page
      const reservationId = result.data && result.data.id ? result.data.id : 
                         (result.id ? result.id : 'success');
      router.push(`/home/riwayat`);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast.error("Gagal membuat reservasi. Periksa koneksi internet Anda.");
    }
  };

  const getSelectedFasilitasName = () => {
    const facility = fasilitas.find(f => f.id === parseInt(selectedFasilitas));
    return facility?.nama_fasilitas || '';
  };

  const getSelectedAcaraName = () => {
    const event = acara.find(a => a.id === parseInt(selectedAcara));
    return event?.nama_acara|| '';
  };

  const getSelectedSesiTimes = () => {
    return selectedSesi.map(id => {
      const session = sesi.find(s => s.id === id);
      return session ? `${session.deskripsi} (${session.jam_mulai} - ${session.jam_selesai})` : '';
    }).join(', ');
  };

  // Get status badge class based on reservation status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'diajukan':
        return 'bg-yellow-100 text-yellow-800';
      case 'disetujui':
        return 'bg-green-100 text-green-800';
      case 'ditolak':
        return 'bg-red-100 text-red-800';
      case 'selesai':
        return 'bg-blue-100 text-blue-800';
      case 'pembayaran_pending':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get formatted status text for display
  const getStatusText = (status) => {
    switch(status) {
      case 'diajukan':
        return 'Menunggu Persetujuan';
      case 'disetujui':
        return 'Disetujui';
      case 'ditolak':
        return 'Ditolak';
      case 'selesai':
        return 'Selesai';
      case 'pembayaran_pending':
        return 'Menunggu Pembayaran';
      default:
        return status || 'Unknown';
    }
  };

  // Check if any data has loaded
  const isDataEmpty = acara.length === 0 && fasilitas.length === 0 && sesi.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (isDataEmpty && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tidak Dapat Memuat Data</h2>
          <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan saat memuat data. Kemungkinan Anda belum login atau sesi Anda telah berakhir.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDetails = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebarUser />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-600">Reservasi Fasilitas Masjid</h1>
                
        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>1</div>
                <span className={`text-xs mt-2 font-medium ${currentStep === 1 ? 'text-green-600' : 'text-gray-500'}`}>Jenis Acara</span>
              </div>
              <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>2</div>
                <span className={`text-xs mt-2 font-medium ${currentStep === 2 ? 'text-green-600' : 'text-gray-500'}`}>Fasilitas</span>
              </div>
              <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>3</div>
                <span className={`text-xs mt-2 font-medium ${currentStep === 3 ? 'text-green-600' : 'text-gray-500'}`}>Tanggal</span>
              </div>
              <div className={`h-1 w-16 ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>4</div>
                <span className={`text-xs mt-2 font-medium ${currentStep === 4 ? 'text-green-600' : 'text-gray-500'}`}>Sesi</span>
              </div>
              <div className={`h-1 w-16 ${currentStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 5 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>5</div>
                <span className={`text-xs mt-2 font-medium ${currentStep === 5 ? 'text-green-600' : 'text-gray-500'}`}>Pengajuan</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
          {/* Step 1: Select Event Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Pilih Jenis Acara</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {acara.filter(item => item.status === 'tersedia').map(item => (
                  <div 
                    key={item.id}
                    className={`group relative bg-white transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden shadow-md hover:shadow-xl ${
                      selectedAcara === item.id.toString() ? 'ring-4 ring-green-500' : ''
                    }`}
                  >
                    {/* Price badge - more prominent */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-1">
                        <span className="font-bold text-green-600">{formatRupiah(item.harga)}</span>
                      </div>
                    </div>

                    <div className="relative h-48 bg-green-100">
                      {item.gambar ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${item.gambar}`}
                          alt={item.nama_acara}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/400x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-100 opacity-0"></div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{item.nama_acara}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1 hover:bg-green-50 rounded-full text-green-600 hover:text-green-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="relative">
                        <div 
                          className="prose prose-sm max-w-none overflow-hidden mb-4"
                          style={{ maxHeight: '60px' }}
                          dangerouslySetInnerHTML={{ 
                            __html: item.deskripsi || "Tidak ada deskripsi"
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white pointer-events-none"></div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:underline"
                        >
                          <span>Lihat Detail</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleAcaraSelect(item.id.toString())}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span>Pilih Acara</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Select Facility */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Pilih Fasilitas</h2>
              
              <div className="mb-4">
                <button 
                  onClick={prevStep}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Pilih Acara
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fasilitas.filter(item => item.status === 'tersedia').map(item => (
                  <div 
                    key={item.id}
                    className={`group relative bg-white transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden shadow-md hover:shadow-xl ${
                      selectedFasilitas === item.id.toString() ? 'ring-4 ring-green-500' : ''
                    }`}
                  >
                    {/* Price badge - more prominent */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-1">
                        <span className="font-bold text-green-600">{formatRupiah(item.harga)}</span>
                      </div>
                    </div>

                    <div className="relative h-48 bg-green-100">
                      {item.gambar ? (
                        <img
                          src={`http://127.0.0.1:8000/storage/${item.gambar}`}
                          alt={item.nama_fasilitas}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/400x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-100 opacity-0"></div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{item.nama_fasilitas}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1 hover:bg-green-50 rounded-full text-green-600 hover:text-green-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="relative">
                        <div 
                          className="prose prose-sm max-w-none overflow-hidden mb-4"
                          style={{ maxHeight: '60px' }}
                          dangerouslySetInnerHTML={{ 
                            __html: item.keterangan || "Tidak ada deskripsi"
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white pointer-events-none"></div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:underline"
                        >
                          <span>Lihat Detail</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFasilitasSelect(item.id.toString())}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span>Pilih Fasilitas</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Select Date */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Pilih Tanggal</h2>
              
              <div className="mb-4">
                <button 
                  onClick={prevStep}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Pilih Fasilitas
                </button>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <div className="p-4 bg-green-50">
                      <h3 className="font-bold text-center text-lg text-green-700">Pilih Tanggal Reservasi</h3>
                    </div>
                    <div className="p-6">
                      <Calendar 
                        onDateSelect={handleDateSelect} 
                        reservations={reservations.filter(r => 
                          r.fasilitas_id === parseInt(selectedFasilitas) &&
                          ['disetujui', 'sedang berlangsung', 'diajukan', 'selesai'].includes(r.status_reservasi)
                        )}
                        unavailableDates={unavailableDates}
                      />
                      
                      <div className="mt-6 flex justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-400 rounded"></div>
                          <span className="text-sm">Semua sesi penuh</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                          <span className="text-sm">Sebagian sesi terisi</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-100 rounded"></div>
                          <span className="text-sm">Tersedia</span>
                        </div>
                      </div>
                      
                      {selectedDate && (
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={nextStep}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Lanjutkan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Select Session */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Pilih Sesi</h2>
              
              <div className="mb-4">
                <button 
                  onClick={prevStep}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Pilih Tanggal
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tanggal Dipilih</p>
                    <p className="font-semibold">{selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sesi.map(item => {
                  const isBooked = isSessionBooked(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => !isBooked && handleSesiSelect(item.id)}
                      className={`
                        cursor-pointer p-4 rounded-lg shadow-md transition-all duration-300
                        ${isBooked ? 'bg-red-100 opacity-90 cursor-not-allowed' : 'bg-green-100 hover:shadow-lg'}
                        ${selectedSesi.includes(item.id) ? 'ring-4 ring-black-500' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div className={isBooked ? 'text-red-800' : 'text-green-800'}>
                          <h3 className="font-bold text-lg">{item.nama}</h3>
                          <p>
                            {item.jam_mulai} - {item.jam_selesai}
                          </p>
                          {item.deskripsi && (
                            <p className="text-sm mt-1">{item.deskripsi}</p>
                          )}
                        </div>
                        <div>
                          {isBooked ? (
                            <span className="bg-red-200 text-red-800 text-xs px-3 py-1 rounded-full font-medium">Sudah Dipesan</span>
                          ) : selectedSesi.includes(item.id) ? (
                            <div className="flex items-center">
                              <span className="bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full font-medium mr-2">Tersedia</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full font-medium mr-2">Tersedia</span>
                              <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStep}
                  disabled={selectedSesi.length === 0}
                  className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                    selectedSesi.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Lanjutkan
                </button>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Sudah Dipesan</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Tersedia</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Ringkasan Reservasi</h2>
              
              <div className="mb-4">
                <button 
                  onClick={prevStep}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali ke Pilih Sesi
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-700">Detail Reservasi</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Acara:</span>
                        <span className="font-medium">{getSelectedAcaraName()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fasilitas:</span>
                        <span className="font-medium">{getSelectedFasilitasName()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="font-medium">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sesi:</span>
                        <span className="font-medium text-right">{getSelectedSesiTimes()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-700">Rincian Biaya</h3>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Biaya Acara</span>
                          <span>{formatRupiah(acara.find(a => a.id === parseInt(selectedAcara))?.harga || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Biaya Fasilitas</span>
                          <span>{formatRupiah(fasilitas.find(f => f.id === parseInt(selectedFasilitas))?.harga || 0)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-green-600">{formatRupiah(totalHarga)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Catatan:</span> Pembayaran dapat dilakukan setelah reservasi disetujui oleh admin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                  Ajukan Reservasi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal - Enhanced for both Acara and Fasilitas */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {detailItem?.nama_acara || detailItem?.nama_fasilitas}
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap {detailItem?.nama_acara ? 'acara' : 'fasilitas'}
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="mt-4 space-y-6">
              <div className="aspect-video relative overflow-hidden rounded-xl shadow-lg">
                {detailItem.gambar ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${detailItem.gambar}`}
                    alt={detailItem.nama_acara || detailItem.nama_fasilitas}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Tidak ada gambar</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="prose prose-green max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: detailItem.deskripsi || detailItem.keterangan || '-'
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Biaya:</span>
                  <span className="text-xl font-semibold text-green-600">
                    {formatRupiah(detailItem.harga)}
                  </span>
                </div>
                <Badge variant={detailItem.status === 'tersedia' ? 'success' : 'destructive'}>
                  {detailItem.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                </Badge>
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
    </div>
  );
}