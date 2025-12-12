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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Edit, Trash2, Loader2, FolderTree, XCircle, CheckCircle2, Tag, ChevronRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getLevelCategories,
  createLevelCategory,
  updateLevelCategory,
  deleteLevelCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type LevelCategory,
  type Subcategory,
  type CreateLevelCategoryData,
  type UpdateLevelCategoryData,
  type CreateSubcategoryData,
  type UpdateSubcategoryData,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LevelCategoriesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [isEditSubcategoryDialogOpen, setIsEditSubcategoryDialogOpen] = useState(false);
  const [isDeleteSubcategoryDialogOpen, setIsDeleteSubcategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LevelCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<LevelCategory | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryFormData, setCategoryFormData] = useState<CreateLevelCategoryData>({
    categoryname: "",
    level: "",
    ui: 1,
  });
  const [editCategoryFormData, setEditCategoryFormData] = useState<UpdateLevelCategoryData>({});
  const [subcategoryFormData, setSubcategoryFormData] = useState<CreateSubcategoryData>({
    subcategoryname: "",
    isActive: true,
  });
  const [editSubcategoryFormData, setEditSubcategoryFormData] = useState<UpdateSubcategoryData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<{
    isActive?: boolean;
    level?: string;
    ui?: number;
  }>({});

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ["/api/level-categories", filters],
    queryFn: async () => {
      return await getLevelCategories(filters);
    },
  });

  const categories: LevelCategory[] = categoriesResponse?.data || [];

  const createCategoryMutation = useMutation({
    mutationFn: createLevelCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Level category created successfully",
      });
      setIsCategoryDialogOpen(false);
      setCategoryFormData({ categoryname: "", level: "", ui: 1 });
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create level category",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLevelCategoryData }) =>
      updateLevelCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Level category updated successfully",
      });
      setIsEditCategoryDialogOpen(false);
      setSelectedCategory(null);
      setEditCategoryFormData({});
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update level category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteLevelCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Level category deleted successfully",
      });
      setIsDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete level category",
        variant: "destructive",
      });
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: CreateSubcategoryData }) =>
      createSubcategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Subcategory created successfully",
      });
      setIsSubcategoryDialogOpen(false);
      setSubcategoryFormData({ subcategoryname: "", isActive: true });
      setParentCategoryId("");
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subcategory",
        variant: "destructive",
      });
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubcategoryData }) =>
      updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Subcategory updated successfully",
      });
      setIsEditSubcategoryDialogOpen(false);
      setSelectedSubcategory(null);
      setEditSubcategoryFormData({});
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory",
        variant: "destructive",
      });
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/level-categories"] });
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      setIsDeleteSubcategoryDialogOpen(false);
      setSubcategoryToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory",
        variant: "destructive",
      });
    },
  });

  const handleEditCategoryClick = (category: LevelCategory) => {
    setSelectedCategory(category);
    setEditCategoryFormData({
      categoryname: category.categoryname,
      isActive: category.isActive,
    });
    setIsEditCategoryDialogOpen(true);
  };

  const handleDeleteCategoryClick = (category: LevelCategory) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleCreateSubcategoryClick = (category: LevelCategory) => {
    setParentCategoryId(category._id);
    setIsSubcategoryDialogOpen(true);
  };

  const handleEditSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditSubcategoryFormData({
      subcategoryname: subcategory.subcategoryname,
      isActive: subcategory.isActive,
    });
    setIsEditSubcategoryDialogOpen(true);
  };

  const handleDeleteSubcategoryClick = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteSubcategoryDialogOpen(true);
  };

  const validateCategoryForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!categoryFormData.categoryname.trim()) {
      newErrors.categoryname = "Category name is required";
    } else if (categoryFormData.categoryname.trim().length < 2) {
      newErrors.categoryname = "Category name must be at least 2 characters";
    } else if (categoryFormData.categoryname.trim().length > 100) {
      newErrors.categoryname = "Category name must be less than 100 characters";
    }

    if (!categoryFormData.level.trim()) {
      newErrors.level = "Level is required";
    } else if (categoryFormData.level.trim().length < 1) {
      newErrors.level = "Level must be at least 1 character";
    } else if (categoryFormData.level.trim().length > 100) {
      newErrors.level = "Level must be less than 100 characters";
    }

    if (!categoryFormData.ui || (categoryFormData.ui !== 1 && categoryFormData.ui !== 2)) {
      newErrors.ui = "UI must be either 1 or 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSubcategoryForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subcategoryFormData.subcategoryname.trim()) {
      newErrors.subcategoryname = "Subcategory name is required";
    } else if (subcategoryFormData.subcategoryname.trim().length < 2) {
      newErrors.subcategoryname = "Subcategory name must be at least 2 characters";
    } else if (subcategoryFormData.subcategoryname.trim().length > 100) {
      newErrors.subcategoryname = "Subcategory name must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCategoryForm()) {
      createCategoryMutation.mutate(categoryFormData);
    }
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory._id, data: editCategoryFormData });
    }
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSubcategoryForm() && parentCategoryId) {
      createSubcategoryMutation.mutate({ categoryId: parentCategoryId, data: subcategoryFormData });
    }
  };

  const handleEditSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubcategory) {
      updateSubcategoryMutation.mutate({ id: selectedSubcategory._id, data: editSubcategoryFormData });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Level Categories</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage level categories and subcategories</p>
        </div>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Level Category</DialogTitle>
              <DialogDescription>Add a new level category</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryname">Category Name *</Label>
                  <Input
                    id="categoryname"
                    name="categoryname"
                    placeholder="Science"
                    value={categoryFormData.categoryname}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, categoryname: e.target.value }))
                    }
                    className={errors.categoryname ? "border-red-500" : ""}
                  />
                  {errors.categoryname && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.categoryname}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Input
                    id="level"
                    name="level"
                    placeholder="Main Category"
                    value={categoryFormData.level}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, level: e.target.value }))
                    }
                    className={errors.level ? "border-red-500" : ""}
                  />
                  {errors.level && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.level}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ui">UI Type *</Label>
                  <select
                    id="ui"
                    name="ui"
                    value={categoryFormData.ui}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({ ...prev, ui: parseInt(e.target.value) }))
                    }
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.ui ? "border-red-500" : ""}`}
                  >
                    <option value={1}>Type 1</option>
                    <option value={2}>Type 2</option>
                  </select>
                  {errors.ui && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {errors.ui}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCategoryDialogOpen(false);
                    setCategoryFormData({ categoryname: "", level: "", ui: 1 });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Level Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCategorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoryname">Category Name</Label>
                <Input
                  id="edit-categoryname"
                  value={editCategoryFormData.categoryname || selectedCategory?.categoryname || ""}
                  onChange={(e) =>
                    setEditCategoryFormData((prev) => ({ ...prev, categoryname: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level">Level</Label>
                <Input
                  id="edit-level"
                  value={editCategoryFormData.level || selectedCategory?.level || ""}
                  onChange={(e) =>
                    setEditCategoryFormData((prev) => ({ ...prev, level: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ui">UI Type</Label>
                <select
                  id="edit-ui"
                  name="ui"
                  value={editCategoryFormData.ui !== undefined ? editCategoryFormData.ui : selectedCategory?.ui || 1}
                  onChange={(e) =>
                    setEditCategoryFormData((prev) => ({ ...prev, ui: parseInt(e.target.value) }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1}>Type 1</option>
                  <option value={2}>Type 2</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editCategoryFormData.isActive !== undefined ? editCategoryFormData.isActive : selectedCategory?.isActive || false}
                  onChange={(e) =>
                    setEditCategoryFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
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
                  setIsEditCategoryDialogOpen(false);
                  setSelectedCategory(null);
                  setEditCategoryFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending}>
                {updateCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory to {categories.find((c) => c._id === parentCategoryId)?.categoryname || "category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubcategorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subcategoryname">Subcategory Name *</Label>
                <Input
                  id="subcategoryname"
                  name="subcategoryname"
                  placeholder="Physics"
                  value={subcategoryFormData.subcategoryname}
                  onChange={(e) =>
                    setSubcategoryFormData((prev) => ({ ...prev, subcategoryname: e.target.value }))
                  }
                  className={errors.subcategoryname ? "border-red-500" : ""}
                />
                {errors.subcategoryname && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {errors.subcategoryname}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subcategory-isActive"
                  checked={subcategoryFormData.isActive}
                  onChange={(e) =>
                    setSubcategoryFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded"
                />
                <Label htmlFor="subcategory-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSubcategoryDialogOpen(false);
                  setSubcategoryFormData({ subcategoryname: "", isActive: true });
                  setParentCategoryId("");
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSubcategoryMutation.isPending}>
                {createSubcategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Subcategory
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubcategoryDialogOpen} onOpenChange={setIsEditSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>Update subcategory information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubcategorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subcategoryname">Subcategory Name</Label>
                <Input
                  id="edit-subcategoryname"
                  value={editSubcategoryFormData.subcategoryname || selectedSubcategory?.subcategoryname || ""}
                  onChange={(e) =>
                    setEditSubcategoryFormData((prev) => ({ ...prev, subcategoryname: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-subcategory-isActive"
                  checked={editSubcategoryFormData.isActive !== undefined ? editSubcategoryFormData.isActive : selectedSubcategory?.isActive || false}
                  onChange={(e) =>
                    setEditSubcategoryFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-subcategory-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditSubcategoryDialogOpen(false);
                  setSelectedSubcategory(null);
                  setEditSubcategoryFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateSubcategoryMutation.isPending}>
                {updateSubcategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Subcategory"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{categoryToDelete?.categoryname}"? This action cannot be undone and will also delete all subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && deleteCategoryMutation.mutate(categoryToDelete._id)}
              disabled={deleteCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCategoryMutation.isPending ? (
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

      {/* Delete Subcategory Confirmation Dialog */}
      <AlertDialog open={isDeleteSubcategoryDialogOpen} onOpenChange={setIsDeleteSubcategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subcategoryToDelete?.subcategoryname}"? This will set it to inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubcategoryMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subcategoryToDelete && deleteSubcategoryMutation.mutate(subcategoryToDelete._id)}
              disabled={deleteSubcategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSubcategoryMutation.isPending ? (
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
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filters.isActive === undefined ? "all" : filters.isActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    isActive: value === "all" ? undefined : value === "true",
                  }));
                }}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select
                value={filters.ui === undefined ? "all" : filters.ui.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    ui: value === "all" ? undefined : parseInt(value),
                  }));
                }}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">All UI Types</option>
                <option value="1">UI Type 1</option>
                <option value="2">UI Type 2</option>
              </select>
              <Input
                placeholder="Filter by level..."
                value={filters.level || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    level: e.target.value || undefined,
                  }))
                }
                className="h-9 w-48"
              />
              {(filters.isActive !== undefined || filters.ui !== undefined || filters.level) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({})}
                  className="h-9"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="flex flex-col items-center gap-2">
                <FolderTree className="h-12 w-12 text-gray-300" />
                <p className="font-medium">No level categories found</p>
              </div>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category._id} value={category._id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <FolderTree className="h-5 w-5 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{category.categoryname}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{category.level}</span>
                            <Badge variant="outline" className="text-xs">
                              UI: {category.ui}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                          className={category.isActive ? "bg-green-100 text-green-700" : ""}
                        >
                          {category.isActive ? (
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
                        {category.subcategories && category.subcategories.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {category.subcategories.length} subcategor{category.subcategories.length > 1 ? "ies" : "y"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateSubcategoryClick(category)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Subcategory
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategoryClick(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategoryClick(category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 pl-8">
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <div className="rounded-xl border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subcategory Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {category.subcategories.map((subcategory) => (
                                <TableRow key={subcategory._id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-4 w-4 text-gray-400" />
                                      {subcategory.subcategoryname}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={subcategory.isActive ? "default" : "secondary"}
                                      className={subcategory.isActive ? "bg-green-100 text-green-700" : ""}
                                    >
                                      {subcategory.isActive ? (
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
                                    {new Date(subcategory.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditSubcategoryClick(subcategory)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteSubcategoryClick(subcategory)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8 border rounded-lg">
                          <Tag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">No subcategories yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => handleCreateSubcategoryClick(category)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Subcategory
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

