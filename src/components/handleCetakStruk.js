import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

export const handleCetakStruk = async (data) => {
  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    // Helper function to format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 10;

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMMASJID', pageWidth / 2, yPos, { align: 'center' });
    
    // Contact info
    yPos += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Contoh No. 123, Kota', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('Telp: (021) 1234-5678', pageWidth / 2, yPos, { align: 'center' });

    // Separator
    yPos += 6;
    doc.setLineWidth(0.5);
    doc.line(5, yPos, pageWidth - 5, yPos);

    // Payment Details
    yPos += 8;
    doc.setFontSize(10);
    const leftMargin = 5;
    const col2X = 35;

    // Add payment info function
    const addPaymentInfo = (label, value) => {
      doc.text(label, leftMargin, yPos);
      doc.text(':', col2X, yPos);
      doc.text(value.toString(), col2X + 5, yPos);
      yPos += 5;
    };

    // Add payment details
    addPaymentInfo('No. Transaksi', `#${data.id}`);
    addPaymentInfo('Tanggal', new Date(data.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    addPaymentInfo('Jenis Bayar', data.jenis?.toUpperCase() || '-');
    addPaymentInfo('Metode', data.metode_pembayaran || '-');
    addPaymentInfo('Jumlah', formatCurrency(data.jumlah_pembayaran || 0));
    addPaymentInfo('Status', data.status?.toUpperCase() || '-');

    // Add reservation info if available
    if (data.reservasi) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Detail Reservasi:', leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;

      addPaymentInfo('ID Reservasi', `#${data.reservasi_fasilitas_id}`);
      if (data.reservasi.tgl_reservasi) {
        addPaymentInfo('Tgl Reservasi', new Date(data.reservasi.tgl_reservasi).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      }
      if (data.reservasi.fasilitas?.nama_fasilitas) {
        addPaymentInfo('Fasilitas', data.reservasi.fasilitas.nama_fasilitas);
      }
      if (data.reservasi.acara?.nama_acara) {
        addPaymentInfo('Acara', data.reservasi.acara.nama_acara);
      }
    }

    // Add notes if available
    if (data.deskripsi) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Catatan:', leftMargin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      const splitDeskripsi = doc.splitTextToSize(data.deskripsi, pageWidth - 10);
      doc.text(splitDeskripsi, leftMargin, yPos);
      yPos += splitDeskripsi.length * 4;
    }

    // Add bukti transfer if available
    if (data.bukti_transfer) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Bukti Transfer:', leftMargin, yPos);
      yPos += 5;
      
      try {
        const img = new Image();
        const imageUrl = `http://127.0.0.1:8000/storage/${data.bukti_transfer}`;
        
        // Add credentials and CORS handling
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'include',
        });
        
        const blob = await response.blob();
        const imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // Create new image with data URL
        const imgElement = new Image();
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = reject;
          imgElement.src = imageDataUrl;
        });
        
        const imgWidth = pageWidth - 10;
        const imgHeight = (imgElement.height * imgWidth) / imgElement.width;
        
        doc.addImage(imageDataUrl, 'JPEG', leftMargin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
      } catch (error) {
        console.warn('Failed to load bukti transfer:', error);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('(Bukti transfer tidak dapat ditampilkan)', leftMargin, yPos);
        yPos += 5;
      }
    }

    // Footer
    yPos += 10;
    doc.setFontSize(8);
    doc.text('Terima kasih atas pembayaran Anda', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text('Simpan struk ini sebagai bukti pembayaran yang sah', pageWidth / 2, yPos, { align: 'center' });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `struk-pembayaran-${data.id}-${timestamp}.pdf`;

    // Save and open PDF
    doc.save(filename);

    // Optional: Open PDF in new window
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

  } catch (error) {
    console.error('Error generating receipt:', error.message || 'Unknown error');
    toast.error(`Gagal mencetak struk: ${error.message || 'Terjadi kesalahan sistem'}`);
  }
};
