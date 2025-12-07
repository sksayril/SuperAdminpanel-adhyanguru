import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, Minus, CheckCircle2, XCircle, Loader2, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllAgentWallets,
  getAgentWalletTransactions,
  creditAgentWallet,
  debitAgentWallet,
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
  getWalletStatistics,
  type CreditDebitData,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/stat-card";

export default function WalletManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("wallets");
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [creditData, setCreditData] = useState<CreditDebitData>({
    amount: 0,
    category: "adjustment",
    note: "",
  });
  const [debitData, setDebitData] = useState<CreditDebitData>({
    amount: 0,
    category: "adjustment",
    note: "",
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: walletsResponse, isLoading: walletsLoading } = useQuery({
    queryKey: ["/api/super-admin/wallets", page],
    queryFn: async () => {
      return await getAllAgentWallets({ page, limit });
    },
  });

  const { data: withdrawalsResponse, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/super-admin/withdrawals", page],
    queryFn: async () => {
      return await getWithdrawalRequests({ page, limit });
    },
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["/api/super-admin/wallets/statistics"],
    queryFn: async () => {
      return await getWalletStatistics();
    },
  });

  const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/super-admin/wallets/transactions", selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      return await getAgentWalletTransactions(selectedAgentId, { page, limit });
    },
    enabled: !!selectedAgentId,
  });

  const creditMutation = useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: CreditDebitData }) =>
      creditAgentWallet(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/wallets"] });
      toast({
        title: "Success",
        description: "Amount credited successfully",
      });
      setIsCreditDialogOpen(false);
      setCreditData({ amount: 0, category: "adjustment", note: "" });
      setSelectedAgentId("");
    },
  });

  const debitMutation = useMutation({
    mutationFn: ({ agentId, data }: { agentId: string; data: CreditDebitData }) =>
      debitAgentWallet(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/wallets"] });
      toast({
        title: "Success",
        description: "Amount debited successfully",
      });
      setIsDebitDialogOpen(false);
      setDebitData({ amount: 0, category: "adjustment", note: "" });
      setSelectedAgentId("");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { transactionId?: string; note?: string } }) =>
      approveWithdrawal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/wallets"] });
      toast({
        title: "Success",
        description: "Withdrawal approved successfully",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectWithdrawal(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/withdrawals"] });
      toast({
        title: "Success",
        description: "Withdrawal rejected successfully",
      });
    },
  });

  const wallets = walletsResponse?.data?.items || [];
  const withdrawals = withdrawalsResponse?.data?.items || [];
  const transactions = transactionsResponse?.data?.items || [];
  const stats = statsResponse?.data;

  const handleCredit = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsCreditDialogOpen(true);
  };

  const handleDebit = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsDebitDialogOpen(true);
  };

  const handleViewTransactions = (agentId: string) => {
    setSelectedAgentId(agentId);
    setActiveTab("transactions");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
          </div>
        </div>
        <p className="text-gray-600 text-sm ml-14">Manage agent wallets, transactions, and withdrawals</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Wallets"
            value={(stats.totalWallets || 0).toString()}
            icon={Wallet}
          />
          <StatCard
            title="Total Balance"
            value={`₹${(stats.totalBalance || 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Earned"
            value={`₹${(stats.totalEarned || 0).toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Withdrawals"
            value={`₹${(stats.pendingWithdrawals || 0).toLocaleString()}`}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Total Transactions"
            value={(stats.totalTransactions || 0).toString()}
            icon={ArrowDownRight}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets">
          <Card>
            <CardContent className="p-6">
              {walletsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Total Earned</TableHead>
                        <TableHead>Total Withdrawn</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                            No wallets found
                          </TableCell>
                        </TableRow>
                      ) : (
                        wallets.map((wallet: any) => (
                          <TableRow key={wallet._id}>
                            <TableCell>
                              {wallet.agent?.name || (typeof wallet.agentId === 'string' ? wallet.agentId : wallet.agentId?._id || wallet.agentId?.name || 'N/A')}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{(wallet.balance || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>₹{(wallet.totalEarned || 0).toLocaleString()}</TableCell>
                            <TableCell>₹{(wallet.totalWithdrawn || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCredit(wallet.agentId)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Credit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDebit(wallet.agentId)}
                                >
                                  <Minus className="h-4 w-4 mr-1" />
                                  Debit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewTransactions(wallet.agentId)}
                                >
                                  View Transactions
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="p-6">
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                            No withdrawal requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        withdrawals.map((withdrawal: any) => (
                          <TableRow key={withdrawal._id}>
                            <TableCell>
                              {withdrawal.agent?.name || (typeof withdrawal.agentId === 'string' ? withdrawal.agentId : withdrawal.agentId?._id || withdrawal.agentId?.name || 'N/A')}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{(withdrawal.amount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  withdrawal.status === "approved"
                                    ? "default"
                                    : withdrawal.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {withdrawal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {withdrawal.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      approveMutation.mutate({ id: withdrawal._id, data: {} })
                                    }
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const reason = prompt("Enter rejection reason:");
                                      if (reason) {
                                        rejectMutation.mutate({ id: withdrawal._id, reason });
                                      }
                                    }}
                                    disabled={rejectMutation.isPending}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-6">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                            {selectedAgentId
                              ? "No transactions found for this agent"
                              : "Select an agent to view transactions"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction: any) => (
                          <TableRow key={transaction._id}>
                            <TableCell>
                              <Badge
                                variant={transaction.type === "credit" ? "default" : "secondary"}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{(transaction.amount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "success"
                                    ? "default"
                                    : transaction.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credit Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Agent Wallet</DialogTitle>
            <DialogDescription>Add funds to agent wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Amount *</Label>
              <Input
                id="credit-amount"
                type="number"
                value={creditData.amount}
                onChange={(e) =>
                  setCreditData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-category">Category</Label>
              <Select
                value={creditData.category}
                onValueChange={(value: any) =>
                  setCreditData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topup">Topup</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-note">Note</Label>
              <Textarea
                id="credit-note"
                value={creditData.note}
                onChange={(e) => setCreditData((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreditDialogOpen(false);
                setCreditData({ amount: 0, category: "adjustment", note: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (creditData.amount > 0) {
                  creditMutation.mutate({ agentId: selectedAgentId, data: creditData });
                }
              }}
              disabled={creditMutation.isPending || creditData.amount <= 0}
            >
              {creditMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crediting...
                </>
              ) : (
                "Credit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debit Dialog */}
      <Dialog open={isDebitDialogOpen} onOpenChange={setIsDebitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debit Agent Wallet</DialogTitle>
            <DialogDescription>Deduct funds from agent wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="debit-amount">Amount *</Label>
              <Input
                id="debit-amount"
                type="number"
                value={debitData.amount}
                onChange={(e) =>
                  setDebitData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debit-category">Category</Label>
              <Select
                value={debitData.category}
                onValueChange={(value: any) =>
                  setDebitData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="debit-note">Note</Label>
              <Textarea
                id="debit-note"
                value={debitData.note}
                onChange={(e) => setDebitData((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDebitDialogOpen(false);
                setDebitData({ amount: 0, category: "adjustment", note: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (debitData.amount > 0) {
                  debitMutation.mutate({ agentId: selectedAgentId, data: debitData });
                }
              }}
              disabled={debitMutation.isPending || debitData.amount <= 0}
            >
              {debitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debiting...
                </>
              ) : (
                "Debit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

