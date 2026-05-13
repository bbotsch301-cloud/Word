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
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";

interface TreasuryStats {
  balance: number;
  totalInflow: number;
  totalOutflow: number;
  transactionCount: number;
  breakdownByType: Record<string, number>;
}

interface TreasuryTransaction {
  id: string;
  type: string;
  amountCents: number;
  currency: string;
  description: string | null;
  sourcePaymentId: string | null;
  sourceUserId: string | null;
  performedByAdminId: string | null;
  notes: string | null;
  createdAt: string;
}

interface TreasurySetting {
  id: string;
  key: string;
  value: string | null;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const typeBadgeColors: Record<string, string> = {
  payment_allocation: "bg-green-100 text-green-800",
  donation_allocation: "bg-blue-100 text-blue-800",
  manual_adjustment: "bg-yellow-100 text-yellow-800",
  crypto_conversion: "bg-purple-100 text-purple-800",
  crypto_transfer: "bg-indigo-100 text-indigo-800",
  disbursement: "bg-red-100 text-red-800",
};

export default function AdminTreasury() {
  usePageTitle("Admin - Treasury");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<TreasuryStats>({
    queryKey: ["/api/admin/treasury/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: transactions, isLoading: txLoading } = useQuery<TreasuryTransaction[]>({
    queryKey: ["/api/admin/treasury/transactions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: publicSetting } = useQuery<TreasurySetting>({
    queryKey: ["/api/admin/treasury/settings/public_page_enabled"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const togglePublicPage = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("PUT", "/api/admin/treasury/settings/public_page_enabled", {
        value: enabled ? "true" : "false",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/treasury/settings/public_page_enabled"] });
      toast({ title: "Setting updated" });
    },
  });

  const createTransaction = useMutation({
    mutationFn: async () => {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed === 0) throw new Error("Invalid amount");
      await apiRequest("POST", "/api/admin/treasury/transactions", {
        amount: parsed,
        description,
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/treasury"] });
      setDialogOpen(false);
      setAmount("");
      setDescription("");
      setNotes("");
      toast({ title: "Transaction recorded" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isPublicEnabled = publicSetting?.value === "true";

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" /> Treasury
            </h1>
            <p className="text-gray-600 dark:text-gray-300">50% of all payments are allocated to the treasury</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Manual Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Manual Adjustment</DialogTitle>
                <DialogDescription>
                  Enter a positive amount for inflow or negative for outflow.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 100.00 or -50.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Reason for adjustment"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createTransaction.mutate()}
                  disabled={createTransaction.isPending || !amount || !description}
                >
                  {createTransaction.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Treasury Balance</CardTitle>
                  <Coins className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                    {formatCents(stats.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.transactionCount} transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Inflow</CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCents(stats.totalInflow)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Outflow</CardTitle>
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCents(Math.abs(stats.totalOutflow))}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown by Type */}
            {Object.keys(stats.breakdownByType).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Allocation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(stats.breakdownByType).map(([type, total]) => (
                        <TableRow key={type}>
                          <TableCell>
                            <Badge className={typeBadgeColors[type] || "bg-gray-100 text-gray-800"}>
                              {formatType(type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCents(total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* Transaction History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={typeBadgeColors[tx.type] || "bg-gray-100 text-gray-800"}>
                          {formatType(tx.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${tx.amountCents >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amountCents >= 0 ? "+" : ""}
                        {formatCents(tx.amountCents)}
                      </TableCell>
                      <TableCell className="text-sm">{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" /> Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Treasury Page</p>
                <p className="text-sm text-gray-500">
                  Allow visitors to view treasury balance at /treasury
                </p>
              </div>
              <Switch
                checked={isPublicEnabled}
                onCheckedChange={(checked) => togglePublicPage.mutate(checked)}
                disabled={togglePublicPage.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allocation Percentage</p>
                <p className="text-sm text-gray-500">
                  Percentage of each payment allocated to treasury
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">50%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
