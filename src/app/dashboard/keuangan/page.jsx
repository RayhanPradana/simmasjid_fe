"use client";

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Search,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { handleCetak } from "@/components/handleCetak";
import { Editor } from "@tinymce/tinymce-react"

export default function Page() {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState("pemasukan");
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const filterActive = ["mingguan", "bulanan", "tahunan"].includes(filterType);

  // Add editor loading state
  const [isEditorLoading, setIsEditorLoading] = useState(true);

  // Add TinyMCE API key
  const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || '4vf36i6pphb405aikdue5x3v9zo1ae5igdpehc3t8dcwni8f'; 

  //const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    tanggal: "",
    jenis: "",
    deskripsi: "",
    total_masuk: "",
    total_keluar: "",
  });

  // function getCurrentFormattedDate() {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, "0");
  //   const day = String(now.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // }

  // Format currency with preserved zeros
  function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === "") return "Rp 0";

    if (typeof amount === "string" && amount.startsWith("Rp ")) return amount;

    // Parse amount to number
    const numAmount = Number(amount);

    return `Rp ${numAmount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }


  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    const filtered = data
      .filter(
        (item) =>
          item.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.total_masuk &&
            item.total_masuk.toString().includes(searchTerm)) ||
          (item.total_keluar &&
            item.total_keluar.toString().includes(searchTerm)) ||
          item.tanggal?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.id - a.id); // Tambahkan pengurutan di sini
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        let url = `${apiUrl}/api/keuangan-laporan`;
        const params = [];

        if (filterType !== "all") {
          params.push(`filterType=${filterType}`);
          if (filterDate) {
            params.push(`filterDate=${filterDate}`);
          }
        }

        if (params.length) {
          url += `?${params.join("&")}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        // Urutkan data berdasarkan ID secara descending
        const sortedData = json.data.sort((a, b) => b.id - a.id);
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filterType, filterDate]);

  let runningSaldo = 0;

  const sortedCurrentItems = filterActive
    ? [...currentItems].sort((a, b) => a.id - b.id)
    : currentItems;

  const computedItems = sortedCurrentItems.map((item) => {
    const masuk = item.total_masuk || 0;
    const keluar = item.total_keluar || 0;

    if (filterActive) {
      runningSaldo += masuk - keluar;
      return {
        ...item,
        dompet: runningSaldo,
      };
    } else {
      return item;
    }
  });

  // READ - Fetch all Data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/keuangan`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      // Urutkan data berdasarkan ID secara descending (terbaru di atas)
      const sortedData = (result.data || result).sort((a, b) => b.id - a.id);
      setData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE - Tambah data baru
  const createData = async (formData) => {
    setIsLoading(true);
    try {
      let totalMasuk = 0;
      let totalKeluar = 0;

      if (transactionType === "pemasukan" && formData.total_masuk) {
        totalMasuk = parseInt(formData.total_masuk.replace(/[^\d]/g, ""), 10);
      }

      if (transactionType === "pengeluaran" && formData.total_keluar) {
        totalKeluar = parseInt(formData.total_keluar.replace(/[^\d]/g, ""), 10);
      }

      const sanitizedData = {
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        deskripsi: formData.deskripsi || null,
        total_masuk: totalMasuk,
        total_keluar: totalKeluar,
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/keuangan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error("Gagal menambahkan data. " + (errorData.message || ""));
        return false;
      }
      toast.success("Data keuangan berhasil ditambahkan.");

      return true;
    } catch (error) {
      console.error("Error saat menambah data:", error);
      toast.error("Terjadi kesalahan saat menambahkan data");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "total_masuk" || name === "total_keluar") {
      // Remove all non-digit characters from the input
      const numericValue = value.replace(/[^\d]/g, "");
      const formattedValue = numericValue
        ? `Rp ${numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
        : "";

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddNew = () => {
    setFormData({
      tanggal: "",
      jenis: "",
      deskripsi: "",
      total_masuk: "",
      total_keluar: "",
    });
    setTransactionType("pemasukan"); // Default to pemasukan when opening the modal
    setIsAddModalOpen(true);
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    // Clear the opposite field when switching types
    if (type === "pemasukan") {
      setFormData((prev) => ({
        ...prev,
        total_keluar: "",
        jenis: "", // Reset jenis when switching types
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        total_masuk: "",
        jenis: "", // Reset jenis when switching types
      }));
    }
  };

  const handleFormSubmit = async () => {
    // Validate form data
    if (!formData.tanggal || !formData.jenis) {
      toast.error("Tanggal dan jenis wajib diisi");
      return;
    }

    // Check if the appropriate amount field is filled based on transaction type
    if (
      transactionType === "pemasukan" &&
      (!formData.total_masuk || formData.total_masuk === "Rp 0")
    ) {
      toast.error("Total masuk harus diisi");
      return;
    }

    if (
      transactionType === "pengeluaran" &&
      (!formData.total_keluar || formData.total_keluar === "Rp 0")
    ) {
      toast.error("Total keluar harus diisi");
      return;
    }

    try {
      const success = await createData(formData);
      if (success) {
        await fetchData();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error("Gagal submit form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDetails = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  // Add handleEditorChange function
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      deskripsi: content
    }));
  };

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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <BreadcrumbPage>Keuangan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Konten Dashboard */}

        <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 px-4">
            {/* Saldo Dompet Card (kompak) */}
            <div className="bg-white shadow-sm rounded-lg border-l-4 border-l-blue-500 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Saldo Dompet
                  </p>
                  <h3 className="text-lg font-bold text-blue-600">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatCurrency(
                        data.reduce(
                          (total, item) =>
                            total +
                            ((item.total_masuk || 0) -
                              (item.total_keluar || 0)),
                          0
                        )
                      )
                    )}
                  </h3>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Dana Masuk Card (kompak) */}
            <div className="bg-white shadow-sm rounded-lg border-l-4 border-l-green-500 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Dana Masuk
                  </p>
                  <h3 className="text-lg font-bold text-green-600">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatCurrency(
                        data.reduce(
                          (total, item) => total + (item.total_masuk || 0),
                          0
                        )
                      )
                    )}
                  </h3>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Dana Keluar Card (kompak) */}
            <div className="bg-white shadow-sm rounded-lg border-l-4 border-l-red-500 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Dana Keluar
                  </p>
                  <h3 className="text-lg font-bold text-red-600">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatCurrency(
                        data.reduce(
                          (total, item) => total + (item.total_keluar || 0),
                          0
                        )
                      )
                    )}
                  </h3>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Keuangan</CardTitle>
                    <CardDescription>Kelola data keuangan</CardDescription>
                  </div>
                  <Button
                    onClick={handleAddNew}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Tambah Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter tanggal */}
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setFilterDate("");
                      }}
                    >
                      <option value="semua">Semua</option>
                      <option value="mingguan">Perminggu</option>
                      <option value="bulanan">Perbulan</option>
                      <option value="tahunan">Pertahun</option>
                    </select>
                  </div>

                  <div>
                    {filterType === "tahunan" ? (
                      <Input
                        type="number"
                        placeholder="Contoh: 2025"
                        className="text-sm"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    ) : filterType !== "all" ? (
                      <Input
                        type="date"
                        className="text-sm"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {filterType !== "semua" && filterDate !== "" && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleCetak(filterType, filterDate)}
                      disabled={filterType === "semua" || filterDate === ""}
                    >
                      Cetak PDF
                    </Button>
                  )}
                </div>

                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data keuangan..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Keuangan dengan komponen Tabel */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        {/* <TableHead className="w-12 font-medium">ID</TableHead> */}
                        <TableHead className="font-medium">Tanggal</TableHead>
                        <TableHead className="font-medium">Jenis</TableHead>
                        <TableHead className="font-medium">
                          Total Masuk
                        </TableHead>
                        <TableHead className="font-medium">
                          Total Keluar
                        </TableHead>
                        <TableHead className="font-medium">Dompet</TableHead>
                        <TableHead className="font-medium">Deskripsi</TableHead>
                        <TableHead className="text-right font-medium">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : computedItems.length > 0 ? (
                        computedItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            {/* <TableCell className="font-medium">{item.id}</TableCell> */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {item.tanggal}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                                {item.jenis}
                              </span>
                            </TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {item.total_masuk > 0
                                ? formatCurrency(item.total_masuk)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-red-600 font-medium">
                              {item.total_keluar > 0
                                ? formatCurrency(item.total_keluar)
                                : "-"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.dompet)}
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={item.deskripsi}
                            >
                              {item.deskripsi ? (
                                <div dangerouslySetInnerHTML={{
                                  __html: item.deskripsi
                                    .replace(/<\/?p>/g, '')
                                    .replace(/<\/?strong>/g, '<b>')
                                    .replace(/<\/?em>/g, '<i>')
                                    .replace(/<\/?u>/g, '<u>')
                                }} />
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDetails(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-6 text-gray-500"
                          >
                            Tidak ada data keuangan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>

              <CardFooter>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center w-full gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paginate(currentPage > 1 ? currentPage - 1 : 1)
                      }
                      disabled={currentPage === 1}
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
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paginate(
                          currentPage < totalPages
                            ? currentPage + 1
                            : totalPages
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Dialog Detail Keuangan */}
            <Dialog
              open={isDetailModalOpen}
              onOpenChange={setIsDetailModalOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detail Keuangan</DialogTitle>
                  <DialogDescription>
                    Informasi lengkap data keuangan.
                  </DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-3 text-sm py-2">
                    <Separator />
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">ID:</span>
                      <span className="col-span-2">{detailItem.id}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Tanggal:</span>
                      <span className="col-span-2">{detailItem.tanggal}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Jenis:</span>
                      <span className="col-span-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                          {detailItem.jenis}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Total Masuk:</span>
                      <span className="col-span-2 text-green-600 font-medium">
                        {detailItem.total_masuk > 0
                          ? formatCurrency(detailItem.total_masuk)
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Total Keluar:</span>
                      <span className="col-span-2 text-red-600 font-medium">
                        {detailItem.total_keluar > 0
                          ? formatCurrency(detailItem.total_keluar)
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Dompet:</span>
                      <span className="col-span-2 font-medium">
                        {formatCurrency(detailItem.dompet)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                      <span className="font-semibold">Deskripsi:</span>
                      <span className="col-span-2">
                        {detailItem.deskripsi ? (
                          <div dangerouslySetInnerHTML={{
                            __html: detailItem.deskripsi
                              .replace(/<\/?p>/g, '')
                              .replace(/<\/?strong>/g, '<b>')
                              .replace(/<\/?em>/g, '<i>')
                              .replace(/<\/?u>/g, '<u>')
                          }} />
                        ) : "-"}
                      </span>
                    </div>
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

            {/* Add Modal with Transaction Type Tabs */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Data Keuangan</DialogTitle>
                  <DialogDescription>
                    Isi detail untuk menambah data keuangan baru.
                  </DialogDescription>
                </DialogHeader>

                {/* Transaction Type Tabs */}
                <div className="flex justify-center space-x-4 mb-4">
                  <div
                    className={`flex items-center justify-center gap-2 p-2 cursor-pointer rounded-full w-32 transition-colors ${transactionType === "pemasukan"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                      }`}
                    onClick={() => handleTransactionTypeChange("pemasukan")}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${transactionType === "pemasukan"
                          ? "bg-white shadow-sm"
                          : "bg-gray-200"
                        }`}
                    >
                      <ArrowUpCircle
                        className={`h-4 w-4 ${transactionType === "pemasukan"
                            ? "text-blue-600"
                            : "text-gray-500"
                          }`}
                      />
                    </div>
                    <span className="text-sm font-medium">Pemasukan</span>
                  </div>

                  <div
                    className={`flex items-center justify-center gap-2 p-2 cursor-pointer rounded-full w-32 transition-colors ${transactionType === "pengeluaran"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                      }`}
                    onClick={() => handleTransactionTypeChange("pengeluaran")}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${transactionType === "pengeluaran"
                          ? "bg-white shadow-sm"
                          : "bg-gray-200"
                        }`}
                    >
                      <ArrowDownCircle
                        className={`h-4 w-4 ${transactionType === "pengeluaran"
                            ? "text-red-600"
                            : "text-gray-500"
                          }`}
                      />
                    </div>
                    <span className="text-sm font-medium">Pengeluaran</span>
                  </div>
                </div>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tanggal">
                      Tanggal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tanggal"
                      name="tanggal"
                      type="date"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      placeholder="dd/mm/yyyy"
                      className="placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenis">
                      Jenis <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="jenis"
                      name="jenis"
                      value={formData.jenis || ""}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      disabled={isLoading}
                      required
                    >
                      <option value="">Pilih jenis</option>
                      {transactionType === "pemasukan" ? (
                        <>
                          <option value="infaq">Infaq</option>
                          <option value="sedekah">Sedekah</option>
                          <option value="donasi">Donasi</option>
                          <option value="zakat">Zakat</option>
                          <option value="wakaf">Wakaf</option>
                          <option value="reservasi">Reservasi</option>
                        </>
                      ) : (
                        <>
                          <option value="dana kegiatan">Dana Kegiatan</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Show only the relevant input field based on transaction type */}
                  {transactionType === "pemasukan" && (
                    <div className="grid gap-2">
                      <Label htmlFor="total_masuk">
                        Pemasukan <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="total_masuk"
                        name="total_masuk"
                        value={formData.total_masuk || ""}
                        onChange={handleInputChange}
                        placeholder="Rp 0"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {transactionType === "pengeluaran" && (
                    <div className="grid gap-2">
                      <Label htmlFor="total_keluar">
                        Pengeluaran <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="total_keluar"
                        name="total_keluar"
                        value={formData.total_keluar || ""}
                        onChange={handleInputChange}
                        placeholder="Rp 0"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    disabled={
                      isLoading ||
                      !formData.tanggal ||
                      !formData.jenis ||
                      (transactionType === "pemasukan" &&
                        (!formData.total_masuk ||
                          formData.total_masuk === "Rp 0")) ||
                      (transactionType === "pengeluaran" &&
                        (!formData.total_keluar ||
                          formData.total_keluar === "Rp 0"))
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      "Tambah Data"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
