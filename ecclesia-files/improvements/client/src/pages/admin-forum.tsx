import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessagesSquare,
  Plus,
  Edit,
  Trash2,
  Pin,
  Lock,
  Unlock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { usePageTitle } from "@/hooks/usePageTitle";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  color: z.string().min(1, "Color is required").default("#3B82F6"),
  order: z.coerce.number().min(0).default(0),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number | null;
  isActive: boolean | null;
  createdAt: string;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  isPinned: boolean | null;
  isLocked: boolean | null;
  viewCount: number | null;
  replyCount: number | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; username: string };
  category: ForumCategory;
}

export default function AdminForum() {
  usePageTitle("Admin - Forum");
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Category form
  const categoryForm = useForm<CategoryFormData>({
    mode: "onBlur",
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      order: 0,
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: threads } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/categories", expandedCategory, "threads"],
    queryFn: async () => {
      if (!expandedCategory) return [];
      const res = await fetch(`/api/forum/categories/${expandedCategory}/threads`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!expandedCategory,
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest("POST", "/api/admin/forum/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({ title: "Category Created", description: "Forum category has been created." });
      setCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      return apiRequest("PATCH", `/api/admin/forum/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({ title: "Category Updated", description: "Forum category has been updated." });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/forum/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({ title: "Category Deleted", description: "Forum category has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" });
    },
  });

  // Thread mutations
  const togglePinnedMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/admin/forum/threads/${id}/toggle-pinned`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories", expandedCategory, "threads"] });
      toast({ title: "Thread Updated", description: "Thread pin status updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update thread", variant: "destructive" });
    },
  });

  const toggleLockedMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/admin/forum/threads/${id}/toggle-locked`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories", expandedCategory, "threads"] });
      toast({ title: "Thread Updated", description: "Thread lock status updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update thread", variant: "destructive" });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/forum/threads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories", expandedCategory, "threads"] });
      toast({ title: "Thread Deleted", description: "Thread has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete thread", variant: "destructive" });
    },
  });

  const handleEditCategory = (category: ForumCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3B82F6",
      order: category.order || 0,
    });
    setCategoryDialogOpen(true);
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forum Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage categories, threads, and moderation</p>
          </div>
        </div>

        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">
              <MessagesSquare className="h-4 w-4 mr-2" />
              Categories ({categories?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="threads">
              <MessageCircle className="h-4 w-4 mr-2" />
              Threads
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Forum Categories</CardTitle>
                  <CardDescription>Manage forum discussion categories</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    categoryForm.reset({
                      name: "",
                      description: "",
                      color: "#3B82F6",
                      order: (categories?.length || 0) + 1,
                    });
                    setCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading categories...</p>
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="space-y-3">
                    {categories
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color || "#3B82F6" }}
                            />
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              {category.description && (
                                <p className="text-sm text-gray-500">{category.description}</p>
                              )}
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">Order: {category.order}</Badge>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                  {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This may affect threads in this category.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessagesSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No categories yet</p>
                    <p className="text-gray-500 text-sm">Create your first forum category</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threads Tab */}
          <TabsContent value="threads">
            <Card>
              <CardHeader>
                <CardTitle>Thread Moderation</CardTitle>
                <CardDescription>Select a category to view and moderate its threads</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories?.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={expandedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: cat.color || "#3B82F6" }}
                      />
                      {cat.name}
                      {expandedCategory === cat.id ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>

                {expandedCategory && threads ? (
                  threads.length > 0 ? (
                    <div className="space-y-3">
                      {threads.map((thread) => (
                        <div key={thread.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {thread.isPinned && (
                                <Pin className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              )}
                              {thread.isLocked && (
                                <Lock className="h-3 w-3 text-red-500 flex-shrink-0" />
                              )}
                              <h3 className="font-semibold truncate">{thread.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{thread.content}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>by {thread.author.firstName} {thread.author.lastName}</span>
                              <span>{thread.viewCount || 0} views</span>
                              <span>{thread.replyCount || 0} replies</span>
                              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePinnedMutation.mutate(thread.id)}
                              title={thread.isPinned ? "Unpin" : "Pin"}
                              className={thread.isPinned ? "text-amber-600 border-amber-300" : ""}
                            >
                              <Pin className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLockedMutation.mutate(thread.id)}
                              title={thread.isLocked ? "Unlock" : "Lock"}
                              className={thread.isLocked ? "text-red-600 border-red-300" : ""}
                            >
                              {thread.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Delete "{thread.title}" and all its replies? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteThreadMutation.mutate(thread.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No threads in this category.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Select a category above to view its threads.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Add a new forum category"}
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField control={categoryForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input placeholder="Category name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={categoryForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Category description" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={categoryForm.control} name="color" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <FormControl>
                        <Input {...field} className="flex-1" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={categoryForm.control} name="order" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCategoryDialogOpen(false);
                    categoryForm.reset();
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
