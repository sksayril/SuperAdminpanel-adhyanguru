import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { signin, type SigninData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [formData, setFormData] = useState<SigninData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await signin(formData);
      
      if (response.success && response.data) {
        // Save to localStorage and context
        login(response.data, response.data.token);
        
        toast({
          title: "Welcome back!",
          description: response.message || "Successfully signed in",
        });
        
        // Redirect to admin dashboard
        setLocation("/admin");
      } else {
        setError(response.message || "Signin failed");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      toast({
        title: "Error",
        description: err.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Promotional Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 relative overflow-hidden">
        {/* Background decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start px-12 text-white">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ADHYANGURU</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Let's Grow Up Your Future<br />With Adhyanguru
          </h1>
          
          {/* Description */}
          <p className="text-xl text-blue-100 mb-12 max-w-md leading-relaxed">
            Learn important new skills, discover passions or hobbies, find ideas to change your careers.
          </p>

          {/* Image placeholder - You can replace this with an actual image */}
          <div className="mt-auto mb-12 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="aspect-video bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-700">ADHYANGURU</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign in to your account</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="aldo.hassan@adhyanguru.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                className="h-12 border-gray-300 focus:border-blue-700 focus:ring-blue-700"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setLocation("/forgot-password")}
                  className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="h-12 pr-10 border-gray-300 focus:border-blue-700 focus:ring-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Keep me logged in */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                className="border-gray-300 data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700"
              />
              <Label
                htmlFor="keepLoggedIn"
                className="text-sm font-normal text-gray-700 cursor-pointer"
              >
                Keep me logged in
              </Label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/signup")}
                  className="text-blue-700 hover:text-blue-800 font-medium"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            © 2024 Adhyanguru. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

