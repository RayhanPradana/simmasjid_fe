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
  CalendarCheck2,
  CreditCard,
  Newspaper,
  Users,
  Building2,
  ArrowDownCircle,
  Eye,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  // Sample data untuk kegiatan
  const initialData = [
    { 
      id: 1, 
      namaKegiatan: "Rapat Anggaran Tahunan", 
      hari: "Senin", 
      waktu: "09:00-11:00", 
      tempat: "Ruang Rapat A", 
      penanggungJawab: "Ahmad Fauzi", 
      keterangan: "Rapat pembahasan anggaran tahunan divisi keuangan" 
    },
    { 
      id: 2, 
      namaKegiatan: "Workshop Laporan Keuangan", 
      hari: "Selasa", 
      waktu: "13:00-16:00", 
      tempat: "Aula Utama", 
      penanggungJawab: "Dewi Lestari", 
      keterangan: "Workshop penyusunan laporan keuangan tahunan" 
    },
    { 
      id: 3, 
      namaKegiatan: "Audit Internal", 
      hari: "Rabu", 
      waktu: "10:00-12:00", 
      tempat: "Ruang Audit", 
      penanggungJawab: "Budi Santoso", 
      keterangan: "Audit internal divisi keuangan triwulan II" 
    },
    { 
      id: 4, 
      namaKegiatan: "Sosialisasi Anggaran 2025", 
      hari: "Kamis", 
      waktu: "09:30-11:30", 
      tempat: "Ruang Meeting B", 
      penanggungJawab: "Siti Aminah", 
      keterangan: "Sosialisasi anggaran tahun 2025 untuk seluruh divisi" 
    },
    { 
      id: 5, 
      namaKegiatan: "Evaluasi Kinerja Keuangan", 
      hari: "Jumat", 
      waktu: "14:00-16:00", 
      tempat: "Ruang Diskusi", 
      penanggungJawab: "Eko Prasetyo", 
      keterangan: "Evaluasi kinerja keuangan bulanan" 
    },
  ]

  const [data, setData] = useState(initialData)
  const [filteredData, setFilteredData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    namaKegiatan: "",
    hari: "",
    waktu: "",
    tempat: "",
    penanggungJawab: "",
    keterangan: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Handle search
  useEffect(() => {
    const filtered = data.filter(item => 
      item.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hari.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tempat.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, data])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Open add modal
  const handleAddNew = () => {
    setFormData({
      namaKegiatan: "",
      hari: "",
      waktu: "",
      tempat: "",
      penanggungJawab: "",
      keterangan: ""
    })
    setIsEditing(false)
    setIsAddModalOpen(true)
  }

  // Open edit modal
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      namaKegiatan: item.namaKegiatan,
      hari: item.hari,
      waktu: item.waktu,
      tempat: item.tempat,
      penanggungJawab: item.penanggungJawab,
      keterangan: item.keterangan
    })
    setIsEditing(true)
    setIsAddModalOpen(true)
  }

  // Open delete modal
  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Handle detail view
  const handleDetails = (item) => {
    // Implementasi view detail bisa ditambahkan di sini
    console.log("View details for:", item)
  }

  // Handle form submit
  const handleFormSubmit = () => {
    if (isEditing) {
      // Update existing item
      const updatedData = data.map(item => 
        item.id === formData.id ? { ...formData } : item
      )
      setData(updatedData)
    } else {
      // Add new item
      const newItem = {
        id: data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1,
        ...formData
      }
      setData([...data, newItem])
    }
    setIsAddModalOpen(false)
  }

  // Handle delete
  const handleDelete = () => {
    const updatedData = data.filter(item => item.id !== selectedItem.id)
    setData(updatedData)
    setIsDeleteModalOpen(false)
  }

  // Pagination
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
                    <CardTitle>Kegiatan</CardTitle>
                    <CardDescription>Kelola data kegiatan</CardDescription>
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
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari jadwal kegiatan..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="rounded-md border overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Tabel */}
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">Nama Kegiatan</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Hari</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Waktu</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Tempat</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Penanggung Jawab</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Aksi</th>
                      </tr>
                    </thead>
                    {/* Body Tabel */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.namaKegiatan}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.hari}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.waktu}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.tempat}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.penanggungJawab}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.keterangan}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500">
                            Tidak ada data kegiatan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Perbarui detail kegiatan di bawah ini." : "Isi detail untuk kegiatan baru Anda."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                    <Input
                      id="namaKegiatan"
                      name="namaKegiatan"
                      value={formData.namaKegiatan}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama kegiatan"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hari">Hari</Label>
                    <select
                      id="hari"
                      name="hari"
                      value={formData.hari}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih hari</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                      <option value="Minggu">Minggu</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="waktu">Waktu</Label>
                    <Input
                      id="waktu"
                      name="waktu"
                      value={formData.waktu}
                      onChange={handleInputChange}
                      placeholder="Contoh: 09:00-12:00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tempat">Tempat</Label>
                    <Input
                      id="tempat"
                      name="tempat"
                      value={formData.tempat}
                      onChange={handleInputChange}
                      placeholder="Masukkan lokasi kegiatan"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="penanggungJawab">Penanggung Jawab</Label>
                    <Input
                      id="penanggungJawab"
                      name="penanggungJawab"
                      value={formData.penanggungJawab}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama penanggung jawab"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Input
                      id="keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      placeholder="Masukkan keterangan tambahan"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                  <Button onClick={handleFormSubmit}>{isEditing ? "Simpan Perubahan" : "Tambah Kegiatan"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kegiatan 
                    {selectedItem && ` "${selectedItem.namaKegiatan}"`} secara permanen dari database.
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