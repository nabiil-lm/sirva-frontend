"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Bell, Moon, Sun, Upload, Globe } from "lucide-react";
import authService from "@/services/auth.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/theme.context";

export default function SettingsPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  // const [activeTab, setActiveTab] = useState<"account" | "security" | "preferences">("preferences");
  
  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    console.log('[Settings] User data updated:', { 
      email: user?.email, 
      avatar: user?.avatar,
      firstName: user?.first_name,
      lastName: user?.last_name
    });

    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      
      // Set avatar preview from user data if available
      if (user.avatar) {
        // Fix: Handle relative URLs from backend by prepending API URL
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api$/, '').replace(/\/$/, '');
        const avatarUrl = user.avatar.startsWith('http') ? user.avatar : `${apiUrl}${user.avatar}`;
        console.log('[Settings] Setting avatar preview:', { 
          rawAvatar: user.avatar, 
          constructedUrl: avatarUrl 
        });
        setAvatarPreview(avatarUrl);
      } else {
        console.log('[Settings] No avatar in user data, clearing preview');
        setAvatarPreview(null);
      }
      
      // Load user's personal theme preference
      if (user.id) {
        const userTheme = localStorage.getItem(`theme_${user.id}`);
        if (userTheme === 'dark' && theme !== 'dark') {
          setTheme('dark');
        }
      }
      
      // Load preferences
      if (user.preferences) {
        setEmailNotifs(user.preferences.emailNotifs !== false);
        setSecurityAlerts(user.preferences.securityAlerts !== false);
        setLanguage(user.preferences.language || "en");
      }
    }
  }, [user, theme, setTheme]); // ADD user dependency

  const handleDarkModeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Save theme preference per user
    if (user?.id) {
      localStorage.setItem(`theme_${user.id}`, newTheme);
    }
    
    setTheme(newTheme);
    toast.success(newTheme === "dark" ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('[Settings] Avatar file selected:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      console.log('[Settings] Created preview URL:', previewUrl);
      setAvatarPreview(previewUrl);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Settings] handleUpdateProfile called', { 
      hasAvatarFile: !!avatarFile,
      firstName,
      lastName 
    });
    
    setIsLoading(true);
    try {
      // const updatedUser = await authService.updateProfile({
      //   first_name: firstName,
      //   last_name: lastName,
      //   email: email,
      //   avatar: avatarFile || undefined
      // });
      
      console.log('[Settings] Profile updated, calling refreshUser');
      
      // Refresh user context to update avatar in header/sidebar
      await refreshUser();
      
      console.log('[Settings] User refreshed, clearing avatar file state');
      
      // Clear the file input after successful upload
      setAvatarFile(null);
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('[Settings] Failed to update profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        re_new_password: confirmPassword
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to change password. Check current password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await authService.updateProfile({
        preferences: {
          emailNotifs,
          securityAlerts,
          language
        }
      });
      await refreshUser();
      toast.success("Preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 sm:px-6 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] dark:bg-slate-800">
          <TabsTrigger value="account" className="dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="security" className="dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white">Security</TabsTrigger>
          <TabsTrigger value="preferences" className="dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white">Preferences</TabsTrigger>
        </TabsList>

        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="space-y-6">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Profile Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-slate-100 dark:border-slate-700">
                  <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white dark:bg-blue-600">
                    {firstName?.[0]}{lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                    <Upload className="w-4 h-4" />
                    Change Photo
                  </Label>
                  <Input id="avatar" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="dark:text-slate-200">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="dark:text-slate-200">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-200">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-800/50 dark:border-slate-800">
              <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 dark:text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Password & Security</CardTitle>
              <CardDescription className="dark:text-slate-400">Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="dark:text-slate-200">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-slate-200">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-slate-200">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="dark:bg-slate-950 dark:border-slate-700 dark:text-white" />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-800/50 dark:border-slate-800">
              <Button onClick={handleChangePassword} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 dark:text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">App Preferences</CardTitle>
              <CardDescription className="dark:text-slate-400">Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Appearance */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base dark:text-slate-200">Dark Mode</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Switch checked={theme === "dark"} onCheckedChange={handleDarkModeToggle} />
                  <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              </div>
              
              <div className="border-t border-slate-100 my-4 dark:border-slate-800"></div>

              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 dark:text-white">
                  <Bell className="w-4 h-4" /> Notifications
                </h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-normal dark:text-slate-300">Email Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive emails about your dossier updates.</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-normal dark:text-slate-300">Security Alerts</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about critical security issues.</p>
                  </div>
                  <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
                </div>
              </div>

              <div className="border-t border-slate-100 my-4 dark:border-slate-800"></div>

              {/* Language */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 dark:text-white">
                  <Globe className="w-4 h-4" /> Language
                </h3>
                <div className="w-full max-w-xs">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-700 dark:text-white">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                      <SelectItem value="en" className="dark:text-slate-200 dark:focus:bg-slate-800">English (US)</SelectItem>
                      <SelectItem value="fr" className="dark:text-slate-200 dark:focus:bg-slate-800">Français</SelectItem>
                      <SelectItem value="es" className="dark:text-slate-200 dark:focus:bg-slate-800">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-800/50 dark:border-slate-800">
              <Button onClick={handleSavePreferences} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 dark:text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
