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
  Image as ImageIcon,
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
      id: 1,
      date: "2025-05-01",
      title: "Pembukaan Balai Desa Baru di Kecamatan Sukamaju",
      content: "Pemerintah Kabupaten meresmikan pembukaan balai desa baru yang akan menjadi pusat kegiatan warga...",
      image: "balai-desa.jpg",
      status: "published"
    },
    {
      id: 2,
      date: "2025-04-28",
      title: "Program Vaksinasi COVID-19 Booster Diluncurkan",
      content: "Dinas Kesehatan mengumumkan peluncuran program vaksinasi booster COVID-19 untuk seluruh masyarakat...",
      image: "vaksinasi.jpg",
      status: "published"
    },
    {
      id: 3,
      date: "2025-04-20",
      title: "Festival Budaya Tahunan Akan Digelar Bulan Depan",
      content: "Festival budaya tahunan akan kembali digelar setelah vakum selama dua tahun akibat pandemi...",
      image: "festival.jpg",
      status: "draft"
    },
    {
      id: 4,
      date: "2025-04-15",
      title: "Pembangunan Jalan Tol Ruas Timur Dimulai",
      content: "Proyek pembangunan jalan tol yang akan menghubungkan wilayah timur kabupaten resmi dimulai...",
      image: "jalan-tol.jpg",
      status: "published"
    },
    {
      id: 5,
      date: "2025-04-10",
      title: "Pelatihan Digital Marketing untuk UMKM",
      content: "Dinas Koperasi dan UMKM mengadakan pelatihan digital marketing untuk membantu pelaku usaha mikro...",
      image: "pelatihan.jpg",
      status: "draft"
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
    title: "", 
    content: "", 
    date: "", 
    image: "", 
    status: "" 
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const filtered = data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      title: "", 
      content: "", 
      date: new Date().toISOString().split('T')[0], 
      image: "", 
      status: "draft" 
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Helper function to generate placeholder image based on filename
  const getImagePlaceholder = (filename) => {
    // Generate a consistent but unique color based on the filename
    const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 80%)`;
    
    return { backgroundColor: color, filename: filename };
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
                  <BreadcrumbPage>Berita</BreadcrumbPage>
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
                    <CardTitle>Berita</CardTitle>
                    <CardDescription>Kelola data berita</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Tambah Berita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pencarian */}
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari berita..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Berita dengan gambar */}
                <div className="rounded-md border overflow-hidden">
                  {/* Header Tabel */}
                  <div className="bg-gray-50 border-b grid grid-cols-12 text-xs font-medium text-gray-500 uppercase">
                    <div className="px-4 py-3 col-span-1">ID</div>
                    <div className="px-4 py-3 col-span-1">Gambar</div>
                    <div className="px-4 py-3 col-span-2">Tanggal</div>
                    <div className="px-4 py-3 col-span-3">Judul</div>
                    <div className="px-4 py-3 col-span-2">Konten</div>
                    <div className="px-4 py-3 col-span-1">Status</div>
                    <div className="px-4 py-3 col-span-2 text-right">Aksi</div>
                  </div>

                  {/* Isi Tabel */}
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => {
                      const imgPlaceholder = getImagePlaceholder(item.image);
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 border-b hover:bg-gray-50 text-sm items-center"
                        >
                          <div className="px-4 py-3 col-span-1 flex items-center">{item.id}</div>
                          <div className="px-2 py-2 col-span-1">
                            <div 
                              className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center text-xs text-gray-600"
                              style={{ backgroundColor: imgPlaceholder.backgroundColor }}
                              title={item.image}
                            >
                              <img src={`/api/placeholder/48/48`} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="px-4 py-3 col-span-2">{formatDate(item.date)}</div>
                          <div className="px-4 py-3 col-span-3 font-medium">{truncateText(item.title, 35)}</div>
                          <div className="px-4 py-3 col-span-2 text-gray-600">{truncateText(item.content, 35)}</div>
                          <div className="px-4 py-3 col-span-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                item.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.status === "published" ? "Publikasi" : "Draft"}
                            </span>
                          </div>
                          <div className="px-4 py-3 col-span-2 text-right">
                            <div className="flex justify-end gap-2">
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
                                title="Edit Berita"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                                onClick={() => handleDeleteClick(item)}
                                title="Hapus Berita"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-500 col-span-12">
                      Tidak ada berita ditemukan
                    </div>
                  )}
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

            {/* Dialog Detail Berita */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Detail Berita</DialogTitle>
                  <DialogDescription>Informasi lengkap berita.</DialogDescription>
                </DialogHeader>
                {detailItem && (
                  <div className="grid gap-4 py-2">
                    <Separator />
                    <div className="space-y-1">
                      <h3 className="font-semibold">{detailItem.title}</h3>
                      <p className="text-sm text-gray-500">{formatDate(detailItem.date)}</p>
                    </div>
                    
                    <div className="bg-gray-100 border rounded-md p-4 flex items-center justify-center h-48">
                      {detailItem.image && (
                        <div 
                          className="w-full h-full rounded-md overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: getImagePlaceholder(detailItem.image).backgroundColor }}
                        >
                          <img src={`/api/placeholder/300/200`} alt={detailItem.title} className="max-w-full max-h-full object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Konten Berita:</h4>
                      <p className="text-sm">{detailItem.content}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">Status: </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            detailItem.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {detailItem.status === "published" ? "Publikasi" : "Draft"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">ID: {detailItem.id}</span>
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
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Berita" : "Tambah Berita Baru"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Perbarui informasi berita di bawah ini." : "Isi detail berita baru Anda."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Judul Berita</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan judul berita"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Konten Berita</Label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Masukkan konten berita"
                      className="min-h-[120px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">Gambar</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="Nama file gambar"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" /> Pilih
                      </Button>
                    </div>
                    {formData.image && (
                      <div className="mt-2 p-2 border rounded-md flex items-center justify-center h-24">
                        <div 
                          className="w-20 h-20 rounded overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: getImagePlaceholder(formData.image).backgroundColor }}
                        >
                          <img src={`/api/placeholder/80/80`} alt="Preview" className="max-w-full max-h-full object-cover" />
                        </div>
                      </div>
                    )}
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
                      <option value="draft">Draft</option>
                      <option value="published">Publikasi</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                  <Button onClick={handleFormSubmit}>{isEditing ? "Simpan Perubahan" : "Tambah Berita"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Berita
                    {selectedItem && ` "${truncateText(selectedItem.title, 30)}"`} akan dihapus secara permanen dari database.
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