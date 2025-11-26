import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Lock, Globe, Palette, Shield, Mail, Calendar, Clock } from "lucide-react";
import { getSuperAdminProfile } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["/api/super-admin/profile"],
    queryFn: async () => {
      return await getSuperAdminProfile();
    },
  });

  const profile = profileResponse?.data;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: User, label: "Profile", active: true },
              { icon: Bell, label: "Notifications", active: false },
              { icon: Lock, label: "Privacy & Security", active: false },
              { icon: Globe, label: "Language & Region", active: false },
              { icon: Palette, label: "Appearance", active: false },
            ].map((item, index) => (
              <Button
                key={index}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card data-testid="card-profile-settings">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and update your super admin profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-blue-700/10 text-blue-700 text-xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" data-testid="button-change-avatar">
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-700" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Super Admin</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Role: {profile.role}</p>
                      </div>
                      <Badge 
                        variant={profile.isActive ? "default" : "secondary"}
                        className="ml-auto bg-blue-700 hover:bg-blue-800"
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={profile.name}
                          data-testid="input-name"
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            defaultValue={profile.email}
                            data-testid="input-email"
                            readOnly
                            className="bg-muted pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Created At
                        </Label>
                        <Input
                          defaultValue={new Date(profile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Last Login
                        </Label>
                        <Input
                          defaultValue={profile.lastLogin 
                            ? new Date(profile.lastLogin).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Never'}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button data-testid="button-save-profile">Save Changes</Button>
                    <Button variant="outline" data-testid="button-cancel">Cancel</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load profile information
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card data-testid="card-notification-settings">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Email Notifications", description: "Receive email about your account activity" },
                { label: "Push Notifications", description: "Receive push notifications on your devices" },
                { label: "Assignment Reminders", description: "Get reminded about upcoming assignments" },
                { label: "Course Updates", description: "Notifications about new courses and updates" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3" data-testid={`notification-${index}`}>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={index < 2} data-testid={`switch-notification-${index}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card data-testid="card-preferences">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="english">
                  <SelectTrigger id="language" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone" data-testid="select-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                    <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                    <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                    <SelectItem value="cet">Central European (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" data-testid="button-reset-preferences">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
