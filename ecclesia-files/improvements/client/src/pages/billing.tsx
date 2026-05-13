import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Crown, CreditCard, Calendar, Loader2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import PremiumBadge from "@/components/PremiumBadge";
import RequireAuth from "@/components/RequireAuth";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionStatus {
  tier: string;
  status: string;
  isPremium: boolean;
  startDate: string | null;
  endDate: string | null;
  features: Record<string, boolean>;
}

interface SubscriptionRecord {
  id: string;
  tier: string;
  status: string;
  source: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

function BillingContent() {
  usePageTitle("Billing");
  const { isPremium } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: subStatus, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<SubscriptionRecord[]>({
    queryKey: ["/api/subscription/history"],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscription/cancel");
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to cancel subscription");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Donation Canceled",
        description: "Your monthly donation has been stopped. Your membership will revert to the free tier.",
      });
      setCancelDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (statusLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-royal-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 marble-bg">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-cinzel-decorative text-3xl font-bold text-royal-navy mb-8">Stewardship & PMA Membership</h1>

        {/* Current Plan */}
        <Card className="mb-8 border-2 border-royal-gold/20">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-royal-gold" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-cinzel text-xl font-bold text-royal-navy">
                    {isPremium ? "PMA Beneficiary" : "Trust User (Free)"}
                  </h3>
                  {isPremium && <PremiumBadge size="md" />}
                </div>
                <p className="text-sm text-gray-500">
                  {isPremium
                    ? "You have full access to all content and features."
                    : "You have access to Trust content. Acquire PMA membership for full access."
                  }
                </p>
                {subStatus?.startDate && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date(subStatus.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {!isPremium && (
                <Link href="/pricing">
                  <Button className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold">
                    <Crown className="w-4 h-4 mr-2" /> Acquire Beneficial Interest
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treasury Allocation Info */}
        {isPremium && (
          <Card className="mb-8 border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-white">
            <CardHeader>
              <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Treasury Stewardship
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                50% of your monthly donation is allocated to the Treasury Trust, managed by the Financial Trustee for the long-term benefit of all PMA beneficiaries. These funds support asset growth, future investments, and the collective prosperity of the community.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Manage Membership */}
        {isPremium && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-cinzel text-lg">Manage Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Your Covenantal Membership is active and supported by your monthly donation. Contact support for any questions.
              </p>
              <Button variant="outline" disabled className="font-cinzel">
                Donation Active
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stop Installment Payments */}
        {isPremium && subStatus?.status === 'active' && (
          <Card className="mb-8 border border-red-200">
            <CardHeader>
              <CardTitle className="font-cinzel text-lg flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                Cancel Monthly Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you wish to stop your monthly donation, you can do so here. Your membership will revert to the free tier.
              </p>
              <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="font-cinzel">
                    Cancel Donation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will stop your monthly donation and your Covenantal Membership will revert to the free tier. You can re-subscribe at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Donating</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Yes, Cancel Donation"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Subscription History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-cinzel text-lg">Interest History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No membership history yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.tier === 'premium' ? 'default' : 'secondary'} className={record.tier === 'premium' ? 'bg-royal-gold text-royal-navy' : ''}>
                          {record.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{record.status}</TableCell>
                      <TableCell className="text-sm capitalize">{record.source.replace('_', ' ')}</TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Billing() {
  return (
    <RequireAuth>
      <BillingContent />
    </RequireAuth>
  );
}
