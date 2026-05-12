import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Mail, Search, Calendar, User, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminContactMessages() {
  usePageTitle("Admin - Messages");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const { data: contacts = [], isLoading, refetch } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({ title: "Message Deleted", description: "Contact message has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete message", variant: "destructive" });
    },
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMessage = (contact: Contact) => {
    setSelectedMessage(contact);
    setShowMessageDialog(true);
  };

  const getMessagePreview = (message: string) => {
    return message.length > 100 ? message.substring(0, 100) + "..." : message;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading contact messages...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and respond to visitor inquiries and contact form submissions</p>
        </div>

        {/* Search and Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages by name, email, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-royal-navy" />
                <div>
                  <p className="text-2xl font-bold text-royal-navy">{contacts.length}</p>
                  <p className="text-xs text-gray-600">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-royal-gold" />
                <div>
                  <p className="text-2xl font-bold text-royal-navy">
                    {contacts.filter(c => {
                      const messageDate = new Date(c.created_at);
                      const today = new Date();
                      return messageDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                  <p className="text-xs text-gray-600">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? "No messages found matching your search." : "No contact messages yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-royal-navy" />
                          <span className="font-semibold text-royal-navy">{contact.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {contact.email}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(contact.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {contact.subject}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {getMessagePreview(contact.message)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewMessage(contact)}
                        className="border-royal-navy text-royal-navy hover:bg-royal-navy hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the message from {contact.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Details Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Message Details</DialogTitle>
              <DialogDescription>
                Full message details and sender information
              </DialogDescription>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMessage.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Received</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="bg-royal-navy hover:bg-royal-navy/80"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this message from {selectedMessage.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteContactMutation.mutate(selectedMessage.id);
                            setShowMessageDialog(false);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    onClick={() => setShowMessageDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}