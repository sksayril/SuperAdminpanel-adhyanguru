import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, Edit, Trash2, MoreHorizontal, Loader2, CheckCircle2, XCircle, Target, TrendingUp, Award, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getAgentLevels, 
  createAgentLevel, 
  updateAgentLevel, 
  deleteAgentLevel,
  type AgentLevelFull, 
  type CreateAgentLevelData, 
  type UpdateAgentLevelData,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AgentLevelManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AgentLevelFull | null>(null);
  const [levelToDelete, setLevelToDelete] = useState<AgentLevelFull | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<{
    isActive?: boolean;
  }>({});
  const [formData, setFormData] = useState<CreateAgentLevelData>({
    levelNumber: 1,
    levelName: "",
    description: "",
    target: 0,
    targetType: "subscription_count",
    targetPeriod: "monthly",
    benefits: [],
  });
  const [editFormData, setEditFormData] = useState<UpdateAgentLevelData>({});
  const [benefitInput, setBenefitInput] = useState("");
  const [editBenefitInput, setEditBenefitInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const { data: levelsResponse, isLoading } = useQuery({
    queryKey: ["/api/super-admin/agent-levels", page, limit, filters],
    queryFn: async () => {
      return await getAgentLevels({ ...filters, page, limit });
    },
  });

  const createLevelMutation = useMutation({
    mutationFn: createAgentLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agent-levels"] });
      toast({
        title: "Success",
        description: "Agent level created successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        levelNumber: 1,
        levelName: "",
        description: "",
        target: 0,
        targetType: "subscription_count",
        targetPeriod: "monthly",
        benefits: [],
      });
      setBenefitInput("");
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent level",
        variant: "destructive",
      });
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentLevelData }) => updateAgentLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agent-levels"] });
      toast({
        title: "✓ Success",
        description: "Agent level updated successfully",
        className: "bg-green-50 border-green-200",
      });
      setIsEditDialogOpen(false);
      setSelectedLevel(null);
      setEditFormData({});
      setEditBenefitInput("");
      setEditErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent level",
        variant: "destructive",
      });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: string) => deleteAgentLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agent-levels"] });
      toast({
        title: "✓ Agent level deleted successfully",
        description: "The agent level has been removed",
        className: "bg-green-50 border-green-200",
      });
      setIsDeleteDialogOpen(false);
      setLevelToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete agent level",
        variant: "destructive",
      });
    },
  });

  const levels: AgentLevelFull[] = levelsResponse?.data?.items || [];
  const pagination = levelsResponse?.data?.pagination;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "levelNumber" || name === "target") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "target") {
      setEditFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "isActive") {
      setEditFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefitInput.trim()],
      }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || [],
    }));
  };

  const addEditBenefit = () => {
    if (editBenefitInput.trim()) {
      setEditFormData((prev) => ({
        ...prev,
        benefits: [...(prev.benefits || selectedLevel?.benefits || []), editBenefitInput.trim()],
      }));
      setEditBenefitInput("");
    }
  };

  const removeEditBenefit = (index: number) => {
    const currentBenefits = editFormData.benefits || selectedLevel?.benefits || [];
    setEditFormData((prev) => ({
      ...prev,
      benefits: currentBenefits.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.levelNumber || formData.levelNumber < 1) {
      newErrors.levelNumber = "Level number must be at least 1";
    }

    if (!formData.levelName.trim()) {
      newErrors.levelName = "Level name is required";
    }

    if (formData.target < 0) {
      newErrors.target = "Target must be 0 or greater";
    }

    if (!formData.targetType) {
      newErrors.targetType = "Target type is required";
    }

    if (!formData.targetPeriod) {
      newErrors.targetPeriod = "Target period is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createLevelMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLevel) {
      updateLevelMutation.mutate({ id: selectedLevel._id, data: editFormData });
    }
  };

  const handleEditClick = (level: AgentLevelFull) => {
    setSelectedLevel(level);
    setEditFormData({
      levelName: level.levelName,
      description: level.description,
      target: level.target,
      targetType: level.targetType,
      targetPeriod: level.targetPeriod,
      benefits: level.benefits,
      isActive: level.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (level: AgentLevelFull) => {
    setLevelToDelete(level);
    setIsDeleteDialogOpen(true);
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case "subscription_count":
        return "Subscriptions";
      case "revenue_amount":
        return "Revenue";
      case "student_count":
        return "Students";
      default:
        return type;
    }
  };

  const getTargetPeriodLabel = (period: string) => {
    switch (period) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return "Yearly";
      default:
        return period;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 shadow-lg shadow-amber-600/30">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Levels</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage agent levels and their target requirements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 hover:from-amber-500 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40 transition-all duration-300 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent Level
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Agent Level</DialogTitle>
              <DialogDescription>Add a new agent level with target requirements</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="levelNumber">Level Number *</Label>
                    <Input
                      id="levelNumber"
                      name="levelNumber"
                      type="number"
                      min="1"
                      value={formData.levelNumber}
                      onChange={handleChange}
                      className={errors.levelNumber ? "border-red-500" : ""}
                    />
                    {errors.levelNumber && <p className="text-sm text-red-500">{errors.levelNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="levelName">Level Name *</Label>
                    <Input
                      id="levelName"
                      name="levelName"
                      placeholder="Bronze"
                      value={formData.levelName}
                      onChange={handleChange}
                      className={errors.levelName ? "border-red-500" : ""}
                    />
                    {errors.levelName && <p className="text-sm text-red-500">{errors.levelName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description of this level"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target *</Label>
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      min="0"
                      value={formData.target}
                      onChange={handleChange}
                      className={errors.target ? "border-red-500" : ""}
                    />
                    {errors.target && <p className="text-sm text-red-500">{errors.target}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetType">Target Type *</Label>
                    <select
                      id="targetType"
                      name="targetType"
                      value={formData.targetType}
                      onChange={handleChange}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.targetType ? "border-red-500" : ""}`}
                    >
                      <option value="subscription_count">Subscription Count</option>
                      <option value="revenue_amount">Revenue Amount</option>
                      <option value="student_count">Student Count</option>
                    </select>
                    {errors.targetType && <p className="text-sm text-red-500">{errors.targetType}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetPeriod">Target Period *</Label>
                  <select
                    id="targetPeriod"
                    name="targetPeriod"
                    value={formData.targetPeriod}
                    onChange={handleChange}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.targetPeriod ? "border-red-500" : ""}`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {errors.targetPeriod && <p className="text-sm text-red-500">{errors.targetPeriod}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a benefit..."
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBenefit();
                        }
                      }}
                    />
                    <Button type="button" onClick={addBenefit} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.benefits && formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {benefit}
                          <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({
                      levelNumber: 1,
                      levelName: "",
                      description: "",
                      target: 0,
                      targetType: "subscription_count",
                      targetPeriod: "monthly",
                      benefits: [],
                    });
                    setBenefitInput("");
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLevelMutation.isPending}>
                  {createLevelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Level"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={filters.isActive === undefined ? "all" : filters.isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  isActive: value === "all" ? undefined : value === "true",
                }));
                setPage(1);
              }}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            {filters.isActive !== undefined && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
                className="h-9"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Levels Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : levels.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="flex flex-col items-center gap-2">
                <Award className="h-12 w-12 text-gray-300" />
                <p className="font-medium">No agent levels found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Benefits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level) => (
                      <TableRow key={level._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{level.levelName}</div>
                            <div className="text-sm text-gray-500">Level {level.levelNumber}</div>
                            {level.description && (
                              <div className="text-xs text-gray-400 mt-1">{level.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{level.target.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{getTargetTypeLabel(level.targetType)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTargetPeriodLabel(level.targetPeriod)}</Badge>
                        </TableCell>
                        <TableCell>
                          {level.benefits && level.benefits.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {level.benefits.slice(0, 2).map((benefit, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                              {level.benefits.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{level.benefits.length - 2} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No benefits</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={level.isActive ? "default" : "secondary"}
                            className={level.isActive ? "bg-green-100 text-green-700" : ""}
                          >
                            {level.isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(level)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(level)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} levels
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Level</DialogTitle>
            <DialogDescription>Update agent level information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Level Number</Label>
                <Input
                  value={selectedLevel?.levelNumber || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Level number cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-levelName">Level Name</Label>
                <Input
                  id="edit-levelName"
                  name="levelName"
                  value={editFormData.levelName || selectedLevel?.levelName || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description !== undefined ? editFormData.description : selectedLevel?.description || ""}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target">Target</Label>
                  <Input
                    id="edit-target"
                    name="target"
                    type="number"
                    min="0"
                    value={editFormData.target !== undefined ? editFormData.target : selectedLevel?.target || 0}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-targetType">Target Type</Label>
                  <select
                    id="edit-targetType"
                    name="targetType"
                    value={editFormData.targetType || selectedLevel?.targetType || "subscription_count"}
                    onChange={handleEditChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="subscription_count">Subscription Count</option>
                    <option value="revenue_amount">Revenue Amount</option>
                    <option value="student_count">Student Count</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-targetPeriod">Target Period</Label>
                <select
                  id="edit-targetPeriod"
                  name="targetPeriod"
                  value={editFormData.targetPeriod || selectedLevel?.targetPeriod || "monthly"}
                  onChange={handleEditChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Benefits</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a benefit..."
                    value={editBenefitInput}
                    onChange={(e) => setEditBenefitInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditBenefit();
                      }
                    }}
                  />
                  <Button type="button" onClick={addEditBenefit} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(editFormData.benefits || selectedLevel?.benefits || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(editFormData.benefits || selectedLevel?.benefits || []).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeEditBenefit(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  name="isActive"
                  checked={editFormData.isActive !== undefined ? editFormData.isActive : selectedLevel?.isActive || false}
                  onChange={handleEditChange}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedLevel(null);
                  setEditFormData({});
                  setEditBenefitInput("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLevelMutation.isPending}>
                {updateLevelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Level"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{levelToDelete?.levelName}"? This action cannot be undone.
              <span className="block mt-2 text-red-600 font-semibold">
                Note: Cannot delete if any Super Agents are using this level.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLevelMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => levelToDelete && deleteLevelMutation.mutate(levelToDelete._id)}
              disabled={deleteLevelMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLevelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

