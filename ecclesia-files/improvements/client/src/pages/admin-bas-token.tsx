import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coins,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  Users,
  Map,
  HelpCircle,
  Settings,
  Sprout,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";

interface BasConfig {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  isVisible: boolean | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BasAllocation {
  id: string;
  category: string;
  percentage: number;
  description: string | null;
  color: string | null;
  sortOrder: number | null;
  isVisible: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface BasRoadmapMilestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: "upcoming" | "in_progress" | "completed";
  sortOrder: number | null;
  isVisible: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface BasCouncilMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  walletAddress: string | null;
  imageUrl: string | null;
  appointedAt: string;
  isActive: boolean | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BasFaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number | null;
  isVisible: boolean | null;
  createdAt: string;
  updatedAt: string;
}

const statusBadgeColors: Record<string, string> = {
  upcoming: "bg-gray-100 text-gray-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
};

export default function AdminBasToken() {
  usePageTitle("Admin - BAS Token");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: configs, isLoading: configsLoading } = useQuery<BasConfig[]>({
    queryKey: ["/api/admin/bas/config"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: allocations, isLoading: allocationsLoading } = useQuery<BasAllocation[]>({
    queryKey: ["/api/admin/bas/allocations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery<BasRoadmapMilestone[]>({
    queryKey: ["/api/admin/bas/roadmap"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: councilMembers, isLoading: councilLoading } = useQuery<BasCouncilMember[]>({
    queryKey: ["/api/admin/bas/council"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: faqEntries, isLoading: faqLoading } = useQuery<BasFaqEntry[]>({
    queryKey: ["/api/admin/bas/faq"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/bas/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas"] });
      toast({ title: "BAS defaults seeded successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const totalPercentage = allocations?.reduce((sum, a) => sum + a.percentage, 0) ?? 0;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" /> BAS Token Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage the Ecclesia Basilikos governance token content
            </p>
          </div>
          <Button
            onClick={() => seedDefaults.mutate()}
            disabled={seedDefaults.isPending || (configs && configs.length > 0)}
            variant="outline"
          >
            {seedDefaults.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sprout className="h-4 w-4 mr-2" />
            )}
            Seed Defaults
          </Button>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config" className="flex items-center gap-1">
              <Settings className="h-4 w-4" /> Config
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-1">
              <Coins className="h-4 w-4" /> Allocations
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-1">
              <Map className="h-4 w-4" /> Roadmap
            </TabsTrigger>
            <TabsTrigger value="council" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Council
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" /> FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <ConfigTab configs={configs ?? []} loading={configsLoading} queryClient={queryClient} toast={toast} />
          </TabsContent>

          <TabsContent value="allocations">
            <AllocationsTab
              allocations={allocations ?? []}
              loading={allocationsLoading}
              totalPercentage={totalPercentage}
              queryClient={queryClient}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="roadmap">
            <RoadmapTab milestones={milestones ?? []} loading={milestonesLoading} queryClient={queryClient} toast={toast} />
          </TabsContent>

          <TabsContent value="council">
            <CouncilTab members={councilMembers ?? []} loading={councilLoading} queryClient={queryClient} toast={toast} />
          </TabsContent>

          <TabsContent value="faq">
            <FaqTab entries={faqEntries ?? []} loading={faqLoading} queryClient={queryClient} toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function ConfigTab({ configs, loading, queryClient, toast }: { configs: BasConfig[]; loading: boolean; queryClient: any; toast: any }) {
  const [editDialog, setEditDialog] = useState<BasConfig | null>(null);
  const [editValue, setEditValue] = useState("");

  const updateConfig = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      await apiRequest("PUT", `/api/admin/bas/config/${key}`, { value, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/config"] });
      setEditDialog(null);
      toast({ title: "Config updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      await apiRequest("PATCH", `/api/admin/bas/config/${id}/visibility`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/config"] });
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bas/config/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/config"] });
      toast({ title: "Config entry deleted" });
    },
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {configs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No config entries. Click "Seed Defaults" to populate.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-mono text-sm">{config.configKey}</TableCell>
                  <TableCell className="text-sm text-gray-500">{config.description ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{config.configValue}</TableCell>
                  <TableCell>
                    <Switch
                      checked={config.isVisible ?? true}
                      onCheckedChange={(checked) => toggleVisibility.mutate({ id: config.id, isVisible: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditDialog(config);
                          setEditValue(config.configValue);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteConfig.mutate(config.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit: {editDialog?.configKey}</DialogTitle>
              <DialogDescription>{editDialog?.description}</DialogDescription>
            </DialogHeader>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button
                onClick={() => editDialog && updateConfig.mutate({ key: editDialog.configKey, value: editValue, description: editDialog.description ?? undefined })}
                disabled={updateConfig.isPending}
              >
                {updateConfig.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function AllocationsTab({ allocations, loading, totalPercentage, queryClient, toast }: { allocations: BasAllocation[]; loading: boolean; totalPercentage: number; queryClient: any; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BasAllocation | null>(null);
  const [form, setForm] = useState({ category: "", percentage: "", description: "", color: "#D4AF37", sortOrder: "0" });

  const resetForm = () => setForm({ category: "", percentage: "", description: "", color: "#D4AF37", sortOrder: "0" });

  const createAllocation = useMutation({
    mutationFn: async () => {
      const body = { category: form.category, percentage: parseInt(form.percentage), description: form.description || undefined, color: form.color, sortOrder: parseInt(form.sortOrder) };
      if (editing) {
        await apiRequest("PATCH", `/api/admin/bas/allocations/${editing.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/bas/allocations", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/allocations"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: editing ? "Allocation updated" : "Allocation created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteAllocation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bas/allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/allocations"] });
      toast({ title: "Allocation deleted" });
    },
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Token Allocations</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className={totalPercentage === 100 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{totalPercentage}%</span>
            {totalPercentage !== 100 && " (should be 100%)"}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Allocation
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: a.color ?? "#ccc" }} />
                </TableCell>
                <TableCell className="font-medium">{a.category}</TableCell>
                <TableCell>{a.percentage}%</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-gray-500">{a.description ?? "—"}</TableCell>
                <TableCell>{a.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(a);
                        setForm({
                          category: a.category,
                          percentage: String(a.percentage),
                          description: a.description ?? "",
                          color: a.color ?? "#D4AF37",
                          sortOrder: String(a.sortOrder ?? 0),
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteAllocation.mutate(a.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Allocation" : "Add Allocation"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Treasury Reserve" />
              </div>
              <div>
                <Label>Percentage</Label>
                <Input type="number" min="0" max="100" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Color</Label>
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-20" />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-20" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createAllocation.mutate()} disabled={createAllocation.isPending || !form.category || !form.percentage}>
                {createAllocation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function RoadmapTab({ milestones, loading, queryClient, toast }: { milestones: BasRoadmapMilestone[]; loading: boolean; queryClient: any; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BasRoadmapMilestone | null>(null);
  const [form, setForm] = useState({ title: "", description: "", targetDate: "", status: "upcoming", sortOrder: "0" });

  const resetForm = () => setForm({ title: "", description: "", targetDate: "", status: "upcoming", sortOrder: "0" });

  const saveMilestone = useMutation({
    mutationFn: async () => {
      const body = { title: form.title, description: form.description || undefined, targetDate: form.targetDate || undefined, status: form.status, sortOrder: parseInt(form.sortOrder) };
      if (editing) {
        await apiRequest("PATCH", `/api/admin/bas/roadmap/${editing.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/bas/roadmap", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/roadmap"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: editing ? "Milestone updated" : "Milestone created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bas/roadmap/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/roadmap"] });
      toast({ title: "Milestone deleted" });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      await apiRequest("PATCH", `/api/admin/bas/roadmap/${id}`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/roadmap"] });
    },
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roadmap Milestones</CardTitle>
        <Button onClick={() => { resetForm(); setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Milestone
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.title}</TableCell>
                <TableCell>{m.targetDate ?? "—"}</TableCell>
                <TableCell>
                  <Badge className={statusBadgeColors[m.status] ?? ""}>
                    {m.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={m.isVisible ?? true}
                    onCheckedChange={(checked) => toggleVisibility.mutate({ id: m.id, isVisible: checked })}
                  />
                </TableCell>
                <TableCell>{m.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(m);
                        setForm({
                          title: m.title,
                          description: m.description ?? "",
                          targetDate: m.targetDate ?? "",
                          status: m.status,
                          sortOrder: String(m.sortOrder ?? 0),
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMilestone.mutate(m.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Governance Portal Launch" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Target Date</Label>
                  <Input value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} placeholder="e.g. Q3 2026" />
                </div>
                <div className="flex-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-20" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMilestone.mutate()} disabled={saveMilestone.isPending || !form.title}>
                {saveMilestone.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function CouncilTab({ members, loading, queryClient, toast }: { members: BasCouncilMember[]; loading: boolean; queryClient: any; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BasCouncilMember | null>(null);
  const [form, setForm] = useState({ name: "", role: "", bio: "", walletAddress: "", imageUrl: "", sortOrder: "0" });

  const resetForm = () => setForm({ name: "", role: "", bio: "", walletAddress: "", imageUrl: "", sortOrder: "0" });

  const saveMember = useMutation({
    mutationFn: async () => {
      const body = { name: form.name, role: form.role, bio: form.bio || undefined, walletAddress: form.walletAddress || undefined, imageUrl: form.imageUrl || undefined, sortOrder: parseInt(form.sortOrder) };
      if (editing) {
        await apiRequest("PATCH", `/api/admin/bas/council/${editing.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/bas/council", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/council"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: editing ? "Member updated" : "Member added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bas/council/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/council"] });
      toast({ title: "Member removed" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/bas/council/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/council"] });
    },
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stewardship Council</CardTitle>
        <Button onClick={() => { resetForm(); setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell className="font-mono text-xs max-w-[120px] truncate">{m.walletAddress ?? "—"}</TableCell>
                <TableCell>
                  <Switch
                    checked={m.isActive ?? true}
                    onCheckedChange={(checked) => toggleActive.mutate({ id: m.id, isActive: checked })}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(m);
                        setForm({
                          name: m.name,
                          role: m.role,
                          bio: m.bio ?? "",
                          walletAddress: m.walletAddress ?? "",
                          imageUrl: m.imageUrl ?? "",
                          sortOrder: String(m.sortOrder ?? 0),
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMember.mutate(m.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Council Member" : "Add Council Member"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Treasury Steward" />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div>
                <Label>Wallet Address (optional)</Label>
                <Input value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} placeholder="SOL wallet address" className="font-mono text-sm" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Image URL (optional)</Label>
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-20" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMember.mutate()} disabled={saveMember.isPending || !form.name || !form.role}>
                {saveMember.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function FaqTab({ entries, loading, queryClient, toast }: { entries: BasFaqEntry[]; loading: boolean; queryClient: any; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BasFaqEntry | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "", sortOrder: "0" });

  const resetForm = () => setForm({ question: "", answer: "", category: "", sortOrder: "0" });

  const saveEntry = useMutation({
    mutationFn: async () => {
      const body = { question: form.question, answer: form.answer, category: form.category || undefined, sortOrder: parseInt(form.sortOrder) };
      if (editing) {
        await apiRequest("PATCH", `/api/admin/bas/faq/${editing.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/bas/faq", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/faq"] });
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      toast({ title: editing ? "FAQ updated" : "FAQ created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/bas/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/faq"] });
      toast({ title: "FAQ deleted" });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      await apiRequest("PATCH", `/api/admin/bas/faq/${id}`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bas/faq"] });
    },
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>FAQ Entries</CardTitle>
        <Button onClick={() => { resetForm(); setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add FAQ
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium max-w-xs truncate">{e.question}</TableCell>
                <TableCell>
                  {e.category ? <Badge variant="outline">{e.category}</Badge> : "—"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={e.isVisible ?? true}
                    onCheckedChange={(checked) => toggleVisibility.mutate({ id: e.id, isVisible: checked })}
                  />
                </TableCell>
                <TableCell>{e.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(e);
                        setForm({
                          question: e.question,
                          answer: e.answer,
                          category: e.category ?? "",
                          sortOrder: String(e.sortOrder ?? 0),
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteEntry.mutate(e.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Question</Label>
                <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              </div>
              <div>
                <Label>Answer</Label>
                <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={5} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. General, Governance, Technical" />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-20" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveEntry.mutate()} disabled={saveEntry.isPending || !form.question || !form.answer}>
                {saveEntry.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
