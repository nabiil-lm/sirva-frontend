"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, UserCog, Shield, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/contexts/auth.context";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

interface UserStats {
  total_users: number;
  am_count: number;
  so_count: number;
  admin_count: number;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    am_count: 0,
    so_count: 0,
    admin_count: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit user dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "AM",
    password: "",
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        apiClient.get('/users/'),
        apiClient.get('/users/stats/')
      ]);
      setUsers(usersResponse.data.results || usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setUserForm({
      email: "",
      first_name: "",
      last_name: "",
      role: "AM",
      password: "",
      is_active: true
    });
    setIsUserDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      password: "",
      is_active: user.is_active
    });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.email || !userForm.first_name || !userForm.last_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editingUser && !userForm.password) {
      toast.error("Password is required for new users");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        email: userForm.email,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        role: userForm.role,
        is_active: userForm.is_active,
        ...(userForm.password && { password: userForm.password })
      };

      if (editingUser) {
        await apiClient.patch(`/users/${editingUser.id}/`, payload);
        toast.success("User updated successfully");
      } else {
        await apiClient.post('/users/', payload);
        toast.success("User created successfully");
      }

      setIsUserDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Failed to save user", error);
      const errorMsg = error.response?.data?.email?.[0] || 
                       error.response?.data?.detail ||
                       "Failed to save user";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/${deletingUser.id}/`);
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchData();
    } catch (error: any) {
      console.error("Failed to delete user", error);
      const errorMsg = error.response?.data?.detail || "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'SO':
      case 'security_officer':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'admin':
        return 'Administrator';
      case 'SO':
      case 'security_officer':
        return 'Security Officer';
      case 'AM':
      case 'application_manager':
        return 'Application Manager';
      default:
        return role;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage system users and their roles</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.total_users}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Admins</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.admin_count}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Security Officers</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.so_count}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <UserCog className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">App Managers</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.am_count}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:bg-slate-950 dark:border-slate-700"
          />
        </div>
        <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700">
          <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No users found</h3>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first user"}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Joined</th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.is_active
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.id === currentUser?.id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {editingUser ? 'Update user information and role' : 'Add a new user to the system'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">First Name <span className="text-red-500">*</span></Label>
                <Input
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                  placeholder="John"
                  className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                  placeholder="Doe"
                  className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                placeholder="john.doe@example.com"
                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Password {!editingUser && <span className="text-red-500">*</span>}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Role <span className="text-red-500">*</span></Label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm({...userForm, role: v})}>
                <SelectTrigger className="dark:bg-slate-950 dark:border-slate-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="SO">Security Officer</SelectItem>
                  <SelectItem value="AM">Application Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <Label className="dark:text-slate-300">Active Status</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">User can log in and access the system</p>
              </div>
              <Switch
                checked={userForm.is_active}
                onCheckedChange={(checked) => setUserForm({...userForm, is_active: checked})}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
              disabled={isSaving}
              className="flex-1 h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={isSaving}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingUser ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-red-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete User
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete this user? All associated data will be permanently removed.
            </p>
            {deletingUser && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {deletingUser.first_name} {deletingUser.last_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{deletingUser.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-2 ${getRoleBadgeColor(deletingUser.role)}`}>
                  {getRoleDisplayName(deletingUser.role)}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <strong>Warning:</strong> Any dossiers or resources owned by this user may be affected.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingUser(null);
              }}
              disabled={isDeleting}
              className="flex-1 h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
