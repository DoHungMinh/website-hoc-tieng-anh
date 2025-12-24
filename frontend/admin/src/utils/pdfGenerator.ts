import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type để support autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: typeof autoTable;
    }
}

interface PaymentData {
    _id: string;
    transactionId: string;
    amount: number;
    status: string;
    courseId?: {
        title: string;
        type: string;
        level: string;
    };
    userId?: {
        fullName: string;
        email: string;
        phone?: string;
    };
    createdAt: string;
    description?: string;
}

interface MonthlyReportData {
    month: number;
    year: number;
    monthName: string;
    startDate: string;
    endDate: string;
    payments: PaymentData[];
    stats: {
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        totalRevenue: number;
        averageTransaction: number;
    };
}

export const generateMonthlyPaymentReport = (data: MonthlyReportData) => {
    // Tạo document PDF với font hỗ trợ Unicode
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // ==================== HEADER ====================
    // Logo hoặc tên công ty
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Purple color
    doc.setFont('helvetica', 'bold');
    doc.text('ENGLISHPRO', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('English Learning Platform', pageWidth / 2, yPosition, { align: 'center' });

    // Đường kẻ ngang
    yPosition += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);

    // ==================== TITLE ====================
    yPosition += 10;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('BAO CAO GIAO DICH THANG', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const monthYearText = `Thang ${data.month}/${data.year}`;
    doc.text(monthYearText, pageWidth / 2, yPosition, { align: 'center' });

    // ==================== THÔNG TIN THỜI GIAN ====================
    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const reportDate = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    doc.text(`Ngay xuat bao cao: ${reportDate}`, 15, yPosition);

    // ==================== THỐNG KÊ TỔNG QUAN ====================
    yPosition += 10;
    
    // Box thống kê
    const statsBoxY = yPosition;
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.roundedRect(15, statsBoxY, pageWidth - 30, 45, 3, 3, 'F');

    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TONG QUAN', 20, yPosition);

    // Grid layout cho stats
    const col1X = 20;
    const col2X = pageWidth / 2 + 5;
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    // Column 1
    doc.text(`Tong giao dich:`, col1X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.stats.totalTransactions}`, col1X + 40, yPosition);

    // Column 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Thanh cong:`, col2X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`${data.stats.successfulTransactions}`, col2X + 30, yPosition);

    yPosition += 6;

    // Column 1
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`That bai:`, col1X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`${data.stats.failedTransactions}`, col1X + 40, yPosition);

    // Column 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Dang xu ly:`, col2X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(250, 204, 21); // Yellow
    doc.text(`${data.stats.pendingTransactions}`, col2X + 30, yPosition);

    yPosition += 8;

    // Đường kẻ phân cách
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 6;

    // Doanh thu
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Tong doanh thu:`, col1X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // Purple
    const revenueText = `${data.stats.totalRevenue.toLocaleString('vi-VN')} VND`;
    doc.text(revenueText, col1X + 35, yPosition);

    // Giao dịch trung bình
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Trung binh/GD:`, col2X, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const avgText = `${Math.round(data.stats.averageTransaction).toLocaleString('vi-VN')} VND`;
    doc.text(avgText, col2X + 32, yPosition);

    // ==================== BẢNG GIAO DỊCH CHI TIẾT ====================
    yPosition += 12;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CHI TIET GIAO DICH', 15, yPosition);

    yPosition += 5;

    // Chuẩn bị dữ liệu cho bảng
    const tableData = data.payments.map((payment, index) => {
        const date = new Date(payment.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const customer = payment.userId?.fullName || 'N/A';
        const course = payment.courseId?.title || 'N/A';
        const amount = `${payment.amount.toLocaleString('vi-VN')}`;
        
        let status = '';
        if (payment.status === 'PAID') status = 'Thanh cong';
        else if (payment.status === 'FAILED') status = 'That bai';
        else if (payment.status === 'CANCELLED') status = 'Da huy';
        else if (payment.status === 'PENDING') status = 'Cho xu ly';
        else status = payment.status;

        return [
            (index + 1).toString(),
            date,
            customer,
            course,
            amount,
            status,
        ];
    });

    // Tạo bảng với autoTable
    autoTable(doc, {
        startY: yPosition,
        head: [['STT', 'Ngay GD', 'Khach hang', 'Khoa hoc', 'So tien (VND)', 'Trang thai']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [79, 70, 229], // Purple
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50],
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 }, // STT
            1: { halign: 'center', cellWidth: 28 }, // Ngày GD
            2: { halign: 'left', cellWidth: 35 },   // Khách hàng
            3: { halign: 'left', cellWidth: 50 },   // Khóa học
            4: { halign: 'right', cellWidth: 25 },  // Số tiền
            5: { halign: 'center', cellWidth: 25 }, // Trạng thái
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
            // Tô màu trạng thái
            if (data.column.index === 5 && data.section === 'body') {
                const status = data.cell.raw as string;
                let color: [number, number, number] = [0, 0, 0];
                
                if (status === 'Thanh cong') color = [34, 197, 94];  // Green
                else if (status === 'That bai' || status === 'Da huy') color = [239, 68, 68]; // Red
                else if (status === 'Cho xu ly') color = [250, 204, 21]; // Yellow
                
                data.cell.styles.textColor = color;
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    // ==================== FOOTER ====================
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    
    // Kiểm tra nếu cần trang mới
    if (finalY > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
    } else {
        yPosition = finalY + 15;
    }

    // Chữ ký
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const signatureY = pageHeight - 40;
    doc.text('Nguoi lap bao cao', pageWidth / 2, signatureY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('(Ky va ghi ro ho ten)', pageWidth / 2, signatureY + 5, { align: 'center' });

    // Footer - Page number
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Trang ${i}/${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        
        // Đường kẻ footer
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    }

    // ==================== LƯU FILE ====================
    const fileName = `Bao-cao-giao-dich-thang-${data.month}-${data.year}.pdf`;
    doc.save(fileName);

    return fileName;
};
