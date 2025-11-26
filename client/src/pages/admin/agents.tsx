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
import { Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, MapPin, Loader2, Users, Filter, CheckCircle2, XCircle, Eye, EyeOff, Key, Navigation, UserCheck, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getAgents, createAgent, updateAgent, deleteAgent, type Agent, type CreateAgentData, type UpdateAgentData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the LeafletMap component to avoid initialization issues
const LeafletMap = lazy(() => import('@/components/LeafletMap'));

export default function AgentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [agentToShowMap, setAgentToShowMap] = useState<Agent | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState({ latitude: 22.5726, longitude: 88.3639 }); // Default to Kolkata
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<CreateAgentData>({
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
  const [editFormData, setEditFormData] = useState<UpdateAgentData>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = (agentId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const { data: agentsResponse, isLoading } = useQuery({
    queryKey: ["/api/agents"],
    queryFn: async () => {
      return await getAgents();
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Success",
        description: "Agent created successfully",
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
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentData }) => updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "✓ Success",
        description: "Agent updated successfully",
        className: "bg-green-50 border-green-200",
      });
      setIsEditDialogOpen(false);
      setSelectedAgent(null);
      setEditFormData({ name: "", email: "", phone: "", password: "" });
      setEditImagePreview(null);
      setEditErrors({});
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "✓ Agent deleted successfully",
        description: "The agent account has been removed",
        className: "bg-green-50 border-green-200",
      });
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete agent",
        variant: "destructive",
      });
    },
  });

  const agents: Agent[] = agentsResponse?.data || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("area.")) {
      const areaField = name.split(".")[1];
      if (areaField === "latitude" || areaField === "longitude") {
        setFormData((prev) => ({
          ...prev,
          area: {
            ...prev.area,
            coordinates: {
              ...prev.area.coordinates,
              [areaField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          area: {
            ...prev.area,
            [areaField]: value,
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
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      // Validate file size (max 5MB)
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }
      // Validate file size (max 5MB)
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

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      password: "", // Leave empty - user can optionally change it
    });
    setEditImagePreview(agent.image || null);
    setEditErrors({});
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (agentToDelete) {
      deleteAgentMutation.mutate(agentToDelete._id);
    }
  };

  const handleShowMap = (agent: Agent) => {
    setAgentToShowMap(agent);
    setIsMapDialogOpen(true);
  };

  const handleOpenMapPicker = () => {
    // Set temp coordinates to current form values or default
    setTempCoordinates({
      latitude: formData.area.coordinates.latitude || 22.5726,
      longitude: formData.area.coordinates.longitude || 88.3639,
    });
    setSearchQuery("");
    setSearchResults([]);
    setMapReady(false);
    setIsMapPickerOpen(true);
    // Delay map rendering to ensure dialog is fully mounted and lazy loading completes
    setTimeout(() => {
      setMapReady(true);
    }, 300);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setTempCoordinates({
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search required",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length > 0) {
        toast({
          title: "✓ Search complete",
          description: `Found ${data.length} result${data.length > 1 ? 's' : ''}`,
          className: "bg-green-50 border-green-200",
        });
      } else {
        toast({
          title: "No results",
          description: "Try a different search query",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search location",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setTempCoordinates({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
    setSearchResults([]);
    setSearchQuery("");
    toast({
      title: "✓ Location selected",
      description: result.display_name,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleSelectCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        coordinates: tempCoordinates,
      },
    }));
    setMapReady(false);
    setIsMapPickerOpen(false);
    toast({
      title: "✓ Coordinates selected",
      description: `Lat: ${tempCoordinates.latitude.toFixed(6)}, Lon: ${tempCoordinates.longitude.toFixed(6)}`,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleCloseMapPicker = () => {
    setMapReady(false);
    setIsMapPickerOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
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
    if (!formData.area.areaname.trim()) newErrors["area.areaname"] = "Area name is required";
    if (!formData.area.city.trim()) newErrors["area.city"] = "City is required";
    if (!formData.area.pincode.trim()) newErrors["area.pincode"] = "Pincode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createAgentMutation.mutate(formData);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgent) {
      const updateData: UpdateAgentData = {};
      if (editFormData.name) updateData.name = editFormData.name;
      if (editFormData.email) updateData.email = editFormData.email;
      if (editFormData.phone) updateData.phone = editFormData.phone;
      if (editFormData.password) updateData.password = editFormData.password;

      updateAgentMutation.mutate({ id: selectedAgent._id, data: updateData });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Agent Management</h1>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage agent accounts and their service areas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="button-add-agent"
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 h-11 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl">Create New Agent</DialogTitle>
                  <DialogDescription className="text-blue-100 mt-1">
                    Add a new agent with service area details
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
                    placeholder="Samrin Sultana"
                    value={formData.name}
                    onChange={handleChange}
                    className={`h-11 ${errors.name ? "border-red-500" : "focus:border-blue-600"}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="sarom@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`h-11 ${errors.email ? "border-red-500" : "focus:border-blue-600"}`}
                    />
                    {errors.email && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="9632589632"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`h-11 ${errors.phone ? "border-red-500" : "focus:border-blue-600"}`}
                    />
                    {errors.phone && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors.phone}</p>}
                  </div>
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
                    className={`h-11 ${errors.password ? "border-red-500" : "focus:border-blue-600"}`}
                  />
                  {errors.password && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-semibold text-gray-700">Profile Image <span className="text-gray-500 text-xs font-normal">(Optional)</span></Label>
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          id="image"
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {errors.image && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors.image}</p>}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Service Area Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="area.areaname" className="text-sm font-semibold text-gray-700">Area Name *</Label>
                      <Input
                        id="area.areaname"
                        name="area.areaname"
                        placeholder="Barasarsa"
                        value={formData.area.areaname}
                        onChange={handleChange}
                        className={`h-11 ${errors["area.areaname"] ? "border-red-500" : "focus:border-blue-600"}`}
                      />
                      {errors["area.areaname"] && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors["area.areaname"]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area.city" className="text-sm font-semibold text-gray-700">City *</Label>
                        <Input
                          id="area.city"
                          name="area.city"
                          placeholder="Kolkata"
                          value={formData.area.city}
                          onChange={handleChange}
                          className={`h-11 ${errors["area.city"] ? "border-red-500" : "focus:border-blue-600"}`}
                        />
                        {errors["area.city"] && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors["area.city"]}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area.pincode" className="text-sm font-semibold text-gray-700">Pincode *</Label>
                        <Input
                          id="area.pincode"
                          name="area.pincode"
                          placeholder="712147"
                          value={formData.area.pincode}
                          onChange={handleChange}
                          className={`h-11 ${errors["area.pincode"] ? "border-red-500" : "focus:border-blue-600"}`}
                        />
                        {errors["area.pincode"] && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{errors["area.pincode"]}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-700">GPS Coordinates</Label>
                        <Button
                          type="button"
                          onClick={handleOpenMapPicker}
                          variant="outline"
                          className="h-9 px-4 border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Pick from Map
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="area.latitude" className="text-xs text-gray-600">Latitude</Label>
                          <Input
                            id="area.latitude"
                            name="area.latitude"
                            type="number"
                            step="any"
                            placeholder="22.5726"
                            value={formData.area.coordinates.latitude}
                            onChange={handleChange}
                            className="h-11 focus:border-blue-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="area.longitude" className="text-xs text-gray-600">Longitude</Label>
                          <Input
                            id="area.longitude"
                            name="area.longitude"
                            type="number"
                            step="any"
                            placeholder="88.3639"
                            value={formData.area.coordinates.longitude}
                            onChange={handleChange}
                            className="h-11 focus:border-blue-600"
                          />
                        </div>
                      </div>
                      
                      {(formData.area.coordinates.latitude !== 0 || formData.area.coordinates.longitude !== 0) && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Navigation className="h-4 w-4" />
                            <span className="font-medium">Selected: {formData.area.coordinates.latitude.toFixed(6)}, {formData.area.coordinates.longitude.toFixed(6)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 pt-4 bg-gray-50 border-t">
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
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="h-11 px-6 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/30"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Agent
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl">Edit Agent</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  Update agent information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Agent Name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="h-11 focus:border-blue-600"
                />
                {editErrors.name && <p className="text-sm text-red-600">{editErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold text-gray-700">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="agent@example.com"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className="h-11 focus:border-blue-600"
                />
                {editErrors.email && <p className="text-sm text-red-600">{editErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  placeholder="9876543210"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className="h-11 focus:border-blue-600"
                />
                {editErrors.phone && <p className="text-sm text-red-600">{editErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm font-semibold text-gray-700">
                  Password <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>
                </Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  value={editFormData.password}
                  onChange={handleEditChange}
                  className="h-11 focus:border-blue-600"
                />
                {editErrors.password && <p className="text-sm text-red-600">{editErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image" className="text-sm font-semibold text-gray-700">
                  Profile Image <span className="text-gray-500 text-xs font-normal">(Optional - Leave unchanged to keep current)</span>
                </Label>
                {editImagePreview ? (
                  <div className="relative">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeEditImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {selectedAgent?.image && !editFormData.image && (
                      <p className="text-xs text-gray-500 mt-1">Current image will be kept</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {selectedAgent?.image ? (
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                          <img
                            src={selectedAgent.image}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-600">Current image</p>
                          <label
                            htmlFor="edit-image"
                            className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors text-sm"
                          >
                            <Upload className="w-4 h-4 mr-2 text-gray-400" />
                            Change Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="edit-image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </label>
                    )}
                    <input
                      id="edit-image"
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </div>
                )}
                {editErrors.image && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{editErrors.image}</p>}
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedAgent(null);
                  setEditFormData({ name: "", email: "", phone: "", password: "" });
                  setEditImagePreview(null);
                  setEditErrors({});
                  if (editFileInputRef.current) {
                    editFileInputRef.current.value = '';
                  }
                }}
                className="h-11 px-6 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateAgentMutation.isPending}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-600/30"
              >
                {updateAgentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Agent
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Agent</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{agentToDelete?.name}</span>? 
              This action cannot be undone and will permanently remove the agent account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAgentMutation.isPending} className="h-11 px-6">
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteAgentMutation.isPending}
              className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteAgentMutation.isPending ? (
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

      {/* Map View Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl">{agentToShowMap?.name}'s Location</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  {agentToShowMap?.area.areaname}, {agentToShowMap?.area.city}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {/* Location Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="text-base font-semibold text-gray-900">{agentToShowMap?.area.areaname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="text-base font-semibold text-gray-900">{agentToShowMap?.area.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pincode</p>
                <p className="text-base font-semibold text-gray-900">{agentToShowMap?.area.pincode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coordinates</p>
                <p className="text-base font-semibold text-gray-900 font-mono text-sm">
                  {agentToShowMap?.area.coordinates.latitude.toFixed(6)}, {agentToShowMap?.area.coordinates.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Map using OpenStreetMap iframe */}
            <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  agentToShowMap
                    ? `${agentToShowMap.area.coordinates.longitude - 0.01},${agentToShowMap.area.coordinates.latitude - 0.01},${agentToShowMap.area.coordinates.longitude + 0.01},${agentToShowMap.area.coordinates.latitude + 0.01}`
                    : ''
                }&layer=mapnik&marker=${agentToShowMap?.area.coordinates.latitude},${agentToShowMap?.area.coordinates.longitude}`}
                style={{ border: 0 }}
              />
            </div>

            {/* Map Links */}
            <div className="flex gap-3">
              <a
                href={`https://www.google.com/maps?q=${agentToShowMap?.area.coordinates.latitude},${agentToShowMap?.area.coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
              <a
                href={`https://www.openstreetmap.org/?mlat=${agentToShowMap?.area.coordinates.latitude}&mlon=${agentToShowMap?.area.coordinates.longitude}#map=15/${agentToShowMap?.area.coordinates.latitude}/${agentToShowMap?.area.coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Open in OpenStreetMap
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker Dialog for Creating Agent */}
      <Dialog open={isMapPickerOpen} onOpenChange={(open) => !open && handleCloseMapPicker()}>
        <DialogContent className="sm:max-w-[1000px] h-[92vh] max-h-[900px] p-0 gap-0 flex flex-col overflow-hidden">
          <DialogHeader className="p-5 pb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-2xl font-bold">Select Location on Map</DialogTitle>
                <DialogDescription className="text-blue-100 mt-1.5 text-base">
                  🗺️ Drag the marker or 🔍 search for a location
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 pb-3 space-y-3">
            {/* Location Search Box */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <Label className="text-sm font-bold text-gray-800">Search Location</Label>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search for a city, address, or landmark..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                    className="h-12 pl-12 pr-4 text-base border-2 border-gray-300 focus:border-blue-600 rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={searchLoading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-600/30"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto bg-white border-2 border-blue-200 rounded-xl shadow-2xl">
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                      {searchResults.length} Result{searchResults.length > 1 ? 's' : ''} Found
                    </p>
                  </div>
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-all duration-200 hover:shadow-inner"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5 flex-shrink-0">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{result.display_name}</p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            📍 {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-gray-200 shadow-inner">
              <div>
                <Label className="text-sm font-bold text-gray-800 mb-2 block flex items-center gap-1.5">
                  <div className="p-1 bg-blue-100 rounded">
                    <MapPin className="h-3 w-3 text-blue-600" />
                  </div>
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={tempCoordinates.latitude.toFixed(6)}
                  onChange={(e) => setTempCoordinates(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="h-12 font-mono text-base font-semibold border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-800 mb-2 block flex items-center gap-1.5">
                  <div className="p-1 bg-blue-100 rounded">
                    <MapPin className="h-3 w-3 text-blue-600" />
                  </div>
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={tempCoordinates.longitude.toFixed(6)}
                  onChange={(e) => setTempCoordinates(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="h-12 font-mono text-base font-semibold border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg mt-0.5">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">How to Select Location</p>
                  <p className="text-sm text-gray-700">
                    🖱️ <strong>Drag</strong> the marker on the map or 🔍 <strong>Search</strong> for a location above
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Draggable Map */}
            <div className="w-full h-[350px] rounded-xl overflow-hidden border-2 border-gray-300 relative shadow-2xl bg-gray-100">
              <div className="absolute inset-0 z-0">
                {mapReady && (
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    }
                  >
                    <LeafletMap
                      latitude={tempCoordinates.latitude}
                      longitude={tempCoordinates.longitude}
                      onPositionChange={handleMarkerDragEnd}
                    />
                  </Suspense>
                )}
                {!mapReady && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Initializing map...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-3 right-3 pointer-events-none z-[9999]">
                <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-2xl border-2 border-blue-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-mono font-bold text-gray-800">
                      {tempCoordinates.latitude.toFixed(6)}, {tempCoordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Location Buttons */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Quick Jump</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTempCoordinates({ latitude: 22.5726, longitude: 88.3639 })}
                  className="h-12 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Kolkata</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTempCoordinates({ latitude: 28.6139, longitude: 77.2090 })}
                  className="h-12 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Delhi</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTempCoordinates({ latitude: 19.0760, longitude: 72.8777 })}
                  className="h-12 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Mumbai</span>
                </Button>
              </div>
            </div>

          </div>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 p-5 pt-4 bg-white border-t-2 border-gray-200 shadow-lg">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseMapPicker}
                className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-100 font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSelectCoordinates}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Use These Coordinates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or area..."
                className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl transition-all duration-200"
                data-testid="input-search-agents"
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
                    <TableHead className="font-semibold text-gray-700 py-4">Agent</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-700">Password</TableHead>
                    <TableHead className="font-semibold text-gray-700">Service Area</TableHead>
                    <TableHead className="font-semibold text-gray-700">Parent Agent</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-gray-300" />
                          <p className="font-medium">No agents found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent, index) => (
                      <TableRow 
                        key={agent._id} 
                        data-testid={`agent-row-${agent._id}`}
                        className={`
                          transition-all duration-200 hover:bg-blue-50/50 group cursor-pointer
                          ${index !== agents.length - 1 ? 'border-b border-gray-100' : ''}
                        `}
                      >
                        <TableCell className="py-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11 ring-2 ring-gray-100 ring-offset-2 group-hover:ring-blue-600 transition-all duration-200">
                              {agent.image && (
                                <AvatarImage 
                                  src={agent.image} 
                                  alt={agent.name}
                                />
                              )}
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-sm font-semibold">
                                {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                              <Mail className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                            </div>
                            <span className="group-hover:text-gray-900 transition-colors duration-200">{agent.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                              <Phone className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                            </div>
                            <span className="group-hover:text-gray-900 transition-colors duration-200">{agent.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
                              <Key className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-700" />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 font-mono">
                              {visiblePasswords[agent._id] ? agent.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(agent._id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                            >
                              {visiblePasswords[agent._id] ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <MapPin className="h-3.5 w-3.5 text-gray-600" />
                              {agent.area.areaname}
                            </div>
                            <div className="text-xs text-gray-500">{agent.area.city}, {agent.area.pincode}</div>
                            {agent.area.coordinates && (
                              <button
                                onClick={() => handleShowMap(agent)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 mt-1"
                              >
                                <Navigation className="h-3 w-3" />
                                {agent.area.coordinates.latitude.toFixed(4)}, {agent.area.coordinates.longitude.toFixed(4)}
                                <span className="ml-1 text-xs">📍 View Map</span>
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.parentAgentName ? (
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-purple-100">
                                <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium text-gray-900">{agent.parentAgentName}</p>
                                <p className="text-xs text-gray-500">Sub-Agent</p>
                              </div>
                            </div>
                          ) : (
                            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-md shadow-indigo-600/20 px-3 py-1">
                              <UserCheck className="h-3 w-3 mr-1.5" />
                              Primary Agent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={agent.isActive ? "default" : "secondary"}
                            className={
                              agent.isActive 
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-3 py-1" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 px-3 py-1"
                            }
                          >
                            {agent.isActive ? (
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
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-actions-${agent._id}`}
                                className="hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-lg">
                              <DropdownMenuItem onClick={() => handleEditClick(agent)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="font-medium">Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(agent)} 
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

