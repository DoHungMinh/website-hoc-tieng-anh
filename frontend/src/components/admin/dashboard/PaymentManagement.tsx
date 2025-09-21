import React, { useState, useEffect } from "react";
import {
    Search,
    Download,
    Eye,
    CreditCard,
    Calendar,
    RefreshCw,
} from "lucide-react";

// Interfaces for type safety
interface PaymentStats {
    todayRevenue: number;
    monthRevenue: number;
    todayTransactions: number;
    successRate: number;
}

const PaymentManagement: React.FC = () => {
    const [stats, setStats] = useState<PaymentStats>({
        todayRevenue: 0,
        monthRevenue: 0,
        todayTransactions: 0,
        successRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Date filter states with default values (1 week ago to today)
    const getDefaultFromDate = (): string => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return oneWeekAgo.toISOString().split("T")[0];
    };

    const getDefaultToDate = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const [fromDate, setFromDate] = useState<string>(getDefaultFromDate());
    const [toDate, setToDate] = useState<string>(getDefaultToDate());

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

            // Fetch today's stats
            const todayResponse = await fetch("/api/payments/stats/today", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!todayResponse.ok) {
                throw new Error(
                    `Failed to fetch today's stats: ${todayResponse.statusText}`
                );
            }

            const todayData = await todayResponse.json();

            // Fetch month's stats
            const monthResponse = await fetch("/api/payments/stats/month", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!monthResponse.ok) {
                throw new Error(
                    `Failed to fetch month's stats: ${monthResponse.statusText}`
                );
            }

            const monthData = await monthResponse.json();

            // Fetch success rate stats
            const successRateResponse = await fetch(
                "/api/payments/stats/success-rate",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
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
                monthRevenue: monthData.data.monthRevenue,
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

    // Load data on component mount
    useEffect(() => {
        fetchPaymentStats();
    }, []);

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
        return tenYearsAgo.toISOString().split("T")[0];
    };

    const getMaxDate = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0];
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
                        onClick={fetchPaymentStats}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        {loading ? "Đang tải..." : "Làm mới"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-700">
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
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
                                Doanh thu tháng
                            </p>
                            {loading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.monthRevenue)}
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
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        TX{String(item).padStart(6, "0")}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        Nguyễn Văn A{item}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        user{item}@example.com
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                    Khóa học Tiếng Anh B{item}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {(500 + item * 100).toLocaleString()}{" "}
                                        VNĐ
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                    Thẻ tín dụng
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                        Thành công
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date().toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-900">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentManagement;
