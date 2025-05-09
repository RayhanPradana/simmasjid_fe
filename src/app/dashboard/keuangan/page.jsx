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
  ArrowUpCircle,
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Page() {
  const initialData = [
    {
      id: 1,
      tanggal: "05/05/2025",
      jenis: "Pemasukan",
      jumlah: "Rp 5.000.000",
      sumber: "Penjualan",
      deskripsi: "Penjualan produk A"
    },
    {
      id: 2,
      tanggal: "02/05/2025",
      jenis: "Pengeluaran",
      jumlah: "Rp 1.500.000",
      sumber: "Operasional",
      deskripsi: "Biaya listrik dan air"
    },
    {
      id: 3,
      tanggal: "30/04/2025",
      jenis: "Pemasukan",
      jumlah: "Rp 3.250.000",
      sumber: "Penjualan",
      deskripsi: "Penjualan produk B"
    },
    {
      id: 4,
      tanggal: "28/04/2025",
      jenis: "Pengeluaran",
      jumlah: "Rp 2.750.000",
      sumber: "Gaji",
      deskripsi: "Pembayaran gaji karyawan"
    },
    {
      id: 5,
      tanggal: "25/04/2025",
      jenis: "Pemasukan",
      jumlah: "Rp 4.500.000",
      sumber: "Investasi",
      deskripsi: "Return investasi bulanan"
    },
    {
      id: 6,
      tanggal: "20/04/2025",
      jenis: "Pengeluaran",
      jumlah: "Rp 850.000",
      sumber: "Peralatan",
      deskripsi: "Pembelian peralatan kantor"
    }
  ]

  const [data, setData] = useState(initialData)
  const [filteredData, setFilteredData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    tanggal: "",
    jenis: "",
    jumlah: "",
    sumber: "",
    deskripsi: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const filtered = data.filter(item => 
      (item.tanggal && item.tanggal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.jenis && item.jenis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.jumlah && item.jumlah.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sumber && item.sumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddNew = () => {
    setFormData({
      tanggal: "",
      jenis: "",
      jumlah: "",
      sumber: "",
      deskripsi: ""
    })
    setIsEditing(false)
    setIsAddModalOpen(true)
  }

  const handleEdit = (item) => {
    setFormData(item)
    setIsEditing(true)
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = () => {
    if (isEditing) {
      setData(data.map(d => (d.id === formData.id ? formData : d)))
    } else {
      const newItem = { ...formData, id: Date.now() }
      setData([...data, newItem])
    }
    setIsAddModalOpen(false)
  }

  const handleDelete = () => {
    setData(data.filter(d => d.id !== selectedItem.id))
    setIsDeleteModalOpen(false)
  }

  const handleDetails = (item) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0"
    if (typeof amount === 'string' && amount.startsWith('Rp')) {
      return amount
    }
    return `Rp ${amount.toLocaleString('id-ID')}`
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
                  <BreadcrumbPage>Keuangan</BreadcrumbPage>
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
                    <CardTitle>Keuangan</CardTitle>
                    <CardDescription>Kelola data keuangan</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Transaksi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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

                {/* Tabel Keuangan dengan komponen Table */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-12 font-medium">ID</TableHead>
                        <TableHead className="font-medium">Tanggal</TableHead>
                        <TableHead className="font-medium">Jenis</TableHead>
                        <TableHead className="font-medium">Jumlah</TableHead>
                        <TableHead className="font-medium">Sumber</TableHead>
                        <TableHead className="font-medium">Deskripsi</TableHead>
                        <TableHead className="text-right font-medium">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {item.tanggal}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  item.jenis === "Pemasukan"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.jenis === "Pemasukan" ? (
                                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownCircle className="h-3 w-3 mr-1" />
                                )}
                                {item.jenis}
                              </span>
                            </TableCell>
                            <TableCell className={item.jenis === "Pemasukan" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {item.jumlah}
                            </TableCell>
                            <TableCell>{item.sumber}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={item.deskripsi}>
                              {item.deskripsi}
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
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteClick(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-gray-500">
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
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
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
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Dialog Detail Keuangan */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detail Transaksi</DialogTitle>
                  <DialogDescription>Informasi lengkap transaksi keuangan.</DialogDescription>
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
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            detailItem.jenis === "Pemasukan"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {detailItem.jenis === "Pemasukan" ? (
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3 mr-1" />
                          )}
                          {detailItem.jenis}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Jumlah:</span>
                      <span className={`col-span-2 ${detailItem.jenis === "Pemasukan" ? "text-green-600 font-medium" : "text-red-600 font-medium"}`}>
                        {detailItem.jumlah}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="font-semibold">Sumber:</span>
                      <span className="col-span-2">{detailItem.sumber}</span>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                      <span className="font-semibold">Deskripsi:</span>
                      <span className="col-span-2">{detailItem.deskripsi}</span>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Ubah data transaksi di bawah ini." : "Isi detail untuk transaksi baru."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tanggal">Tanggal</Label>
                    <Input
                      id="tanggal"
                      name="tanggal"
                      type="text"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenis">Jenis</Label>
                    <select
                      id="jenis"
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih jenis</option>
                      <option value="Pemasukan">Pemasukan</option>
                      <option value="Pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jumlah">Jumlah</Label>
                    <Input
                      id="jumlah"
                      name="jumlah"
                      value={formData.jumlah}
                      onChange={handleInputChange}
                      placeholder="Rp 0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sumber">Sumber</Label>
                    <select
                      id="sumber"
                      name="sumber"
                      value={formData.sumber}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih sumber</option>
                      <option value="Penjualan">Penjualan</option>
                      <option value="Investasi">Investasi</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Gaji">Gaji</option>
                      <option value="Peralatan">Peralatan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Input
                      id="deskripsi"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      placeholder="Masukkan deskripsi"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                  <Button onClick={handleFormSubmit}>{isEditing ? "Simpan Perubahan" : "Tambah Transaksi"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Penghapusan akan menghilangkan data transaksi
                    {selectedItem && ` dengan ID: ${selectedItem.id}`} secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
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