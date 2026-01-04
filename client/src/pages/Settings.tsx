import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Power, Palette, Globe, FileText, Info, Shield, ScrollText } from "lucide-react";
import { UpdateChecker } from "@/components/UpdateChecker";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [startupEnabled, setStartupEnabled] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState("en");

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast.success(enabled ? "Notifications enabled" : "Notifications disabled");
  };

  const handleStartupToggle = (enabled: boolean) => {
    setStartupEnabled(enabled);
    toast.success(enabled ? "Startup enabled" : "Startup disabled");
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    toast.success("Language changed");
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Legal
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            System Info
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{user?.name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Subscription</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-sm">
                    Free Plan
                  </Badge>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts about system issues and updates
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Startup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                Startup
              </CardTitle>
              <CardDescription>
                Launch FixMate AI when your computer starts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Run on Startup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start FixMate AI with Windows
                  </p>
                </div>
                <Switch
                  checked={startupEnabled}
                  onCheckedChange={handleStartupToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value: "light" | "dark") => handleThemeChange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language
              </CardTitle>
              <CardDescription>
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Display Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By using FixMate AI, you agree to these terms of service. If you do not agree, please do not use the application.
              </p>
              
              <h3>2. Use of Service</h3>
              <p>
                FixMate AI is provided for personal and commercial use to optimize and maintain your PC. You agree to use the service responsibly and not for any illegal purposes.
              </p>
              
              <h3>3. Data Collection</h3>
              <p>
                We collect minimal data necessary to provide the service, including system diagnostics and usage statistics. Your privacy is important to us.
              </p>
              
              <h3>4. Disclaimer</h3>
              <p>
                FixMate AI is provided "as is" without warranties. We are not responsible for any data loss or system damage resulting from the use of this application.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h3>Information We Collect</h3>
              <p>
                We collect system information (CPU, RAM, disk usage), usage statistics, and account information (name, email) to provide and improve our service.
              </p>
              
              <h3>How We Use Your Data</h3>
              <p>
                Your data is used to provide personalized optimization recommendations, track app usage, and send important notifications about system health.
              </p>
              
              <h3>Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest.
              </p>
              
              <h3>Your Rights</h3>
              <p>
                You have the right to access, modify, or delete your personal data at any time. Contact us for data requests.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Details about your system and FixMate AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Operating System</Label>
                  <p className="font-medium">Windows 11 Pro</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Processor</Label>
                  <p className="font-medium">Intel Core i7-12700K</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">RAM</Label>
                  <p className="font-medium">32 GB DDR4</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Storage</Label>
                  <p className="font-medium">1 TB NVMe SSD</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">FixMate AI Version</Label>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">December 25, 2025</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Database Version</Label>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">License</Label>
                  <p className="font-medium">Free</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Software Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Check for the latest version of FixMate AI
                  </p>
                </div>
                <UpdateChecker checkOnMount={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
