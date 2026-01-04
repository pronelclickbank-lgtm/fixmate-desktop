import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Users,
  Key,
  Package,
  Plus,
  Trash2,
  Edit,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [newFeatureFlag, setNewFeatureFlag] = useState({
    flagKey: "",
    flagName: "",
    description: "",
    enabled: "true" as "true" | "false",
    requiresPro: "false" as "true" | "false",
  });
  const [newUpdate, setNewUpdate] = useState({
    version: "",
    changelog: "",
    downloadUrl: "",
    releaseType: "stable" as "stable" | "beta" | "alpha",
    mandatory: "false" as "true" | "false",
  });
  const [licenseCount, setLicenseCount] = useState(1);
  const [licenseTier, setLicenseTier] = useState<"free" | "pro">("pro");

  const utils = trpc.useUtils();

  // Queries
  const { data: featureFlags, isLoading: loadingFlags } =
    trpc.admin.featureFlags.list.useQuery();
  const { data: updates, isLoading: loadingUpdates } = trpc.admin.updates.list.useQuery();
  const { data: licenses, isLoading: loadingLicenses } = trpc.admin.licenses.list.useQuery({
    limit: 50,
  });
  const { data: users, isLoading: loadingUsers } = trpc.admin.users.list.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: stats } = trpc.admin.users.getStats.useQuery();

  // Mutations
  const createFeatureFlagMutation = trpc.admin.featureFlags.create.useMutation({
    onSuccess: () => {
      utils.admin.featureFlags.list.invalidate();
      toast.success("Feature flag created successfully");
      setNewFeatureFlag({
        flagKey: "",
        flagName: "",
        description: "",
        enabled: "true",
        requiresPro: "false",
      });
    },
  });

  const createUpdateMutation = trpc.admin.updates.create.useMutation({
    onSuccess: () => {
      utils.admin.updates.list.invalidate();
      toast.success("Update created successfully");
      setNewUpdate({
        version: "",
        changelog: "",
        downloadUrl: "",
        releaseType: "stable",
        mandatory: "false",
      });
    },
  });

  const generateLicensesMutation = trpc.admin.licenses.generate.useMutation({
    onSuccess: (data) => {
      utils.admin.licenses.list.invalidate();
      toast.success(`Generated ${data.generated} license keys`);
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/10 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">Admin Dashboard</h1>
          <p className="text-purple-300 mt-3 text-xl font-semibold tracking-wide">
            Manage features, updates, users, and licenses
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.proUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.freeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="updates">App Updates</TabsTrigger>
            <TabsTrigger value="licenses">License Keys</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Control which features are enabled</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature Flag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Feature Flag</DialogTitle>
                        <DialogDescription>
                          Add a new feature flag to control application features
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="flagKey">Flag Key</Label>
                          <Input
                            id="flagKey"
                            placeholder="driver-updates"
                            value={newFeatureFlag.flagKey}
                            onChange={(e) =>
                              setNewFeatureFlag({ ...newFeatureFlag, flagKey: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="flagName">Flag Name</Label>
                          <Input
                            id="flagName"
                            placeholder="Driver Updates"
                            value={newFeatureFlag.flagName}
                            onChange={(e) =>
                              setNewFeatureFlag({ ...newFeatureFlag, flagName: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Allows users to update drivers"
                            value={newFeatureFlag.description}
                            onChange={(e) =>
                              setNewFeatureFlag({
                                ...newFeatureFlag,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newFeatureFlag.enabled === "true"}
                            onCheckedChange={(checked) =>
                              setNewFeatureFlag({
                                ...newFeatureFlag,
                                enabled: checked ? "true" : "false",
                              })
                            }
                          />
                          <Label>Enabled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newFeatureFlag.requiresPro === "true"}
                            onCheckedChange={(checked) =>
                              setNewFeatureFlag({
                                ...newFeatureFlag,
                                requiresPro: checked ? "true" : "false",
                              })
                            }
                          />
                          <Label>Requires Pro</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => createFeatureFlagMutation.mutate(newFeatureFlag)}
                          disabled={createFeatureFlagMutation.isPending}
                        >
                          {createFeatureFlagMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFlags ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Flag Key</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requires Pro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featureFlags?.map((flag) => (
                        <TableRow key={flag.id}>
                          <TableCell className="font-mono text-sm">{flag.flagKey}</TableCell>
                          <TableCell>{flag.flagName}</TableCell>
                          <TableCell>
                            <Badge variant={flag.enabled === "true" ? "default" : "secondary"}>
                              {flag.enabled === "true" ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={flag.requiresPro === "true" ? "default" : "outline"}>
                              {flag.requiresPro === "true" ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>App Updates</CardTitle>
                    <CardDescription>Manage application versions and updates</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create App Update</DialogTitle>
                        <DialogDescription>
                          Publish a new version of the application
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="version">Version</Label>
                          <Input
                            id="version"
                            placeholder="1.0.0"
                            value={newUpdate.version}
                            onChange={(e) =>
                              setNewUpdate({ ...newUpdate, version: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="changelog">Changelog</Label>
                          <Textarea
                            id="changelog"
                            placeholder="- Added new features&#10;- Fixed bugs"
                            value={newUpdate.changelog}
                            onChange={(e) =>
                              setNewUpdate({ ...newUpdate, changelog: e.target.value })
                            }
                            rows={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="downloadUrl">Download URL</Label>
                          <Input
                            id="downloadUrl"
                            placeholder="https://example.com/fixmate-v1.0.0.exe"
                            value={newUpdate.downloadUrl}
                            onChange={(e) =>
                              setNewUpdate({ ...newUpdate, downloadUrl: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="releaseType">Release Type</Label>
                          <Select
                            value={newUpdate.releaseType}
                            onValueChange={(value: "stable" | "beta" | "alpha") =>
                              setNewUpdate({ ...newUpdate, releaseType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stable">Stable</SelectItem>
                              <SelectItem value="beta">Beta</SelectItem>
                              <SelectItem value="alpha">Alpha</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newUpdate.mandatory === "true"}
                            onCheckedChange={(checked) =>
                              setNewUpdate({
                                ...newUpdate,
                                mandatory: checked ? "true" : "false",
                              })
                            }
                          />
                          <Label>Mandatory Update</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => createUpdateMutation.mutate(newUpdate)}
                          disabled={createUpdateMutation.isPending}
                        >
                          {createUpdateMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUpdates ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Release Type</TableHead>
                        <TableHead>Mandatory</TableHead>
                        <TableHead>Released</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {updates?.map((update) => (
                        <TableRow key={update.id}>
                          <TableCell className="font-semibold">{update.version}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                update.releaseType === "stable"
                                  ? "default"
                                  : update.releaseType === "beta"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {update.releaseType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={update.mandatory === "true" ? "destructive" : "outline"}>
                              {update.mandatory === "true" ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(update.releasedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Keys Tab */}
          <TabsContent value="licenses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>License Keys</CardTitle>
                    <CardDescription>Generate and manage license keys</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Key className="h-4 w-4 mr-2" />
                        Generate Keys
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate License Keys</DialogTitle>
                        <DialogDescription>
                          Create new license keys for distribution
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="count">Number of Keys</Label>
                          <Input
                            id="count"
                            type="number"
                            min="1"
                            max="100"
                            value={licenseCount}
                            onChange={(e) => setLicenseCount(parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tier">Tier</Label>
                          <Select
                            value={licenseTier}
                            onValueChange={(value: "free" | "pro") => setLicenseTier(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() =>
                            generateLicensesMutation.mutate({
                              count: licenseCount,
                              tier: licenseTier,
                              maxActivations: 1,
                            })
                          }
                          disabled={generateLicensesMutation.isPending}
                        >
                          {generateLicensesMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Generate"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingLicenses ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>License Key</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Activations</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenses?.map((license) => (
                        <TableRow key={license.id}>
                          <TableCell className="font-mono text-sm">{license.key}</TableCell>
                          <TableCell>
                            <Badge variant={license.tier === "pro" ? "default" : "secondary"}>
                              {license.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {license.currentActivations} / {license.maxActivations}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                license.status === "active"
                                  ? "default"
                                  : license.status === "revoked"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {license.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge
                                variant={user.subscription.tier === "pro" ? "default" : "outline"}
                              >
                                {user.subscription.tier}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
