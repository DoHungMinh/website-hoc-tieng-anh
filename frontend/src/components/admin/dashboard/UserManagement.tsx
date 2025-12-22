import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Power, 
  PowerOff, 
  Users,
  UserCheck,
  Globe,
  RefreshCw
} from 'lucide-react';
import AvatarDisplay from '@/components/common/AvatarDisplay';

interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  level: string;
  accountStatus: 'active' | 'disabled';
  isOnline: boolean;
  lastSeen: string | null;
  createdAt: string;
  streakCount: number;
  totalStudyHours: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  onlineUsers: number;
  adminUsers: number;
  regularUsers: number;
  newUsers: number;
  onlineAdminUsers: number;
  onlineRegularUsers: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0,
    onlineUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    newUsers: 0,
    onlineAdminUsers: 0,
    onlineRegularUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        accountStatus: statusFilter,
        onlineStatus: onlineFilter
      });

      const response = await fetch(`http://localhost:5002/api/user?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Calculate online admin and regular users from backend data
        const baseStats = data.data;
        
        // Try to get detailed user info to calculate online stats by role
        const allUsersResponse = await fetch('http://localhost:5002/api/user?page=1&limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (allUsersResponse.ok) {
          const allUsersData = await allUsersResponse.json();
          if (allUsersData.success) {
            const allUsers = allUsersData.data.users;
            const onlineAdminUsers = allUsers.filter((user: User) => user.role === 'admin' && user.isOnline).length;
            const onlineRegularUsers = allUsers.filter((user: User) => user.role === 'user' && user.isOnline).length;
            
            setStats({
              ...baseStats,
              onlineAdminUsers,
              onlineRegularUsers
            });
          } else {
            // Fallback if detailed data not available
            setStats({
              ...baseStats,
              onlineAdminUsers: 0,
              onlineRegularUsers: baseStats.onlineUsers
            });
          }
        } else {
          // Fallback if detailed data not available
          setStats({
            ...baseStats,
            onlineAdminUsers: 0,
            onlineRegularUsers: baseStats.onlineUsers
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Toggle account status
  const toggleAccountStatus = async (userId: string, currentStatus: string) => {
    // Prevent multiple requests for the same user
    if (updatingUsers.has(userId)) return;
    
    try {
      setUpdatingUsers(prev => new Set([...prev, userId]));
      
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      
      const response = await fetch(`http://localhost:5002/api/user/${userId}/account-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountStatus: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state immediately without refetching
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, accountStatus: newStatus as 'active' | 'disabled' }
              : user
          )
        );

        // Update stats immediately
        setStats(prevStats => ({
          ...prevStats,
          activeUsers: newStatus === 'active' 
            ? prevStats.activeUsers + 1 
            : prevStats.activeUsers - 1,
          disabledUsers: newStatus === 'disabled' 
            ? prevStats.disabledUsers + 1 
            : prevStats.disabledUsers - 1
        }));

        // Show success message (optional)
        // You can add a toast notification here
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái tài khoản');
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Remove user from local state immediately
        const deletedUser = users.find(user => user._id === userId);
        
        setUsers(prevUsers => 
          prevUsers.filter(user => user._id !== userId)
        );

        // Update stats immediately
        if (deletedUser) {
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: prevStats.totalUsers - 1,
            activeUsers: deletedUser.accountStatus === 'active' 
              ? prevStats.activeUsers - 1 
              : prevStats.activeUsers,
            disabledUsers: deletedUser.accountStatus === 'disabled' 
              ? prevStats.disabledUsers - 1 
              : prevStats.disabledUsers,
            onlineUsers: deletedUser.isOnline 
              ? prevStats.onlineUsers - 1 
              : prevStats.onlineUsers,
            adminUsers: deletedUser.role === 'admin' 
              ? prevStats.adminUsers - 1 
              : prevStats.adminUsers,
            regularUsers: deletedUser.role === 'user' 
              ? prevStats.regularUsers - 1 
              : prevStats.regularUsers
          }));
        }
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, roleFilter, statusFilter, onlineFilter]);

  const formatLastSeen = (lastSeen: string | null, createdAt: string) => {
    // Nếu lastSeen không tồn tại hoặc null, nghĩa là chưa đăng nhập
    if (!lastSeen) {
      return 'Chưa đăng nhập';
    }
    
    const lastSeenDate = new Date(lastSeen);
    const createdDate = new Date(createdAt);
    const now = new Date();
    
    // Nếu lastSeen gần bằng với createdAt (trong vòng 1 phút), nghĩa là chưa đăng nhập
    const timeDiffCreatedLastSeen = Math.abs(lastSeenDate.getTime() - createdDate.getTime());
    if (timeDiffCreatedLastSeen < 60000) { // 1 phút
      return 'Chưa đăng nhập';
    }
    
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p className="text-gray-600">Quản lý tài khoản và trạng thái người dùng</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Admin</p>
              <p className="text-2xl font-bold text-purple-600">{stats.onlineAdminUsers}/{stats.adminUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Đang online/Tổng số</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-blue-600">{stats.onlineRegularUsers}/{stats.regularUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Đang online/Tổng số</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tài khoản hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}/{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Kích hoạt/Tổng số</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đang online</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.onlineUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Người dùng hoạt động hiện tại</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="disabled">Bị khóa</option>
          </select>
          <select 
            value={onlineFilter}
            onChange={(e) => setOnlineFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
          >
            <option value="all">Tất cả online</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái tài khoản
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái online
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AvatarDisplay 
                            src={user.avatar} 
                            name={user.fullName}
                            size="md" 
                            showOnlineStatus={false} 
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Người dùng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.accountStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.accountStatus === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.isOnline ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                            Đang online
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                              Offline
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatLastSeen(user.lastSeen, user.createdAt)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setViewingUser(user);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => toggleAccountStatus(user._id, user.accountStatus)}
                            disabled={updatingUsers.has(user._id)}
                            className={`p-1 rounded ${
                              user.accountStatus === 'active'
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            } ${updatingUsers.has(user._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={user.accountStatus === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {updatingUsers.has(user._id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : user.accountStatus === 'active' ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => deleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Trang <span className="font-medium">{currentPage}</span> của{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newUser) => {
            // Add new user to local state
            setUsers(prevUsers => [newUser, ...prevUsers]);
            
            // Update stats
            setStats(prevStats => ({
              ...prevStats,
              totalUsers: prevStats.totalUsers + 1,
              activeUsers: prevStats.activeUsers + 1, // New users are always active
              adminUsers: newUser.role === 'admin' 
                ? prevStats.adminUsers + 1 
                : prevStats.adminUsers,
              regularUsers: newUser.role === 'user' 
                ? prevStats.regularUsers + 1 
                : prevStats.regularUsers
            }));
            
            setShowCreateModal(false);
          }}
        />
      )}

      {/* View User Modal */}
      {showViewModal && viewingUser && (
        <ViewUserModal 
          user={viewingUser}
          onClose={() => {
            setShowViewModal(false);
            setViewingUser(null);
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSuccess={(updatedUser) => {
            // Update user in local state
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user._id === updatedUser._id ? updatedUser : user
              )
            );
            
            // Update stats if role changed
            const oldUser = editingUser;
            if (oldUser && oldUser.role !== updatedUser.role) {
              setStats(prevStats => ({
                ...prevStats,
                adminUsers: updatedUser.role === 'admin' 
                  ? prevStats.adminUsers + (oldUser.role === 'admin' ? 0 : 1)
                  : prevStats.adminUsers - (oldUser.role === 'admin' ? 1 : 0),
                regularUsers: updatedUser.role === 'user' 
                  ? prevStats.regularUsers + (oldUser.role === 'user' ? 0 : 1)
                  : prevStats.regularUsers - (oldUser.role === 'user' ? 1 : 0)
              }));
            }
            
            setShowEditModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
  onClose: () => void;
  onSuccess: (newUser: User) => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    level: 'A1'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        const now = new Date().toISOString();
        const newUser: User = {
          _id: data.data.id,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          level: formData.level,
          accountStatus: 'active',
          isOnline: false,
          lastSeen: now, // Set cùng thời gian với createdAt
          createdAt: now,
          streakCount: 0,
          totalStudyHours: 0
        };
        onSuccess(newUser);
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Có lỗi xảy ra khi tạo người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Thêm người dùng mới</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as 'user' | 'admin'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    role: user.role as 'user' | 'admin'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Chỉ update role
      const updateData = {
        role: formData.role
      };
      
      const response = await fetch(`http://localhost:5002/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        const updatedUser: User = {
          ...user,
          role: formData.role
        };
        onSuccess(updatedUser);
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Chỉnh sửa vai trò người dùng</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as 'user' | 'admin'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View User Modal Component
const ViewUserModal: React.FC<{
  user: User;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const formatLastSeen = (lastSeen: string | null, createdAt: string) => {
    if (!lastSeen) {
      return 'Chưa đăng nhập';
    }
    
    const lastSeenDate = new Date(lastSeen);
    const createdDate = new Date(createdAt);
    const now = new Date();
    
    const timeDiffCreatedLastSeen = Math.abs(lastSeenDate.getTime() - createdDate.getTime());
    if (timeDiffCreatedLastSeen < 60000) { // 1 phút
      return 'Chưa đăng nhập';
    }
    
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin người dùng</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <p className="mt-1 text-sm text-gray-900">{user.phone || 'Chưa có'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trình độ</label>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
              {user.level || 'Chưa xác định'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Người dùng'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái tài khoản</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.accountStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user.accountStatus === 'active' ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái online</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.isOnline
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.isOnline ? 'Đang online' : 'Offline'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Lần cuối hoạt động</label>
            <p className="mt-1 text-sm text-gray-900">
              {formatLastSeen(user.lastSeen, user.createdAt)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày tạo tài khoản</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
