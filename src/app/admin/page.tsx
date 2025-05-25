'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Edit, Trash2, UserPlus, X, KeyRound } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const openAddModal = () => {
    setModalMode('add');
    setUsername('');
    setPassword('');
    setName('');
    setRole('user');
    setSelectedUser(null);
    setShowModal(true);
  };
  
  const openEditModal = (user: User) => {
    setModalMode('edit');
    setUsername(user.username);
    setPassword(''); // Don't show the current password
    setName(user.name);
    setRole(user.role);
    setSelectedUser(user);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            name,
            role,
          }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to create user');
        }
        
      } else if (modalMode === 'edit' && selectedUser) {
        // Update existing user
        const updateData: any = {
          username,
          name,
          role,
        };
        
        // Only include password if it was changed
        if (password) {
          updateData.password = password;
        }
        
        const res = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update user');
        }
      }
      
      // Refresh user list and close modal
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the user');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the user');
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full p-4 overflow-auto" style={{ maxWidth: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <UserPlus size={18} className="mr-2" /> Add User
        </button>
      </div>
      
      {error ? (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-md mb-4">{error}</div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-700 shadow-md">
          <table className="w-full divide-y divide-gray-700">
            <thead className="bg-[#1a1b26]">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[80px]">
                  Role
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                  Created
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                  Last Login
                </th>
                <th scope="col" className="relative px-3 py-3 w-[90px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-3 text-sm text-gray-300">{user.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-300">{user.username}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-3 text-sm text-gray-400">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</td>
                    <td className="px-3 py-3 text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-800"
                          title="Edit user"
                        >
                          <Edit size={18} />
                        </button>
                        <Link
                          href={`/admin/reset-password/${user.id}`}
                          className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-gray-800 inline-block"
                          title="Reset password"
                        >
                          <KeyRound size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-800"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for adding/editing users */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-300 p-1 rounded-full hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white focus:border-indigo-400 focus:ring-indigo-400 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white focus:border-indigo-400 focus:ring-indigo-400 px-3 py-2"
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={modalMode === 'add'}
                    className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white focus:border-indigo-400 focus:ring-indigo-400 px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white focus:border-indigo-400 focus:ring-indigo-400 px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
