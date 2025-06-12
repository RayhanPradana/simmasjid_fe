import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


export async function handleCetak(filterType, filterDate) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token tidak ditemukan. Silakan login ulang.");
    return;
  }

  try {
    const params = new URLSearchParams({ filterType, filterDate });
    const res = await fetch(
      `${apiUrl}/api/keuangan-laporan?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Gagal mengambil data");

    const json = await res.json();
    const data = json.data;

    // jenis laporan
    const filterTypeLabels = {
      semua: "Semua",
      mingguan: "Mingguan",
      bulanan: "Bulanan",
      tahunan: "Tahunan",
      tanggal: "Tanggal",
      bulan: "Bulan",
      tahun: "Tahun",
    };
    const jenisLaporan = filterTypeLabels[filterType] || filterType || "Semua";

    // Hitung total masuk, keluar, dan sisa saldo
    const totalMasuk = data.reduce(
      (total, item) => total + (item.total_masuk || 0),
      0
    );
    const totalKeluar = data.reduce(
      (total, item) => total + (item.total_keluar || 0),
      0
    );
    const saldo = totalMasuk - totalKeluar;

    // Format Periode berdasarkan jenis filter
    let periodeText = "";
    if (filterType === "mingguan") {
      const startDate = new Date(filterDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const options = { day: "2-digit", month: "long", year: "numeric" };
      periodeText = `Periode: ${startDate.toLocaleDateString(
        "id-ID",
        options
      )} s/d ${endDate.toLocaleDateString("id-ID", options)}`;
    } else if (filterType === "bulanan") {
      const [year, month] = filterDate.split("-");
      const monthName = new Date(year, month - 1).toLocaleDateString("id-ID", {
        month: "long",
      });
      periodeText = `Periode: ${monthName} ${year}`;
    } else if (filterType === "tahunan") {
      periodeText = `Periode: Tahun ${filterDate}`;
    } else {
      periodeText = `Periode: ${filterDate}`;
    }

    // dokumen PDF
    const doc = new jsPDF();

    // cetak
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(14);
    doc.text("Laporan Keuangan", 14, 15);
    doc.setFontSize(10);
    doc.text(`Jenis Laporan: ${jenisLaporan}`, 14, 22);
    doc.text(periodeText, 14, 28);
    doc.text(`Tanggal Cetak: ${tanggalCetak}`, 14, 34);

    // total
    doc.setFontSize(11);
    doc.text(
      `Total Uang Masuk: Rp ${totalMasuk.toLocaleString("id-ID")}`,
      14,
      44
    );
    doc.text(
      `Total Uang Keluar: Rp ${totalKeluar.toLocaleString("id-ID")}`,
      14,
      50
    );
    doc.text(`Saldo: Rp ${saldo.toLocaleString("id-ID")}`, 14, 56);

    let runningSaldo = 0;

// Urutkan data berdasarkan id ASC
const sortedData = data.sort((a, b) => a.id - b.id);

const bodyData = sortedData.map((item) => {
  const masuk = item.total_masuk || 0;
  const keluar = item.total_keluar || 0;

  runningSaldo += masuk - keluar;

  return [
    item.tanggal,
    item.jenis,
    masuk > 0 ? `Rp ${masuk.toLocaleString("id-ID")}` : "-",
    keluar > 0 ? `Rp ${keluar.toLocaleString("id-ID")}` : "-",
    `Rp ${runningSaldo.toLocaleString("id-ID")}`, // DOMPET = SALDO BERJALAN
    item.deskripsi ?? "-",
  ];
});


    autoTable(doc, {
      startY: 65,
      head: [
        [
          "Tanggal",
          "Jenis",
          "Uang Masuk",
          "Uang Keluar",
          "Dompet",
          "Deskripsi",
        ],
      ],
      body: bodyData,
    });

    doc.save(`laporan-keuangan-${filterType}-${filterDate}.pdf`);
  } catch (error) {
    console.error(error);
    alert("Gagal mencetak laporan");
  }
}
