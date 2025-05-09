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

export default function Page() {
  const initialData = [
    {
      id: "RES-001",
      facilityName: "Aula Utama",
      renter: "Ahmad Fauzi",
      startDate: "2025-05-10",
      endDate: "2025-05-10",
      startTime: "08:00",
      endTime: "16:00",
      status: "Approved"
    },
    {
      id: "RES-002",
      facilityName: "Ruang Rapat A",
      renter: "Da Simon",
      startDate: "2025-05-12",
      endDate: "2025-05-12",
      startTime: "09:00",
      endTime: "12:00",
      status: "Pending"
    },
    {
      id: "RES-003",
      facilityName: "Lapangan Futsal",
      renter: "Budi Santoso",
      startDate: "2025-05-15",
      endDate: "2025-05-15",
      startTime: "18:00",
      endTime: "20:00",
      status: "Approved"
    },
    {
      id: "RES-004",
      facilityName: "Ruang Seminar",
      renter: "Dewi Lestari",
      startDate: "2025-05-20",
      endDate: "2025-05-21",
      startTime: "10:00",
      endTime: "15:00",
      status: "Rejected"
    },
    {
      id: "RES-005",
      facilityName: "Kolam Renang",
      renter: "Eko Prasetyo",
      startDate: "2025-05-18",
      endDate: "2025-05-18",
      startTime: "14:00",
      endTime: "17:00",
      status: "Pending"
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
    facilityName: "", 
    renter: "", 
    startDate: "", 
    endDate: "", 
    startTime: "", 
    endTime: "", 
    status: "" 
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const filtered = data.filter(item =>
      item.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.renter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
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
      facilityName: "", 
      renter: "", 
      startDate: "", 
      endDate: "", 
      startTime: "", 
      endTime: "", 
      status: "Pending" 
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
      const newId = `RES-${String(data.length + 1).padStart(3, '0')}`
      const newItem = { ...formData, id: newId }
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
                    <div className="px-4 py-3 col-span-2">Nama Fasilitas</div>
                    <div className="px-4 py-3 col-span-2">Penyewa</div>
                    <div className="px-4 py-3 col-span-1">Tanggal Mulai</div>
                    <div className="px-4 py-3 col-span-1">Tanggal Selesai</div>
                    <div className="px-4 py-3 col-span-1">Waktu Mulai</div>
                    <div className="px-4 py-3 col-span-1">Waktu Selesai</div>
                    <div className="px-4 py-3 col-span-1">Status</div>
                    <div className="px-4 py-3 col-span-1 text-right">Aksi</div>
                  </div>

                  {/* Isi Tabel */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-11 border-b text-sm hover:bg-gray-50"
                        >
                          <div className="px-4 py-3 col-span-1">{item.id}</div>
                          <div className="px-4 py-3 col-span-2">{item.facilityName}</div>
                          <div className="px-4 py-3 col-span-2">{item.renter}</div>
                          <div className="px-4 py-3 col-span-1">{item.startDate}</div>
                          <div className="px-4 py-3 col-span-1">{item.endDate}</div>
                          <div className="px-4 py-3 col-span-1">{item.startTime}</div>
                          <div className="px-4 py-3 col-span-1">{item.endTime}</div>
                          <div className="px-4 py-3 col-span-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.status === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status}
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
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 col-span-11">
                        Tidak ada data reservasi
                      </div>
                    )}
                  </div>
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

            {/* Dialog Detail Reservasi */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detail Reservasi</DialogTitle>
                  <DialogDescription>Informasi lengkap reservasi fasilitas.</DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-3 text-sm py-2">
                    <Separator />
                    <p><strong>ID Reservasi:</strong> {detailItem.id}</p>
                    <p><strong>Nama Fasilitas:</strong> {detailItem.facilityName}</p>
                    <p><strong>Penyewa:</strong> {detailItem.renter}</p>
                    <p><strong>Tanggal Mulai:</strong> {detailItem.startDate}</p>
                    <p><strong>Tanggal Selesai:</strong> {detailItem.endDate}</p>
                    <p><strong>Waktu Mulai:</strong> {detailItem.startTime}</p>
                    <p><strong>Waktu Selesai:</strong> {detailItem.endTime}</p>
                    <p><strong>Status:</strong> 
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          detailItem.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : detailItem.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {detailItem.status}
                      </span>
                    </p>
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
                  <DialogTitle>{isEditing ? "Edit Reservasi" : "Tambah Reservasi Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Perbarui detail reservasi fasilitas." : "Isi detail untuk reservasi fasilitas baru."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facilityName">Nama Fasilitas</Label>
                    <Input
                      id="facilityName"
                      name="facilityName"
                      value={formData.facilityName}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama fasilitas"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="renter">Penyewa</Label>
                    <Input
                      id="renter"
                      name="renter"
                      value={formData.renter}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama penyewa"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Tanggal Mulai</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">Tanggal Selesai</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Waktu Mulai</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">Waktu Selesai</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                  <Button onClick={handleFormSubmit}>{isEditing ? "Simpan Perubahan" : "Tambah Reservasi"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Reservasi dengan ID
                    {selectedItem && ` "${selectedItem.id}"`} akan dihapus permanen dari database.
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