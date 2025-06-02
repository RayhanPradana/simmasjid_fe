'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppSidebarUser from '@/components/app-sidebar-user';

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function PembayaranPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    reservasi_fasilitas_id: '',
    jenis: 'dp',
    metode_pembayaran: 'transfer',
    jumlah_pembayaran: 0,
    bukti_transfer: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [priceDetails, setPriceDetails] = useState({
    totalPrice: 0,
    dpAmount: 0,
    remainingAmount: 0
  });
  const [paymentType, setPaymentType] = useState(null);
  
  // New state for payment history
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // New state for detail modal
  const [detailItem, setDetailItem] = useState(null);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return false;
    }
    return true;
  };

  // Get reservation ID from localStorage
  const getReservationId = () => {
    try {
      const id = localStorage.getItem("pendingPaymentReservationId");
      if (id) {
        console.log("Found reservation ID:", id);
        setReservationId(id);
        setPaymentData(prev => ({ ...prev, reservasi_fasilitas_id: id }));
        return id;
      }
    } catch (error) {
      console.error("Failed to get reservation ID:", error);
    }
    return null;
  };

  // Fetch payment history
  const fetchPaymentHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pembayaranuser`, {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Payment history:", result);
      
      if (result.data) {
        setPaymentHistory(result.data);
        setTotalPages(Math.ceil(result.total / itemsPerPage));
      } else {
        setPaymentHistory(result || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      toast.error("Gagal memuat riwayat pembayaran");
      setPaymentHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch reservation details
  const fetchReservationDetails = async (id) => {
    if (!id) return null;
    
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/reservasiuser/${id}`, {
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
        toast.error(`Gagal memuat data: ${response.status}`);
        return null;
        }

        const result = await response.json();
        console.log("Reservation details:", result);

        // Get price from reservation table instead of facility
        if (result && result.harga) {
        const totalPrice = result.harga;
        const dpAmount = Math.ceil(totalPrice * 0.3); // 30% DP
        const remainingAmount = totalPrice - dpAmount;

        setPriceDetails({
            totalPrice,
            dpAmount,
            remainingAmount
        });
        } else if (result && result.fasilitas && result.fasilitas.harga) {
        // Fallback to facility price if reservation price doesn't exist
        const totalPrice = result.fasilitas.harga;
        const dpAmount = Math.ceil(totalPrice * 0.3); // 30% DP
        const remainingAmount = totalPrice - dpAmount;

        setPriceDetails({
            totalPrice,
            dpAmount,
            remainingAmount
        });
        } else {
        toast.error("Informasi harga tidak ditemukan");
        }

        return result;
    } catch (error) {
        console.error("Failed to fetch reservation details:", error);
        toast.error("Gagal memuat detail reservasi");
        return null;
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentData({ ...paymentData, bukti_transfer: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'confirmed':
      case 'lunas':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'dibatalkan':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment type badge color
  const getPaymentTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'dp':
        return 'bg-blue-100 text-blue-800';
      case 'lunas':
      case 'pelunasan':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'dp':
        return 'bg-blue-100 text-blue-800';
      case 'lunas':
      case 'pelunasan':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'belum lunas':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate payment amount based on type
  const calculatePaymentAmount = (totalPrice, paymentType) => {
    switch(paymentType) {
      case 'dp':
        return totalPrice * 0.3; // 30% for DP
      case 'pelunasan':
        return totalPrice * 0.7; // 70% for remaining payment
      case 'full':
        return totalPrice; // 100% for full payment
      default:
        return 0;
    }
  };

  // Get payment options
  const getPaymentOptions = () => {
    switch(paymentType) {
      case 'dp':
        return (
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            <span className="text-gray-700">DP (30% - {formatCurrency(priceDetails.dpAmount)})</span>
            <input type="hidden" name="jenis" value="dp" />
          </div>
        );
      case 'pelunasan':
        return (
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            <span className="text-gray-700">Pelunasan (70% - {formatCurrency(priceDetails.remainingAmount)})</span>
            <input type="hidden" name="jenis" value="lunas" />
          </div>
        );
      case 'full':
        return (
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            <span className="text-gray-700">Pembayaran Lunas (100% - {formatCurrency(priceDetails.totalPrice)})</span>
            <input type="hidden" name="jenis" value="lunas" />
          </div>
        );
      default:
        return null;
    }
  };

  // Handle payment submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Calculate payment amount based on type
      const paymentAmount = paymentType === 'dp' 
        ? priceDetails.dpAmount
        : paymentType === 'pelunasan'
        ? priceDetails.remainingAmount
        : priceDetails.totalPrice;

      // Map payment types to backend expected values
      let paymentTypeBackend;
      switch(paymentType) {
        case 'dp':
          paymentTypeBackend = 'dp';
          break;
        case 'pelunasan':
          paymentTypeBackend = 'pelunasan';
          break;
        case 'full':
          paymentTypeBackend = 'lunas';
          break;
        default:
          paymentTypeBackend = 'dp';
      }

      // Append form data with correct payment type
      formData.append('reservasi_fasilitas_id', paymentData.reservasi_fasilitas_id);
      formData.append('jenis', paymentTypeBackend);
      formData.append('jumlah_pembayaran', paymentAmount);
      formData.append('metode_pembayaran', paymentData.metode_pembayaran);
      
      if (paymentData.bukti_transfer) {
        formData.append('bukti_transfer', paymentData.bukti_transfer);
      }

      // Debug log to check data being sent
      console.log('Sending payment data:', {
        reservasi_id: paymentData.reservasi_fasilitas_id,
        jenis: paymentTypeBackend,
        jumlah: paymentAmount,
        metode: paymentData.metode_pembayaran
      });

      const response = await fetch(`${API_BASE_URL}/pembayaranuser`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      toast.success(result.message || "Pembayaran berhasil dikirim");
      
      // Clear localStorage and refresh payment history
      localStorage.removeItem("pendingPaymentReservationId");
      localStorage.removeItem("paymentType");
      setShowModal(false);
      
      // Refresh payment history
      fetchPaymentHistory(currentPage);

    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Gagal melakukan pembayaran");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchPaymentHistory(newPage);
    }
  };

  // Add this with your other handler functions
  const handleDetail = (payment) => {
    setDetailItem(payment);
  };

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      try {
        if (!checkAuthentication()) {
          setIsLoading(false);
          return;
        }
        
        // Load payment history
        await fetchPaymentHistory(1);
        
        const id = getReservationId();
        const type = localStorage.getItem("paymentType");
        setPaymentType(type);
        
        if (id) {
          const details = await fetchReservationDetails(id);
          if (details) {
            setReservationDetails(details);
            
            // Set initial payment data based on type
            if (type === 'remaining') {
              setPaymentData(prev => ({
                ...prev,
                jenis: 'lunas',
                reservasi_fasilitas_id: id
              }));
            }
            
            setShowModal(true);
          } else if (type) {
            toast.error("Detail reservasi tidak ditemukan");
            router.push('/home/reservasi');
          }
        }
      } catch (error) {
        console.error("Error initializing component:", error);
        toast.error("Terjadi kesalahan saat memuat halaman");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeComponent();
  }, []);

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

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AppSidebarUser />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-blue-600">Pembayaran Reservasi</h1>
            
            {/* Payment Instructions */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-xl font-semibold mb-6">Instruksi Pembayaran</h2>
              
              <div className="mb-8">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">Informasi Rekening</h3>
                  <p className="text-blue-700">Bank BRI: 1234-5678-9012-3456</p>
                  <p className="text-blue-700">A.n. Pengelola Fasilitas</p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Catatan Penting</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>Pembayaran DP minimal 30% dari total biaya</li>
                    <li>Pembayaran lunas harus dilakukan maksimal H-1 acara</li>
                    <li>Konfirmasi pembayaran akan diproses dalam 1x24 jam</li>
                    <li>Jika ada pertanyaan, silakan hubungi admin di (021) 1234-5678</li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Buat Pembayaran Baru
                </button>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Riwayat Transaksi</h2>
                <p className="text-sm text-gray-600 mt-1">Daftar pembayaran yang telah Anda lakukan</p>
              </div>
              
              <div className="overflow-x-auto">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Memuat riwayat transaksi...</span>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.reservasi?.tgl_reservasi || payment.tanggal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeBadge(payment.jenis)}`}>
                              {payment.jenis === 'dp' ? 'DP' : payment.jenis === 'lunas' ? 'Lunas' : payment.jenis?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.jumlah_pembayaran || payment.jumlah)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.metode_pembayaran || payment.metode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusTypeBadge(payment.status)}`}>
                              {payment.status === 'pending' ? 'Menunggu' :
                               payment.status === 'paid' ? 'Dibayar' :
                               payment.status === 'unpaid' ? 'Belum Dibayar' :
                               payment.status === 'belum lunas' ? 'Belum Lunas' :
                               payment.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setDetailItem(payment)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {payment.bukti_transfer && (
                                <a
                                  href={`http://127.0.0.1:8000/storage/${payment.bukti_transfer}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                                    />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, paymentHistory.length)}</span>
                        {' '}to{' '}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, paymentHistory.length)}</span>
                        {' '}of{' '}
                        <span className="font-medium">{paymentHistory.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Form Pembayaran</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {reservationDetails && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Detail Reservasi:</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tanggal:</span> {new Date(reservationDetails.tgl_reservasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Acara:</span> {reservationDetails.acara?.nama_acara || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fasilitas:</span> {reservationDetails.fasilitas?.nama_fasilitas || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total Biaya:</span> {formatCurrency(priceDetails.totalPrice)}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Pembayaran
                  </label>
                  {paymentType === 'dp' && (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-gray-700">DP (30% - {formatCurrency(priceDetails.dpAmount)})</span>
                      <input type="hidden" name="jenis" value="dp" />
                    </div>
                  )}
                  {paymentType === 'pelunasan' && (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-gray-700">Pelunasan (70% - {formatCurrency(priceDetails.remainingAmount)})</span>
                      <input type="hidden" name="jenis" value="pelunasan" />
                    </div>
                  )}
                  {paymentType === 'full' && (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-gray-700">Pembayaran Lunas (100% - {formatCurrency(priceDetails.totalPrice)})</span>
                      <input type="hidden" name="jenis" value="lunas" />
                    </div>
                  )}
                  {!paymentType && (
                    <select
                      name="jenis"
                      value={paymentData.jenis}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="dp">DP (30% - {formatCurrency(priceDetails.dpAmount)})</option>
                      <option value="lunas">Pembayaran Lunas (100% - {formatCurrency(priceDetails.totalPrice)})</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    name="metode_pembayaran"
                    value={paymentData.metode_pembayaran}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="cash">Cash</option>
                    <option value="ewallet">E-Wallet</option>
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Pembayaran
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-gray-700">
                      {paymentType === 'dp' || paymentData.jenis === 'dp' 
                        ? formatCurrency(priceDetails.dpAmount)
                        : paymentType === 'pelunasan'
                        ? formatCurrency(priceDetails.remainingAmount)
                        : formatCurrency(priceDetails.totalPrice)
                      }
                    </span>
                  </div>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bukti Transfer
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload bukti transfer dalam format gambar (JPG, PNG, etc.)
                  </p>
                </div>

                {previewImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Bukti Transfer
                    </label>
                    <div className="border border-gray-300 rounded-md p-2">
                      <img
                        src={previewImage}
                        alt="Preview bukti transfer"
                        className="max-w-full h-48 object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Kirim Pembayaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Detail Pembayaran</h3>
                <button
                  onClick={() => setDetailItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Informasi Reservasi</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-600">ID Reservasi:</span>{' '}
                        <span className="font-medium">#{detailItem.reservasi_fasilitas_id}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Tanggal Reservasi:</span>{' '}
                        <span className="font-medium">{formatDate(detailItem.reservasi?.tgl_reservasi)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Status Pembayaran:</span>{' '}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusTypeBadge(detailItem.status)}`}>
                          {detailItem.status === 'pending' ? 'Menunggu' :
                           detailItem.status === 'paid' ? 'Dibayar' :
                           detailItem.status === 'unpaid' ? 'Belum Dibayar' :
                           detailItem.status === 'belum lunas' ? 'Belum Lunas' :
                           detailItem.status?.toUpperCase() || 'Unknown'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Detail Pembayaran</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-600">Jenis Pembayaran:</span>{' '}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeBadge(detailItem.jenis)}`}>
                          {detailItem.jenis === 'dp' ? 'DP' : 
                           detailItem.jenis === 'lunas' ? 'Lunas' :
                           detailItem.jenis === 'pelunasan' ? 'Pelunasan' :
                           detailItem.jenis?.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Jumlah:</span>{' '}
                        <span className="font-medium text-green-600">{formatCurrency(detailItem.jumlah_pembayaran)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Metode:</span>{' '}
                        <span className="font-medium capitalize">{detailItem.metode_pembayaran}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {detailItem.bukti_transfer && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Bukti Transfer</h4>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <img
                        src={`http://127.0.0.1:8000/storage/${detailItem.bukti_transfer}`}
                        alt="Bukti transfer"
                        className="max-h-64 object-contain mx-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png'; // Gambar placeholder jika gagal load
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}