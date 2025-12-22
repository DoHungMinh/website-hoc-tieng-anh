import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary để catch và handle React errors
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🚨 React Error Boundary caught an error:", error);
        console.error("Error Info:", errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Prevent page reload - stop event propagation
        if (window.event) {
            window.event.preventDefault();
            window.event.stopPropagation();
        }

        // Add global error handler to prevent reload
        const preventReload = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        window.addEventListener("beforeunload", preventReload);
        window.addEventListener("unload", preventReload);

        // Remove after 5 seconds
        setTimeout(() => {
            window.removeEventListener("beforeunload", preventReload);
            window.removeEventListener("unload", preventReload);
        }, 5000);

        // Trong production có thể gửi error lên monitoring service
        if (process.env.NODE_ENV === "production") {
            // this.logErrorToService(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Đã xảy ra lỗi
                            </h3>

                            <p className="text-sm text-gray-500 mb-4">
                                Rất tiếc, đã có lỗi xảy ra trong ứng dụng. Vui
                                lòng thử lại sau.
                            </p>

                            {process.env.NODE_ENV === "development" &&
                                this.state.error && (
                                    <details className="text-left mb-4">
                                        <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                                            Chi tiết lỗi (Development)
                                        </summary>
                                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                                            {this.state.error.toString()}
                                            {
                                                this.state.errorInfo
                                                    ?.componentStack
                                            }
                                        </pre>
                                    </details>
                                )}

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() =>
                                        this.setState({
                                            hasError: false,
                                            error: null,
                                            errorInfo: null,
                                        })
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Thử lại
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Tải lại trang (nếu cần thiết)
                                </button>

                                <button
                                    onClick={() => (window.location.href = "/")}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
