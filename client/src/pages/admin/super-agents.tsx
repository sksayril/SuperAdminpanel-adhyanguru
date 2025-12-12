import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, MapPin, Loader2, Users, Filter, CheckCircle2, XCircle, Eye, EyeOff, Key, Navigation, UserCheck, Upload, X, Image as ImageIcon, Target, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getSuperAgents, 
  createSuperAgent, 
  updateSuperAgent, 
  deleteSuperAgent,
  getSuperAgentById,
  getAgentLevels,
  type SuperAgent, 
  type CreateSuperAgentData, 
  type UpdateSuperAgentData,
  type Area,
  type AgentLevelFull,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useLocation } from "wouter";

// Dynamically import the LeafletMap component to avoid initialization issues
const LeafletMap = lazy(() => import('@/components/LeafletMap'));

export default function SuperAgentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSuperAgent, setSelectedSuperAgent] = useState<SuperAgent | null>(null);
  const [superAgentToDelete, setSuperAgentToDelete] = useState<SuperAgent | null>(null);
  const [superAgentToShowMap, setSuperAgentToShowMap] = useState<SuperAgent | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState({ latitude: 22.5726, longitude: 88.3639 }); // Default to Kolkata
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<{
    isActive?: boolean;
    level?: string;
  }>({});
  const [formData, setFormData] = useState<CreateSuperAgentData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    area: {
      areaname: "",
      city: "",
      pincode: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
  });
  const [editFormData, setEditFormData] = useState<UpdateSuperAgentData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data: superAgentsResponse, isLoading } = useQuery({
    queryKey: ["/api/super-admin/super-agents", page, limit, filters],
    queryFn: async () => {
      return await getSuperAgents({ ...filters, page, limit });
    },
  });

  // Fetch agent levels for dropdown
  const { data: levelsResponse } = useQuery({
    queryKey: ["/api/super-admin/agent-levels", { isActive: true }],
    queryFn: async () => {
      return await getAgentLevels({ isActive: true, limit: 100 });
    },
  });

  const agentLevels: AgentLevelFull[] = levelsResponse?.data?.items || [];

  const createSuperAgentMutation = useMutation({
    mutationFn: createSuperAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/super-agents"] });
      toast({
        title: "Success",
        description: "Super Agent created successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        area: {
          areaname: "",
          city: "",
          pincode: "",
          coordinates: { latitude: 0, longitude: 0 },
        },
      });
      setImagePreview(null);
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create super agent",
        variant: "destructive",
      });
    },
  });

  const updateSuperAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSuperAgentData }) => updateSuperAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/super-agents"] });
      toast({
        title: "✓ Success",
        description: "Super Agent updated successfully",
        className: "bg-green-50 border-green-200",
      });
      setIsEditDialogOpen(false);
      setSelectedSuperAgent(null);
      setEditFormData({});
      setEditImagePreview(null);
      setEditErrors({});
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update super agent",
        variant: "destructive",
      });
    },
  });

  const deleteSuperAgentMutation = useMutation({
    mutationFn: (id: string) => deleteSuperAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/super-agents"] });
      toast({
        title: "✓ Super Agent deleted successfully",
        description: "The super agent account has been removed",
        className: "bg-green-50 border-green-200",
      });
      setIsDeleteDialogOpen(false);
      setSuperAgentToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete super agent",
        variant: "destructive",
      });
    },
  });

  const superAgents: SuperAgent[] = superAgentsResponse?.data?.items || [];
  const pagination = superAgentsResponse?.data?.pagination;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("area.")) {
      const field = name.split(".")[1];
      if (field === "coordinates.latitude" || field === "coordinates.longitude") {
        const coordField = field.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          area: {
            ...prev.area,
            coordinates: {
              ...prev.area.coordinates,
              [coordField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          area: {
            ...prev.area,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("area.")) {
      const field = name.split(".")[1];
      if (field === "coordinates.latitude" || field === "coordinates.longitude") {
        const coordField = field.split(".")[1];
        setEditFormData((prev) => ({
          ...prev,
          area: {
            ...(prev.area || selectedSuperAgent?.area || {
              areaname: "",
              city: "",
              pincode: "",
              coordinates: { latitude: 0, longitude: 0 },
            }),
            coordinates: {
              ...(prev.area?.coordinates || selectedSuperAgent?.area?.coordinates || { latitude: 0, longitude: 0 }),
              [coordField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setEditFormData((prev) => ({
          ...prev,
          area: {
            ...(prev.area || selectedSuperAgent?.area || {
              areaname: "",
              city: "",
              pincode: "",
              coordinates: { latitude: 0, longitude: 0 },
            }),
            [field]: value,
          },
        }));
      }
    } else if (name === "currentTarget") {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setEditErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }
      setEditFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (editErrors.image) {
        setEditErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeEditImage = () => {
    setEditFormData((prev) => ({ ...prev, image: undefined }));
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search location",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const selectLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setTempCoordinates({ latitude: lat, longitude: lon });
    setFormData((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        coordinates: { latitude: lat, longitude: lon },
        areaname: result.display_name.split(",")[0] || prev.area.areaname,
        city: result.address?.city || result.address?.town || result.address?.village || prev.area.city,
        pincode: result.address?.postcode || prev.area.pincode,
      },
    }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const selectEditLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setTempCoordinates({ latitude: lat, longitude: lon });
    setEditFormData((prev) => ({
      ...prev,
      area: {
        ...(prev.area || selectedSuperAgent?.area || {
          areaname: "",
          city: "",
          pincode: "",
          coordinates: { latitude: 0, longitude: 0 },
        }),
        coordinates: { latitude: lat, longitude: lon },
        areaname: result.display_name.split(",")[0] || prev.area?.areaname || selectedSuperAgent?.area?.areaname || "",
        city: result.address?.city || result.address?.town || result.address?.village || prev.area?.city || selectedSuperAgent?.area?.city || "",
        pincode: result.address?.postcode || prev.area?.pincode || selectedSuperAgent?.area?.pincode || "",
      },
    }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setTempCoordinates({ latitude: lat, longitude: lng });
    
    if (selectedSuperAgent) {
      // Editing mode
      setEditFormData((prev) => ({
        ...prev,
        area: {
          ...(prev.area || selectedSuperAgent?.area || {
            areaname: "",
            city: "",
            pincode: "",
            coordinates: { latitude: 0, longitude: 0 },
          }),
          coordinates: { latitude: lat, longitude: lng },
        },
      }));
    } else {
      // Creating mode
      setFormData((prev) => ({
        ...prev,
        area: {
          ...prev.area,
          coordinates: { latitude: lat, longitude: lng },
        },
      }));
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
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.area.areaname.trim()) {
      newErrors["area.areaname"] = "Area name is required";
    }

    if (!formData.area.city.trim()) {
      newErrors["area.city"] = "City is required";
    }

    if (!formData.area.pincode.trim()) {
      newErrors["area.pincode"] = "Pincode is required";
    }

    if (formData.area.coordinates.latitude === 0 && formData.area.coordinates.longitude === 0) {
      newErrors["area.coordinates"] = "Please select a location on the map";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createSuperAgentMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuperAgent) {
      updateSuperAgentMutation.mutate({ id: selectedSuperAgent._id, data: editFormData });
    }
  };

  const handleEditClick = (superAgent: SuperAgent) => {
    setSelectedSuperAgent(superAgent);
    setEditFormData({
      name: superAgent.name,
      phone: superAgent.phone,
      level: superAgent.level?._id,
      currentTarget: superAgent.currentTarget,
      isActive: superAgent.isActive,
      area: superAgent.area,
    });
    if (superAgent.image) {
      setEditImagePreview(`${API_BASE_URL}${superAgent.image}`);
    }
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (superAgent: SuperAgent) => {
    setSuperAgentToDelete(superAgent);
    setIsDeleteDialogOpen(true);
  };

  const handleViewMap = (superAgent: SuperAgent) => {
    setSuperAgentToShowMap(superAgent);
    setIsMapDialogOpen(true);
  };

  useEffect(() => {
    if (isMapPickerOpen && selectedSuperAgent) {
      setTempCoordinates(
        editFormData.area?.coordinates || selectedSuperAgent.area?.coordinates || { latitude: 22.5726, longitude: 88.3639 }
      );
    } else if (isMapPickerOpen) {
      setTempCoordinates(formData.area.coordinates.latitude !== 0 && formData.area.coordinates.longitude !== 0
        ? formData.area.coordinates
        : { latitude: 22.5726, longitude: 88.3639 });
    }
  }, [isMapPickerOpen, selectedSuperAgent, editFormData.area, formData.area.coordinates]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg shadow-purple-600/30">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Agents</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage super agents and their details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all duration-300 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Super Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Super Agent</DialogTitle>
              <DialogDescription>Add a new super agent to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="level">Level (Optional)</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setLocation("/admin/agent-levels")}
                      className="h-auto p-0 text-blue-600"
                    >
                      Manage Levels →
                    </Button>
                  </div>
                  <select
                    id="level"
                    name="level"
                    value={formData.level || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value || undefined }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a level (optional)</option>
                    {agentLevels.map((level) => (
                      <option key={level._id} value={level._id}>
                        {level.levelName} (Level {level.levelNumber}) - {level.target} {level.targetType === "subscription_count" ? "subscriptions" : level.targetType === "revenue_amount" ? "revenue" : "students"} ({level.targetPeriod})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Area Information *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        name="area.areaname"
                        placeholder="Area Name"
                        value={formData.area.areaname}
                        onChange={handleChange}
                        className={errors["area.areaname"] ? "border-red-500" : ""}
                      />
                      {errors["area.areaname"] && <p className="text-sm text-red-500">{errors["area.areaname"]}</p>}
                    </div>
                    <div>
                      <Input
                        name="area.city"
                        placeholder="City"
                        value={formData.area.city}
                        onChange={handleChange}
                        className={errors["area.city"] ? "border-red-500" : ""}
                      />
                      {errors["area.city"] && <p className="text-sm text-red-500">{errors["area.city"]}</p>}
                    </div>
                    <div>
                      <Input
                        name="area.pincode"
                        placeholder="Pincode"
                        value={formData.area.pincode}
                        onChange={handleChange}
                        className={errors["area.pincode"] ? "border-red-500" : ""}
                      />
                      {errors["area.pincode"] && <p className="text-sm text-red-500">{errors["area.pincode"]}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location on Map *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            searchLocation();
                          }
                        }}
                      />
                      <Button type="button" onClick={searchLocation} disabled={searchLoading}>
                        {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectLocation(result)}
                          >
                            <p className="text-sm">{result.display_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsMapPickerOpen(true);
                        setTempCoordinates(formData.area.coordinates.latitude !== 0 && formData.area.coordinates.longitude !== 0
                          ? formData.area.coordinates
                          : { latitude: 22.5726, longitude: 88.3639 });
                      }}
                      className="w-full"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Pick Location on Map
                    </Button>
                    {formData.area.coordinates.latitude !== 0 && formData.area.coordinates.longitude !== 0 && (
                      <p className="text-sm text-gray-600">
                        Selected: {formData.area.coordinates.latitude.toFixed(6)}, {formData.area.coordinates.longitude.toFixed(6)}
                      </p>
                    )}
                    {errors["area.coordinates"] && <p className="text-sm text-red-500">{errors["area.coordinates"]}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                  {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
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
                      email: "",
                      phone: "",
                      password: "",
                      area: {
                        areaname: "",
                        city: "",
                        pincode: "",
                        coordinates: { latitude: 0, longitude: 0 },
                      },
                    });
                    setImagePreview(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSuperAgentMutation.isPending}>
                  {createSuperAgentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Super Agent"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Map Picker Dialog */}
      <Dialog open={isMapPickerOpen} onOpenChange={setIsMapPickerOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>Click on the map to select coordinates</DialogDescription>
          </DialogHeader>
          <div className="h-[500px] w-full rounded-lg overflow-hidden">
            <Suspense fallback={<div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>}>
              <LeafletMap
                latitude={tempCoordinates.latitude}
                longitude={tempCoordinates.longitude}
                onPositionChange={handleMarkerDragEnd}
              />
            </Suspense>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Coordinates: {tempCoordinates.latitude.toFixed(6)}, {tempCoordinates.longitude.toFixed(6)}
            </p>
            <Button onClick={() => setIsMapPickerOpen(false)}>Confirm Location</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Super Agent Location</DialogTitle>
            <DialogDescription>{superAgentToShowMap?.name}'s area location</DialogDescription>
          </DialogHeader>
          {superAgentToShowMap && (
            <div className="h-[500px] w-full rounded-lg overflow-hidden">
              <Suspense fallback={<div className="h-full w-full bg-gray-200 flex items-center justify-center">Loading map...</div>}>
                <LeafletMap
                  latitude={superAgentToShowMap.area.coordinates.latitude}
                  longitude={superAgentToShowMap.area.coordinates.longitude}
                  onPositionChange={() => {}} // No-op for view-only map
                />
              </Suspense>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Super Agent</DialogTitle>
            <DialogDescription>Update super agent information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editFormData.name || selectedSuperAgent?.name || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={editFormData.phone || selectedSuperAgent?.phone || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-level">Level (Optional)</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setLocation("/admin/agent-levels")}
                      className="h-auto p-0 text-blue-600"
                    >
                      Manage Levels →
                    </Button>
                  </div>
                  <select
                    id="edit-level"
                    name="level"
                    value={editFormData.level || selectedSuperAgent?.level?._id || ""}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, level: e.target.value || undefined }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No level assigned</option>
                    {agentLevels.map((level) => (
                      <option key={level._id} value={level._id}>
                        {level.levelName} (Level {level.levelNumber}) - {level.target} {level.targetType === "subscription_count" ? "subscriptions" : level.targetType === "revenue_amount" ? "revenue" : "students"} ({level.targetPeriod})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currentTarget">Current Target</Label>
                  <Input
                    id="edit-currentTarget"
                    name="currentTarget"
                    type="number"
                    value={editFormData.currentTarget !== undefined ? editFormData.currentTarget : selectedSuperAgent?.currentTarget || 0}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Area Information</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      name="area.areaname"
                      placeholder="Area Name"
                      value={editFormData.area?.areaname || selectedSuperAgent?.area?.areaname || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <Input
                      name="area.city"
                      placeholder="City"
                      value={editFormData.area?.city || selectedSuperAgent?.area?.city || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <Input
                      name="area.pincode"
                      placeholder="Pincode"
                      value={editFormData.area?.pincode || selectedSuperAgent?.area?.pincode || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location on Map</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchLocation();
                        }
                      }}
                    />
                    <Button type="button" onClick={searchLocation} disabled={searchLoading}>
                      {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectEditLocation(result)}
                        >
                          <p className="text-sm">{result.display_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsMapPickerOpen(true);
                      setTempCoordinates(
                        editFormData.area?.coordinates || selectedSuperAgent?.area?.coordinates || { latitude: 22.5726, longitude: 88.3639 }
                      );
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Pick Location on Map
                  </Button>
                  {(editFormData.area?.coordinates || selectedSuperAgent?.area?.coordinates) && (
                    <p className="text-sm text-gray-600">
                      Selected: {(editFormData.area?.coordinates || selectedSuperAgent?.area?.coordinates)?.latitude.toFixed(6)}, {(editFormData.area?.coordinates || selectedSuperAgent?.area?.coordinates)?.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Profile Image</Label>
                <div className="flex items-center gap-4">
                  {editImagePreview && (
                    <div className="relative">
                      <img src={editImagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeEditImage}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Input
                    ref={editFileInputRef}
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {editImagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  name="isActive"
                  checked={editFormData.isActive !== undefined ? editFormData.isActive : selectedSuperAgent?.isActive || false}
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
                  setSelectedSuperAgent(null);
                  setEditFormData({});
                  setEditImagePreview(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateSuperAgentMutation.isPending}>
                {updateSuperAgentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Super Agent"
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
            <AlertDialogTitle>Delete Super Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{superAgentToDelete?.name}"? This action cannot be undone.
              {superAgentToDelete?.agentCount && superAgentToDelete.agentCount > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This super agent has {superAgentToDelete.agentCount} agent(s) linked. Cannot delete if agents are linked.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSuperAgentMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => superAgentToDelete && deleteSuperAgentMutation.mutate(superAgentToDelete._id)}
              disabled={deleteSuperAgentMutation.isPending || (superAgentToDelete?.agentCount && superAgentToDelete.agentCount > 0)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSuperAgentMutation.isPending ? (
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
            <Input
              placeholder="Filter by level ID..."
              value={filters.level || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  level: e.target.value || undefined,
                }));
                setPage(1);
              }}
              className="h-9 w-48"
            />
            {(filters.isActive !== undefined || filters.level) && (
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

      {/* Super Agents Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : superAgents.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="flex flex-col items-center gap-2">
                <UserCheck className="h-12 w-12 text-gray-300" />
                <p className="font-medium">No super agents found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Super Agent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Level & Targets</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {superAgents.map((superAgent) => (
                      <TableRow key={superAgent._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={superAgent.image ? `${API_BASE_URL}${superAgent.image}` : undefined} />
                              <AvatarFallback>{superAgent.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{superAgent.name}</div>
                              <div className="text-sm text-gray-500">{superAgent.agentCode}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {superAgent.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {superAgent.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{superAgent.area.areaname}</div>
                            <div className="text-sm text-gray-500">{superAgent.area.city}, {superAgent.area.pincode}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMap(superAgent)}
                              className="h-6 text-xs p-0 text-blue-600 hover:text-blue-700"
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              View Map
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {superAgent.level ? (
                            <div className="space-y-1">
                              <Badge 
                                variant="outline" 
                                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                onClick={() => setLocation("/admin/agent-levels")}
                              >
                                {superAgent.level.levelName}
                              </Badge>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Target: {(superAgent.currentTarget || 0).toLocaleString()}
                                </div>
                                {superAgent.achievedTarget !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Achieved: {superAgent.achievedTarget.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No level assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={superAgent.isActive ? "default" : "secondary"}
                            className={superAgent.isActive ? "bg-green-100 text-green-700" : ""}
                          >
                            {superAgent.isActive ? (
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
                          {superAgent.agentCount !== undefined && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {superAgent.agentCount} agent(s)
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(superAgent)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(superAgent)}
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
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} super agents
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
    </div>
  );
}

