import React, { useState, useEffect } from "react";
import {
    Search,
    Download,
    Eye,
    CreditCard,
    Calendar,
    RefreshCw,
    FileText,
} from "lucide-react";
import { formatDateVN } from "../../../utils/dateUtils";
import { generateMonthlyPaymentReport } from "../../../utils/pdfGenerator";

// Interfaces for type safety
interface PaymentStats {
    todayRevenue: number;
    weekRevenue: number; // Thay đổi từ monthRevenue thành weekRevenue
    todayTransactions: number;
    successRate: number;
}

interface Course {
    _id: string;
    title: string;
    type: string;
    level: string;
    price: number;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
}

interface PaymentTransaction {
    _id: string;
    transactionId: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    courseId?: Course | null;
    userId?: User | null;
    createdAt?: string;
    description?: string;
}

const PaymentManagement: React.FC = () => {
    // Format date to YYYY-MM-DD using local timezone - định nghĩa trước để tránh hoisting error
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [stats, setStats] = useState<PaymentStats>({
        todayRevenue: 0,
        weekRevenue: 0,
        todayTransactions: 0,
        successRate: 0,
    });
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [retryingRequests, setRetryingRequests] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const itemsPerPage = 10;

    // Date filter states with default values (1 week ago to today)
    const getDefaultFromDate = (): string => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return formatDateForInput(oneWeekAgo);
    };

    const getDefaultToDate = (): string => {
        const today = new Date();
        return formatDateForInput(today);
    };

    const [fromDate, setFromDate] = useState<string>(getDefaultFromDate());
    const [toDate, setToDate] = useState<string>(getDefaultToDate());
    
    // PDF Export states
    const [isExporting, setIsExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportMonth, setExportMonth] = useState(() => {
        const now = new Date();
        return now.getMonth() + 1; // 1-12
    });
    const [exportYear, setExportYear] = useState(() => {
        const now = new Date();
        return now.getFullYear();
    });

    // Helper function for retrying failed requests
    const retryRequest = async (
        requestFn: () => Promise<Response>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<Response> => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await requestFn();
                if (response.status === 429) {
                    // Too Many Requests - wait and retry
                    if (i < maxRetries - 1) {
                        console.log(
                            `Rate limited, retrying in ${delay * (i + 1)}ms...`
                        );
                        setRetryingRequests(true);
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay * (i + 1))
                        );
                        continue;
                    }
                }
                setRetryingRequests(false);
                return response;
            } catch (error) {
                if (i === maxRetries - 1) {
                    setRetryingRequests(false);
                    throw error;
                }
                console.log(
                    `Request failed, retrying in ${delay * (i + 1)}ms...`
                );
                setRetryingRequests(true);
                await new Promise((resolve) =>
                    setTimeout(resolve, delay * (i + 1))
                );
            }
        }
        setRetryingRequests(false);
        throw new Error("Max retries exceeded");
    };

    // Fetch payment statistics
    const fetchPaymentStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            // Fetch today's stats with retry
            const todayResponse = await retryRequest(() =>
                fetch("/api/payments/stats/today", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
            );

            if (!todayResponse.ok) {
                throw new Error(
                    `Failed to fetch today's stats: ${todayResponse.statusText}`
                );
            }

            const todayData = await todayResponse.json();

            // Fetch week's stats (Monday to Sunday) with retry
            const weekResponse = await retryRequest(() =>
                fetch("/api/payments/stats/week", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
            );

            if (!weekResponse.ok) {
                throw new Error(
                    `Failed to fetch week's stats: ${weekResponse.statusText}`
                );
            }

            const weekData = await weekResponse.json();

            // Fetch success rate stats with retry
            const successRateResponse = await retryRequest(() =>
                fetch("/api/payments/stats/success-rate", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
            );

            if (!successRateResponse.ok) {
                throw new Error(
                    `Failed to fetch success rate stats: ${successRateResponse.statusText}`
                );
            }

            const successRateData = await successRateResponse.json();

            // Update state with real data
            setStats({
                todayRevenue: todayData.data.todayRevenue,
                weekRevenue: weekData.data.weekRevenue,
                todayTransactions: todayData.data.todayTransactions,
                successRate: successRateData.data.successRate,
            });
        } catch (error: any) {
            console.error("Error fetching payment stats:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch payment transactions
    const fetchTransactions = async (page: number = 1) => {
        try {
            setTransactionsLoading(true);
            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            // Build query params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
            });

            // Add date filter if set
            if (fromDate) {
                queryParams.append("startDate", fromDate);
            }
            if (toDate) {
                queryParams.append("endDate", toDate);
            }

            const response = await retryRequest(() =>
                fetch(
                    `http://localhost:5002/api/payments/history?${queryParams}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                )
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch transactions: ${response.statusText}`
                );
            }

            const data = await response.json();
            console.log("Payment transactions data:", data); // Debug log

            if (data.success) {
                // Debug: Log transaction status
                console.log(
                    "🔍 Transaction statuses from API:",
                    (data.data.payments || []).map((t: any) => ({
                        id: t._id,
                        status: t.status,
                        transactionId: t.transactionId,
                    }))
                );

                // Ensure data integrity with fallbacks
                const safeTransactions = (data.data.payments || []).map(
                    (transaction: any) => ({
                        ...transaction,
                        transactionId:
                            transaction.transactionId || `TX${Date.now()}`,
                        amount: transaction.amount || 0,
                        status: transaction.status || "unknown",
                        paymentMethod:
                            transaction.paymentMethod || "Không xác định",
                        userId: transaction.userId || {
                            fullName: "N/A",
                            email: "N/A",
                        },
                        courseId: transaction.courseId || { title: "N/A" },
                        createdAt:
                            transaction.createdAt || new Date().toISOString(),
                    })
                );

                setTransactions(safeTransactions);
                setCurrentPage(data.data.pagination?.current || 1);
                setTotalPages(data.data.pagination?.pages || 1);
                setTotalTransactions(data.data.pagination?.total || 0);
            } else {
                throw new Error(data.message || "Failed to fetch transactions");
            }
        } catch (error: any) {
            console.error("Error fetching transactions:", error);
            setError(error.message);
        } finally {
            setTransactionsLoading(false);
        }
    };

    // Export monthly payment report to PDF
    const handleExportPDF = async () => {
        try {
            setIsExporting(true);
            setError(null);

            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            console.log(`📥 Fetching monthly report data for ${exportMonth}/${exportYear}...`);

            // Gọi API lấy dữ liệu theo tháng
            const response = await fetch(
                `/api/payments/report/monthly?month=${exportMonth}&year=${exportYear}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch report data: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                throw new Error(result.message || "Failed to fetch report data");
            }

            console.log(`✅ Got ${result.data.payments.length} transactions for report`);

            // Generate PDF
            const fileName = generateMonthlyPaymentReport(result.data);
            
            console.log(`✅ PDF exported successfully: ${fileName}`);
            
            // Đóng modal
            setShowExportModal(false);
            
            // Hiển thị thông báo thành công
            alert(`✅ Đã xuất báo cáo thành công!\nFile: ${fileName}`);

        } catch (error: any) {
            console.error("❌ Export PDF error:", error);
            setError(error.message || "Lỗi khi xuất báo cáo PDF");
            alert(`❌ Lỗi: ${error.message || "Không thể xuất báo cáo"}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchPaymentStats();
        fetchTransactions();
    }, []);

    // Refetch transactions when date filter changes
    useEffect(() => {
        fetchTransactions(1); // Reset to page 1 when filter changes
    }, [fromDate, toDate]);

    // Format currency for display
    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M VNĐ`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K VNĐ`;
        }
        return `${amount.toLocaleString()} VNĐ`;
    };

    // Date validation helpers
    const getMinDate = (): string => {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        return formatDateForInput(tenYearsAgo);
    };

    const getMaxDate = (): string => {
        const today = new Date();
        return formatDateForInput(today);
    };

    // Get maximum days in a specific month/year
    const getMaxDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month, 0).getDate();
    };

    // Get maximum month for a specific year (current year can't exceed current month)
    const getMaxMonthForYear = (year: number): number => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

        if (year === currentYear) {
            return currentMonth; // Current year can only go up to current month
        } else {
            return 12; // Past years can go up to December
        }
    };

    // Validate and correct date components
    const validateAndCorrectDate = (dateString: string): string => {
        const [yearStr, monthStr, dayStr] = dateString.split("-");
        let year = parseInt(yearStr);
        let month = parseInt(monthStr);
        let day = parseInt(dayStr);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const minYear = currentYear - 10;

        // Validate and correct year
        if (isNaN(year) || year > currentYear) {
            year = currentYear;
        } else if (year < minYear) {
            year = currentYear;
        }

        // Validate and correct month
        const maxMonth = getMaxMonthForYear(year);
        if (month > maxMonth) {
            month = maxMonth;
        } else if (month < 1) {
            month = 1;
        }

        // Validate and correct day
        const maxDay = getMaxDaysInMonth(year, month);
        if (day > maxDay) {
            day = maxDay;
        } else if (day < 1) {
            day = 1;
        }

        // Format back to YYYY-MM-DD
        const correctedYear = year.toString().padStart(4, "0");
        const correctedMonth = month.toString().padStart(2, "0");
        const correctedDay = day.toString().padStart(2, "0");

        return `${correctedYear}-${correctedMonth}-${correctedDay}`;
    };

    // Validate and format date input
    const handleDateChange = (
        value: string,
        setter: (value: string) => void,
        isToDate: boolean = false
    ): void => {
        // Allow empty value
        if (!value) {
            setter("");
            return;
        }

        // More flexible regex to allow partial input while typing
        const partialDateRegex = /^\d{1,4}(-\d{1,2}(-\d{1,2})?)?$/;
        const completeDateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!partialDateRegex.test(value)) {
            // If input doesn't match even partial pattern, don't allow it
            return;
        }

        if (!completeDateRegex.test(value)) {
            // If date is incomplete but valid partial format, allow user to continue typing
            setter(value);
            return;
        }

        // Only run full validation when we have complete YYYY-MM-DD format
        const correctedValue = validateAndCorrectDate(value);

        // Check if date is invalid after correction
        const correctedDate = new Date(correctedValue);
        if (isNaN(correctedDate.getTime())) {
            // If still invalid, set to current date
            const currentDate = new Date();
            const formattedCurrentDate = `${currentDate.getFullYear()}-${(
                currentDate.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${currentDate
                .getDate()
                .toString()
                .padStart(2, "0")}`;
            setter(formattedCurrentDate);
            return;
        }

        // Additional validation for "To Date" - should not be before "From Date"
        if (isToDate && fromDate) {
            const fromDateObj = new Date(fromDate);
            if (correctedDate < fromDateObj) {
                // If "To Date" is before "From Date", set it to "From Date"
                setter(fromDate);
                return;
            }
        }

        setter(correctedValue);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Quản lý thanh toán
                    </h2>
                    <p className="text-gray-600">
                        Theo dõi giao dịch và doanh thu
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            fetchPaymentStats();
                            fetchTransactions(currentPage);
                        }}
                        disabled={
                            loading || transactionsLoading || retryingRequests
                        }
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ||
                                transactionsLoading ||
                                retryingRequests
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />
                        {retryingRequests
                            ? "Đang thử lại..."
                            : loading || transactionsLoading
                            ? "Đang tải..."
                            : "Làm mới"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700"
                        onClick={() => setShowExportModal(true)}
                    >
                        <FileText className="w-4 h-4" />
                        Xuất báo cáo PDF
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-600">⚠️ Lỗi: {error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">
                                Doanh thu hôm nay
                            </p>
                            {loading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.todayRevenue)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">
                                Doanh thu tuần
                            </p>
                            {loading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.weekRevenue)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">
                                Giao dịch hôm nay
                            </p>
                            {loading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.todayTransactions.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <CreditCard className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">
                                Tỷ lệ thành công
                            </p>
                            {loading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.successRate.toFixed(1)}%
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm giao dịch..."
                            className="w-full h-10 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex items-center h-10 px-4 space-x-3 border border-gray-200 rounded-lg bg-gray-50">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                            Từ
                        </span>
                        <input
                            type="date"
                            value={fromDate}
                            min={getMinDate()}
                            max={getMaxDate()}
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) =>
                                handleDateChange(e.target.value, setFromDate)
                            }
                            className="px-3 py-1 text-sm border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-600">
                            đến
                        </span>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || getMinDate()}
                            max={getMaxDate()}
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) =>
                                handleDateChange(
                                    e.target.value,
                                    setToDate,
                                    true
                                )
                            }
                            className="px-3 py-1 text-sm border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Mã giao dịch
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Người dùng
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Sản phẩm
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Số tiền
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Phương thức
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Ngày
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactionsLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="text-gray-500">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">
                                            Không có giao dịch nào
                                        </p>
                                        <p className="text-sm">
                                            Thử thay đổi bộ lọc hoặc khoảng thời
                                            gian
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions
                                .filter(
                                    (transaction) =>
                                        // Simple search filter with safe property access
                                        searchTerm === "" ||
                                        transaction.transactionId
                                            ?.toLowerCase()
                                            .includes(
                                                searchTerm.toLowerCase()
                                            ) ||
                                        transaction.userId?.fullName
                                            ?.toLowerCase()
                                            .includes(
                                                searchTerm.toLowerCase()
                                            ) ||
                                        transaction.userId?.email
                                            ?.toLowerCase()
                                            .includes(
                                                searchTerm.toLowerCase()
                                            ) ||
                                        transaction.courseId?.title
                                            ?.toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                )
                                .map((transaction) => (
                                    <tr
                                        key={transaction._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.transactionId ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.userId?.fullName ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {transaction.userId?.email ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {transaction.courseId?.title ||
                                                "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.amount?.toLocaleString() ||
                                                    "0"}{" "}
                                                VNĐ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {transaction.paymentMethod ||
                                                "Thẻ tín dụng"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                                    transaction.status ===
                                                    "PAID"
                                                        ? "text-green-800 bg-green-100"
                                                        : transaction.status ===
                                                              "PENDING" ||
                                                          transaction.status ===
                                                              "PROCESSING"
                                                        ? "text-yellow-800 bg-yellow-100"
                                                        : transaction.status ===
                                                          "CANCELLED"
                                                        ? "text-gray-800 bg-gray-100"
                                                        : "text-red-800 bg-red-100"
                                                }`}
                                            >
                                                {transaction.status === "PAID"
                                                    ? "Thành công"
                                                    : transaction.status ===
                                                      "PENDING"
                                                    ? "Đang xử lý"
                                                    : transaction.status ===
                                                      "PROCESSING"
                                                    ? "Đang xử lý"
                                                    : transaction.status ===
                                                      "CANCELLED"
                                                    ? "Đã hủy"
                                                    : transaction.status ===
                                                      "EXPIRED"
                                                    ? "Hết hạn"
                                                    : "Thất bại"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {formatDateVN(
                                                transaction.createdAt
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!transactionsLoading &&
                    transactions.length > 0 &&
                    totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Hiển thị {(currentPage - 1) * itemsPerPage + 1}{" "}
                                đến{" "}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    totalTransactions
                                )}{" "}
                                trong {totalTransactions} giao dịch
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() =>
                                        fetchTransactions(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        const page =
                                            i + Math.max(1, currentPage - 2);
                                        if (page > totalPages) return null;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    fetchTransactions(page)
                                                }
                                                className={`px-3 py-1 text-sm border rounded ${
                                                    page === currentPage
                                                        ? "bg-purple-600 text-white border-purple-600"
                                                        : "border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                )}
                                <button
                                    onClick={() =>
                                        fetchTransactions(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-purple-600" />
                                Xuất Báo Cáo PDF
                            </h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                disabled={isExporting}
                                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    📊 Báo cáo sẽ bao gồm tất cả giao dịch từ ngày 1 đến hết tháng đã chọn
                                </p>
                            </div>

                            {/* Month Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn tháng
                                </label>
                                <select
                                    value={exportMonth}
                                    onChange={(e) => setExportMonth(parseInt(e.target.value))}
                                    disabled={isExporting}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                        <option key={month} value={month}>
                                            Tháng {month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn năm
                                </label>
                                <select
                                    value={exportYear}
                                    onChange={(e) => setExportYear(parseInt(e.target.value))}
                                    disabled={isExporting}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <option key={year} value={year}>
                                            Năm {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview Info */}
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Kỳ báo cáo:</span>
                                    <br />
                                    01/{exportMonth.toString().padStart(2, '0')}/{exportYear} - {new Date(exportYear, exportMonth, 0).getDate()}/{exportMonth.toString().padStart(2, '0')}/{exportYear}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang xuất...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Xuất PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(PaymentManagement);
