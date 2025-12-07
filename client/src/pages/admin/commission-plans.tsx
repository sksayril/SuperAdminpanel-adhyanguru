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
import { Plus, Edit, Trash2, Loader2, Percent, XCircle, CheckCircle2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCommissionPlans,
  createCommissionPlan,
  updateCommissionPlan,
  deleteCommissionPlan,
  getAgents,
  assignPlanToAgent,
  getAgentPlans,
  removePlanFromAgent,
  type CommissionPlan,
  type CreateCommissionPlanData,
  type UpdateCommissionPlanData,
  type Agent,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CommissionPlansManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CommissionPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<CommissionPlan | null>(null);
  const [formData, setFormData] = useState<CreateCommissionPlanData>({
    name: "",
    description: "",
    level1_pct: 0,
    level2_pct: 0,
    level3_pct: 0,
    platform_pct: 0,
    auto_calculate_platform: true,
    is_active: true,
  });
  const [editFormData, setEditFormData] = useState<UpdateCommissionPlanData>({});
  const [assignData, setAssignData] = useState({ agentId: "", planId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: plansResponse, isLoading } = useQuery({
    queryKey: ["/api/super-admin/commission-plans"],
    queryFn: async () => {
      return await getCommissionPlans();
    },
  });

  const { data: agentsResponse } = useQuery({
    queryKey: ["/api/super-admin/agents"],
    queryFn: async () => {
      return await getAgents();
    },
  });

  const { data: agentPlansResponse } = useQuery({
    queryKey: ["/api/super-admin/agent-plans"],
    queryFn: async () => {
      return await getAgentPlans();
    },
  });

  const plans: CommissionPlan[] = Array.isArray(plansResponse?.data) ? plansResponse.data : [];
  const agents: Agent[] = Array.isArray(agentsResponse?.data) ? agentsResponse.data : (agentsResponse?.data?.items || []);
  const agentPlans: any[] = Array.isArray(agentPlansResponse?.data) 
    ? agentPlansResponse.data 
    : (agentPlansResponse?.data as any)?.items || [];

  const createPlanMutation = useMutation({
    mutationFn: createCommissionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/commission-plans"] });
      toast({
        title: "Success",
        description: "Commission plan created successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        level1_pct: 0,
        level2_pct: 0,
        level3_pct: 0,
        platform_pct: 0,
        auto_calculate_platform: true,
        is_active: true,
      });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create commission plan",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionPlanData }) =>
      updateCommissionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/commission-plans"] });
      toast({
        title: "Success",
        description: "Commission plan updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
      setEditFormData({});
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update commission plan",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => deleteCommissionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/commission-plans"] });
      toast({
        title: "Success",
        description: "Commission plan deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete commission plan",
        variant: "destructive",
      });
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: assignPlanToAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agent-plans"] });
      toast({
        title: "Success",
        description: "Plan assigned to agent successfully",
      });
      setIsAssignDialogOpen(false);
      setAssignData({ agentId: "", planId: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign plan",
        variant: "destructive",
      });
    },
  });

  const removePlanMutation = useMutation({
    mutationFn: removePlanFromAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/agent-plans"] });
      toast({
        title: "Success",
        description: "Plan removed from agent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove plan",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (plan: CommissionPlan) => {
    setSelectedPlan(plan);
    setEditFormData({
      name: plan.name,
      description: plan.description,
      level1_pct: plan.level1_pct,
      level2_pct: plan.level2_pct,
      level3_pct: plan.level3_pct,
      platform_pct: plan.platform_pct,
      auto_calculate_platform: plan.auto_calculate_platform,
      is_active: plan.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (plan: CommissionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignClick = (plan: CommissionPlan) => {
    setAssignData({ agentId: "", planId: plan._id });
    setIsAssignDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const total = formData.level1_pct + formData.level2_pct + formData.level3_pct;

    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
    }

    if (total > 100) {
      newErrors.total = "Sum of level percentages cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (formData.auto_calculate_platform) {
        const total = formData.level1_pct + formData.level2_pct + formData.level3_pct;
        formData.platform_pct = 100 - total;
      }
      createPlanMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan._id, data: editFormData });
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignData.agentId && assignData.planId) {
      assignPlanMutation.mutate(assignData);
    }
  };

  const getPlanForAgent = (agentId: string) => {
    return agentPlans.find((ap: any) => ap.agentId === agentId);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <Percent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commission Plans</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage commission distribution plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Commission Plan</DialogTitle>
              <DialogDescription>Define commission percentages for different levels</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Standard Commission Plan"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Plan description..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level1_pct">Level 1 (%)</Label>
                    <Input
                      id="level1_pct"
                      name="level1_pct"
                      type="number"
                      placeholder="50"
                      value={formData.level1_pct}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, level1_pct: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level2_pct">Level 2 (%)</Label>
                    <Input
                      id="level2_pct"
                      name="level2_pct"
                      type="number"
                      placeholder="30"
                      value={formData.level2_pct}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, level2_pct: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level3_pct">Level 3 (%)</Label>
                    <Input
                      id="level3_pct"
                      name="level3_pct"
                      type="number"
                      placeholder="15"
                      value={formData.level3_pct}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, level3_pct: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                {errors.total && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {errors.total}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="platform_pct">Platform (%)</Label>
                  <Input
                    id="platform_pct"
                    name="platform_pct"
                    type="number"
                    placeholder="5"
                    value={formData.platform_pct}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, platform_pct: parseFloat(e.target.value) || 0 }))
                    }
                    disabled={formData.auto_calculate_platform}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_calculate_platform"
                    checked={formData.auto_calculate_platform}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, auto_calculate_platform: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="auto_calculate_platform">Auto-calculate platform percentage</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({
                      name: "",
                      description: "",
                      level1_pct: 0,
                      level2_pct: 0,
                      level3_pct: 0,
                      platform_pct: 0,
                      auto_calculate_platform: true,
                      is_active: true,
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPlanMutation.isPending}>
                  {createPlanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Plan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Commission Plan</DialogTitle>
            <DialogDescription>Update commission percentages</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || selectedPlan?.name || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level1_pct">Level 1 (%)</Label>
                  <Input
                    id="edit-level1_pct"
                    type="number"
                    value={editFormData.level1_pct !== undefined ? editFormData.level1_pct : selectedPlan?.level1_pct || 0}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, level1_pct: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level2_pct">Level 2 (%)</Label>
                  <Input
                    id="edit-level2_pct"
                    type="number"
                    value={editFormData.level2_pct !== undefined ? editFormData.level2_pct : selectedPlan?.level2_pct || 0}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, level2_pct: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level3_pct">Level 3 (%)</Label>
                  <Input
                    id="edit-level3_pct"
                    type="number"
                    value={editFormData.level3_pct !== undefined ? editFormData.level3_pct : selectedPlan?.level3_pct || 0}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, level3_pct: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedPlan(null);
                  setEditFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Plan to Agent</DialogTitle>
            <DialogDescription>Select an agent to assign this commission plan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent</Label>
                <Select
                  value={assignData.agentId}
                  onValueChange={(value) => setAssignData((prev) => ({ ...prev, agentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setAssignData({ agentId: "", planId: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={assignPlanMutation.isPending || !assignData.agentId}>
                {assignPlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Plan"
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
            <AlertDialogTitle>Delete Commission Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlanMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => planToDelete && deletePlanMutation.mutate(planToDelete._id)}
              disabled={deletePlanMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePlanMutation.isPending ? (
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

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Level 1</TableHead>
                    <TableHead>Level 2</TableHead>
                    <TableHead>Level 3</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Percent className="h-12 w-12 text-gray-300" />
                          <p className="font-medium">No commission plans found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan._id}>
                        <TableCell className="font-semibold">{plan.name}</TableCell>
                        <TableCell>{plan.level1_pct}%</TableCell>
                        <TableCell>{plan.level2_pct}%</TableCell>
                        <TableCell>{plan.level3_pct}%</TableCell>
                        <TableCell>{plan.platform_pct}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={plan.is_active ? "default" : "secondary"}
                            className={plan.is_active ? "bg-green-100 text-green-700" : ""}
                          >
                            {plan.is_active ? (
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignClick(plan)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(plan)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Agent Plans Assignment Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Plan Assignments</h2>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(agentPlans) || agentPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-12">
                      No agent plan assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  agentPlans.map((ap: any) => {
                    const agent = agents.find((a) => a._id === ap.agentId);
                    const plan = plans.find((p) => p._id === ap.planId);
                    return (
                      <TableRow key={ap._id}>
                        <TableCell>{agent?.name || ap.agentId}</TableCell>
                        <TableCell>{plan?.name || ap.planId}</TableCell>
                        <TableCell>
                          {new Date(ap.assignedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removePlanMutation.mutate({ agentId: ap.agentId, planId: ap.planId })
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

