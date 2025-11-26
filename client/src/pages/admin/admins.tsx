import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, Shield, Loader2, UserCog, Filter, CheckCircle2, XCircle, Eye, EyeOff, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, type Admin, type CreateAdminData, type UpdateAdminData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<CreateAdminData>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [editFormData, setEditFormData] = useState<UpdateAdminData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const togglePasswordVisibility = (adminId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const { data: adminsResponse, isLoading } = useQuery({
    queryKey: ["/api/admins"],
    queryFn: async () => {
      return await getAdmins();
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: "Success",
        description: "Admin created successfully",
      });
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", password: "" });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminData }) => updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: "Success",
        description: "Admin updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedAdmin(null);
      setEditFormData({ name: "", email: "", phone: "" });
      setEditErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin",
        variant: "destructive",
      });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admins"] });
      toast({
        title: "✓ Admin deleted successfully",
        description: "The admin account has been removed",
        className: "bg-green-50 border-green-200",
      });
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete admin",
        variant: "destructive",
      });
    },
  });

  const admins: Admin[] = adminsResponse?.data || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (adminToDelete) {
      deleteAdminMutation.mutate(adminToDelete._id);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (editFormData.name && !editFormData.name.trim()) {
      newErrors.name = "Name cannot be empty";
    }

    if (editFormData.email) {
      if (!editFormData.email.trim()) {
        newErrors.email = "Email cannot be empty";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (editFormData.phone) {
      if (!editFormData.phone.trim()) {
        newErrors.phone = "Phone cannot be empty";
      } else if (!/^\d{10}$/.test(editFormData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Phone must be 10 digits";
      }
    }

    if (editFormData.password && editFormData.password.length > 0 && editFormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createAdminMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEditForm() && selectedAdmin) {
      // Only send fields that have values
      const updateData: UpdateAdminData = {};
      if (editFormData.name) updateData.name = editFormData.name;
      if (editFormData.email) updateData.email = editFormData.email;
      if (editFormData.phone) updateData.phone = editFormData.phone;
      if (editFormData.password) updateData.password = editFormData.password;

      updateAdminMutation.mutate({ id: selectedAdmin._id, data: updateData });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <UserCog className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Admin Management</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage regular admin accounts and permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="button-add-admin"
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 h-11 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl">Create New Admin</DialogTitle>
                  <DialogDescription className="text-blue-100 mt-1">
                    Add a new admin account to the system
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Anita Singh"
                    value={formData.name}
                    onChange={handleChange}
                    className={`h-11 ${errors.name ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="anita@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-11 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9689632589"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`h-11 ${errors.phone ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-11 ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="p-6 pt-4 bg-gray-50 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({ name: "", email: "", phone: "", password: "" });
                    setErrors({});
                  }}
                  className="h-11 px-6 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/30"
                >
                  {createAdminMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl">Edit Admin</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Update admin information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Anita Singh"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className={`h-11 ${editErrors.name ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                />
                {editErrors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {editErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="anita@example.com"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className={`h-11 ${editErrors.email ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                />
                {editErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {editErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  placeholder="9689632589"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className={`h-11 ${editErrors.phone ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                />
                {editErrors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {editErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm font-semibold text-gray-700">New Password (Optional)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={editFormData.password || ""}
                  onChange={handleEditChange}
                  className={`h-11 ${editErrors.password ? "border-red-500 focus:ring-red-500" : "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"}`}
                />
                {editErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {editErrors.password}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="p-6 pt-4 bg-gray-50 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedAdmin(null);
                  setEditFormData({ name: "", email: "", phone: "" });
                  setEditErrors({});
                }}
                className="h-11 px-6 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAdminMutation.isPending}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/30"
              >
                {updateAdminMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Admin</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{adminToDelete?.name}</span>? 
              This action cannot be undone and will permanently remove the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteAdminMutation.isPending}
              className="h-11 px-6"
            >
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteAdminMutation.isPending}
              className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteAdminMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl transition-all duration-200"
                data-testid="input-search-admins"
              />
            </div>
            <Button 
              variant="outline" 
              data-testid="button-filter"
              className="h-12 px-6 border-gray-300 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 rounded-xl transition-all duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-50 hover:to-gray-100/50 border-b-2 border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-4">Admin</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-700">Password</TableHead>
                    <TableHead className="font-semibold text-gray-700">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <UserCog className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">No admins found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin, index) => (
                    <TableRow 
                      key={admin._id} 
                      data-testid={`admin-row-${admin._id}`}
                      className={`
                        transition-all duration-200 hover:bg-blue-50/50 group cursor-pointer
                        ${index !== admins.length - 1 ? 'border-b border-gray-100' : ''}
                      `}
                    >
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 ring-2 ring-gray-100 ring-offset-2 group-hover:ring-blue-600 transition-all duration-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-sm font-semibold">
                              {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{admin.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                            <Mail className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                          </div>
                          <span className="group-hover:text-gray-900 transition-colors duration-200">{admin.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                            <Phone className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                          </div>
                          <span className="group-hover:text-gray-900 transition-colors duration-200">{admin.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                            <Key className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-mono">
                            {visiblePasswords[admin._id] ? admin.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(admin._id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                          >
                            {visiblePasswords[admin._id] ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border-0 shadow-md shadow-blue-600/20 px-3 py-1">
                          <Shield className="h-3 w-3 mr-1.5" />
                          {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.isActive ? "default" : "secondary"}
                          data-testid={`badge-status-${admin._id}`}
                          className={
                            admin.isActive 
                              ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-3 py-1" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 px-3 py-1"
                          }
                        >
                          {admin.isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1.5" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                          {new Date(admin.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-actions-${admin._id}`}
                              className="hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 shadow-lg">
                            <DropdownMenuItem onClick={() => handleEditClick(admin)} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="font-medium">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(admin)} 
                              className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span className="font-medium">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

