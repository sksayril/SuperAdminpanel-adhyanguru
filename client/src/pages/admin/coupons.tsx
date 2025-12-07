import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Loader2, Tag, XCircle, CheckCircle2, Calendar, Percent, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoupons, createCoupon, updateCoupon, type Coupon, type CreateCouponData, type UpdateCouponData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CouponsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CreateCouponData>({
    discountType: "percent",
    discountValue: 0,
    validTill: "",
    maxUsage: 1,
    applicablePlan: "all",
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState<UpdateCouponData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: couponsResponse, isLoading } = useQuery({
    queryKey: ["/api/superadmin/coupons", page],
    queryFn: async () => {
      return await getCoupons({ page, limit });
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        discountType: "percent",
        discountValue: 0,
        validTill: "",
        maxUsage: 1,
        applicablePlan: "all",
        isActive: true,
      });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponData }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCoupon(null);
      setEditFormData({});
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const coupons = couponsResponse?.data?.items || [];
  const pagination = couponsResponse?.data?.pagination;

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditFormData({
      discountValue: coupon.discountValue,
      maxUsage: coupon.maxUsage,
      isActive: coupon.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.discountType) {
      newErrors.discountType = "Discount type is required";
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (formData.discountType === "percent" && formData.discountValue > 100) {
      newErrors.discountValue = "Percentage cannot exceed 100";
    }

    if (!formData.validTill) {
      newErrors.validTill = "Valid till date is required";
    } else {
      const validTillDate = new Date(formData.validTill);
      if (validTillDate <= new Date()) {
        newErrors.validTill = "Valid till must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createCouponMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCoupon) {
      updateCouponMutation.mutate({ id: selectedCoupon._id, data: editFormData });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage discount coupons for subscriptions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Add a new discount coupon code</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code (Optional - Auto-generated if empty)</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="SAVE20"
                    value={formData.code || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "flat" | "percent") =>
                      setFormData((prev) => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === "percent" ? "(%)" : "(Amount)"}
                  </Label>
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    placeholder={formData.discountType === "percent" ? "20" : "100"}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))
                    }
                    className={errors.discountValue ? "border-red-500" : ""}
                  />
                  {errors.discountValue && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.discountValue}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validTill">Valid Till *</Label>
                  <Input
                    id="validTill"
                    name="validTill"
                    type="datetime-local"
                    value={formData.validTill}
                    onChange={handleChange}
                    className={errors.validTill ? "border-red-500" : ""}
                  />
                  {errors.validTill && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.validTill}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUsage">Maximum Usage</Label>
                  <Input
                    id="maxUsage"
                    name="maxUsage"
                    type="number"
                    placeholder="100"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxUsage: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicablePlan">Applicable Plan</Label>
                  <Select
                    value={formData.applicablePlan}
                    onValueChange={(value: "monthly" | "quarterly" | "yearly" | "all") =>
                      setFormData((prev) => ({ ...prev, applicablePlan: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({
                      discountType: "percent",
                      discountValue: 0,
                      validTill: "",
                      maxUsage: 1,
                      applicablePlan: "all",
                      isActive: true,
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCouponMutation.isPending}>
                  {createCouponMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Coupon
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input value={selectedCoupon?.code || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-discountValue">Discount Value</Label>
                <Input
                  id="edit-discountValue"
                  name="discountValue"
                  type="number"
                  value={editFormData.discountValue || selectedCoupon?.discountValue || 0}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-maxUsage">Maximum Usage</Label>
                <Input
                  id="edit-maxUsage"
                  name="maxUsage"
                  type="number"
                  value={editFormData.maxUsage || selectedCoupon?.maxUsage || 1}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, maxUsage: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <Select
                  value={editFormData.isActive !== undefined ? editFormData.isActive.toString() : selectedCoupon?.isActive?.toString() || "true"}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, isActive: value === "true" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCoupon(null);
                  setEditFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCouponMutation.isPending}>
                {updateCouponMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Till</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Tag className="h-12 w-12 text-gray-300" />
                          <p className="font-medium">No coupons found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {coupon.discountType === "percent" ? (
                              <Percent className="h-3 w-3 mr-1" />
                            ) : (
                              <DollarSign className="h-3 w-3 mr-1" />
                            )}
                            {coupon.discountType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.discountType === "percent" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </TableCell>
                        <TableCell>
                          {coupon.usedCount} / {coupon.maxUsage}
                        </TableCell>
                        <TableCell>
                          {new Date(coupon.validTill).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={coupon.isValid && coupon.isActive ? "default" : "secondary"}
                            className={
                              coupon.isValid && coupon.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {coupon.isValid && coupon.isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Valid
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Invalid
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

