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
  // Initial Facilities Data
  const initialData = [
    {
      id: 1,
      name: "Ruang Rapat A101",
      description: "Ruang rapat kapasitas 10 orang dengan proyektor dan AC",
      status: "Active",
      location: "Lantai 1, Gedung A"
    },
    {
      id: 2,
      name: "Aula Utama",
      description: "Aula dengan kapasitas 100 orang, sound system, dan pendingin ruangan",
      status: "Active",
      location: "Lantai Dasar, Gedung B"
    },
    {
      id: 3,
      name: "Lab Komputer",
      description: "Laboratorium dengan 30 unit komputer dan internet",
      status: "Maintenance",
      location: "Lantai 2, Gedung C"
    },
    {
      id: 4,
      name: "Ruang Perpustakaan",
      description: "Perpustakaan dengan koleksi buku dan area baca",
      status: "Active",
      location: "Lantai 3, Gedung A"
    },
    {
      id: 5,
      name: "Kantin",
      description: "Area makan dengan 20 meja dan dapur",
      status: "Active",
      location: "Lantai Dasar, Gedung D"
    },
    {
      id: 6,
      name: "Ruang Olahraga",
      description: "Ruang indoor untuk kegiatan olahraga dan senam",
      status: "Inactive",
      location: "Lantai 1, Gedung E"
    },
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
    name: "", 
    description: "", 
    status: "", 
    location: "" 
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddNew = () => {
    setFormData({ name: "", description: "", status: "", location: "" })
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
  
  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
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
                  <BreadcrumbPage>Fasilitas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen font-sans">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Fasilitas</CardTitle>
                    <CardDescription>Kelola data fasilitas dan aset</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Fasilitas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari data fasilitas..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Facilities Table */}
                <div className="rounded-md border shadow-sm overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b grid grid-cols-12 text-xs font-medium text-gray-500 uppercase">
                    <div className="px-4 py-3 col-span-1 text-center">ID</div>
                    <div className="px-4 py-3 col-span-3">Nama Fasilitas</div>
                    <div className="px-4 py-3 col-span-4">Keterangan</div>
                    <div className="px-4 py-3 col-span-2">Status</div>
                    <div className="px-4 py-3 col-span-2 text-right">Aksi</div>
                  </div>

                  {/* Table Content */}
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 border-b text-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="px-4 py-3 col-span-1 text-center font-medium text-gray-700">{item.id}</div>
                        <div className="px-4 py-3 col-span-3 font-medium">{item.name}</div>
                        <div className="px-4 py-3 col-span-4 text-gray-600 truncate">{item.description}</div>
                        <div className="px-4 py-3 col-span-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="px-4 py-3 col-span-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDetails(item)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => handleDeleteClick(item)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p className="font-medium">Tidak ada data fasilitas</p>
                      <p className="text-sm mt-1">Tambahkan fasilitas baru atau ubah kata kunci pencarian</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-2">
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

            {/* Detail Facility Dialog */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Detail Fasilitas</DialogTitle>
                  <DialogDescription>Informasi lengkap fasilitas.</DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-3 text-sm py-2">
                    <Separator />
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">ID:</p>
                      <p className="col-span-2">{detailItem.id}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Nama:</p>
                      <p className="col-span-2">{detailItem.name}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Deskripsi:</p>
                      <p className="col-span-2">{detailItem.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Status:</p>
                      <p className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(detailItem.status)}`}>
                          {detailItem.status}
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="font-medium text-gray-500">Lokasi:</p>
                      <p className="col-span-2">{detailItem.location}</p>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add/Edit Facility Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Perbarui detail fasilitas di bawah ini." : "Isi detail untuk fasilitas baru."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Fasilitas</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama fasilitas"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Keterangan</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Masukkan keterangan"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Pilih status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Masukkan lokasi fasilitas"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                  <Button onClick={handleFormSubmit}>{isEditing ? "Simpan Perubahan" : "Tambah Fasilitas"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen fasilitas
                    {selectedItem && ` "${selectedItem.name}"`} dari database.
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