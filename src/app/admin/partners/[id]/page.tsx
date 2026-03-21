'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Users,
  Wallet,
  CreditCard,
  Copy,
  ExternalLink,
  Loader2,
  MousePointerClick,
  Target,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyCents } from '@/lib/currency-format';

interface Partner {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  partnerGroup?: string;
  commissionRate: number;
  status: string;
  totalClicks: number;
  totalLeads: number;
  totalRevenue: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  status: string;
  totalPaid: number;
  createdAt: string;
}

interface Commission {
  id: string;
  transactionId: string;
  customerName: string;
  amountCents: number;
  rate: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED';
  createdAt: string;
  paidAt?: string;
}

interface Payout {
  id: string;
  amountCents: number;
  commissionCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  method?: string;
  createdAt: string;
  processedAt?: string;
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingPayout, setEditingPayout] = useState<Payout | null>(null);
  const [newStatus, setNewStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    if (user && partnerId) {
      fetchPartnerData();
      fetchCustomers();
      fetchCommissions();
      fetchPayouts();
    }
  }, [authLoading, user, partnerId]);

  const fetchPartnerData = async () => {
    try {
      const res = await fetch('/api/admin/affiliates');
      if (res.ok) {
        const data = await res.json();
        setCurrencySymbol(data.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
        const affiliate = data.affiliates?.find((a: any) => a.id === partnerId);
        if (affiliate) {
          setPartner({
            id: affiliate.id,
            name: affiliate.name,
            email: affiliate.email,
            referralCode: affiliate.referralCode,
            partnerGroup: affiliate.partnerGroup,
            commissionRate: affiliate.commissionRate || 0.20,
            status: affiliate.status,
            totalClicks: affiliate.totalClicks || 0,
            totalLeads: affiliate.totalLeads || 0,
            totalRevenue: affiliate.totalRevenue || 0,
            createdAt: affiliate.createdAt,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/referrals');
      if (res.ok) {
        const data = await res.json();
        const partnerCustomers = data.referrals
          ?.filter((r: any) => r.affiliateId === partnerId)
          .map((r: any) => ({
            id: r.id,
            name: r.leadName,
            email: r.leadEmail,
            status: r.status,
            totalPaid: r.estimatedValue || 0,
            createdAt: r.createdAt,
          })) || [];
        setCustomers(partnerCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCommissions = async () => {
    try {
      const res = await fetch(`/api/admin/transactions?affiliateId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        const comms = data.transactions?.map((txn: any) => ({
          id: txn.id,
          transactionId: txn.id,
          customerName: txn.customerName,
          amountCents: txn.commissionCents,
          rate: txn.commissionRate,
          status: txn.status === 'COMPLETED' ? 'PENDING' : txn.status,
          createdAt: txn.createdAt,
          paidAt: txn.paidAt,
        })) || [];
        setCommissions(comms);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`/api/admin/payouts?affiliateId=${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const handleCreatePayout = async () => {
    if (selectedCommissions.length === 0) {
      alert('Please select at least one commission to create a payout');
      return;
    }
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId: partnerId, commissionIds: selectedCommissions }),
      });
      if (res.ok) {
        alert('Payout created successfully!');
        setShowPayoutModal(false);
        setSelectedCommissions([]);
        fetchCommissions();
        fetchPayouts();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to create payout'}`);
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      alert('Failed to create payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleUpdatePayoutStatus = async () => {
    if (!editingPayout) return;
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPayout.id, status: newStatus }),
      });
      if (res.ok) {
        alert('Payout status updated successfully!');
        setShowStatusModal(false);
        setEditingPayout(null);
        fetchPayouts();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to update payout status'}`);
      }
    } catch (error) {
      console.error('Error updating payout status:', error);
      alert('Failed to update payout status');
    } finally {
      setPayoutLoading(false);
    }
  };

  const openStatusModal = (payout: Payout) => {
    setEditingPayout(payout);
    setNewStatus(payout.status);
    setShowStatusModal(true);
  };

  const toggleCommissionSelection = (commissionId: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(commissionId) ? prev.filter((id) => id !== commissionId) : [...prev, commissionId]
    );
  };

  const formatCurrency = (cents: number) =>
    formatCurrencyCents(cents, currencySymbol, 'en-IN');

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const pendingCommissions = commissions.filter((c) => c.status === 'PENDING');
  const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amountCents, 0);
  const paidCommissions = commissions.filter((c) => c.status === 'PAID');
  const paidAmount = paidCommissions.reduce((sum, c) => sum + c.amountCents, 0);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
      COMPLETED: { variant: 'default', icon: CheckCircle2 },
      PAID: { variant: 'default', icon: CheckCircle2 },
      ACTIVE: { variant: 'default', icon: CheckCircle2 },
      APPROVED: { variant: 'default', icon: CheckCircle2 },
      PENDING: { variant: 'secondary', icon: Clock },
      PROCESSING: { variant: 'secondary', icon: Loader2 },
      FAILED: { variant: 'destructive', icon: AlertCircle },
      REFUNDED: { variant: 'destructive', icon: Ban },
      REJECTED: { variant: 'destructive', icon: Ban },
    };
    const { variant, icon: Icon } = map[status] || { variant: 'outline' as const, icon: Clock };
    return (
      <Badge variant={variant} className="gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return <DetailSkeleton />;
  }

  if (!partner) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center">
        <div className="flex justify-center items-center bg-muted rounded-2xl w-16 h-16">
          <Users className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="mt-4 font-bold text-xl">Partner not found</h2>
        <p className="mt-1 text-muted-foreground text-sm">This partner may have been removed</p>
        <Button className="mt-6" onClick={() => router.push('/admin/partners')}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Partners
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.push('/admin/partners')}>
            <ArrowLeft className="mr-1 w-4 h-4" />
            Partners
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary/10 font-bold text-primary text-lg">
                {(partner.name || 'P').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">{partner.name}</h1>
              <p className="text-muted-foreground text-sm">{partner.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge variant="outline" className="gap-1 font-mono text-xs">
                  <Copy className="w-3 h-3" />
                  {partner.referralCode}
                </Badge>
                {partner.partnerGroup && (
                  <Badge variant="secondary" className="text-xs">
                    {partner.partnerGroup}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {(partner.commissionRate * 100).toFixed(0)}% commission
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setShowPayoutModal(true)}
          disabled={pendingCommissions.length === 0}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Payout
        </Button>
      </div>

      {/* Stats */}
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-blue-500/10 rounded-lg w-10 h-10">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-2xl">{customers.length}</p>
                <p className="text-muted-foreground text-xs">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-amber-500/10 rounded-lg w-10 h-10">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-600 text-2xl">{formatCurrency(pendingAmount)}</p>
                <p className="text-muted-foreground text-xs">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-emerald-500/10 rounded-lg w-10 h-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-600 text-2xl">{formatCurrency(paidAmount)}</p>
                <p className="text-muted-foreground text-xs">Paid Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-violet-500/10 rounded-lg w-10 h-10">
                <CreditCard className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-2xl">{payouts.length}</p>
                <p className="text-muted-foreground text-xs">Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="commissions">Commissions ({commissions.length})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="gap-6 grid lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Partner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Name', value: partner.name },
                  { label: 'Email', value: partner.email },
                  { label: 'Referral Code', value: partner.referralCode, mono: true },
                  { label: 'Partner Group', value: partner.partnerGroup || 'Default' },
                  { label: 'Commission Rate', value: `${(partner.commissionRate * 100).toFixed(0)}%` },
                  { label: 'Partner Since', value: formatDate(partner.createdAt) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className={`text-sm font-medium ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="gap-4 grid grid-cols-3">
                  <div className="text-center">
                    <div className="flex justify-center items-center bg-muted mx-auto rounded-lg w-10 h-10">
                      <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 font-bold text-xl">{partner.totalClicks}</p>
                    <p className="text-muted-foreground text-xs">Clicks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center items-center bg-muted mx-auto rounded-lg w-10 h-10">
                      <Target className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 font-bold text-xl">{partner.totalLeads}</p>
                    <p className="text-muted-foreground text-xs">Leads</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center items-center bg-muted mx-auto rounded-lg w-10 h-10">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="mt-2 font-bold text-emerald-600 text-xl">
                      {formatCurrency(partner.totalRevenue * 100)}
                    </p>
                    <p className="text-muted-foreground text-xs">Revenue</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Commissions</span>
                    <span className="font-bold text-sm">{commissions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Pending Amount</span>
                    <span className="font-bold text-amber-600 text-sm">{formatCurrency(pendingAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Paid Amount</span>
                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(paidAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referred Customers</CardTitle>
              <CardDescription>{customers.length} customer{customers.length !== 1 ? 's' : ''} referred</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell className="font-medium text-right">{formatCurrency(customer.totalPaid * 100)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(customer.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col justify-center items-center py-12 text-center">
                  <Users className="mb-3 w-10 h-10 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground text-sm">No customers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-base">Commission History</CardTitle>
                <CardDescription>
                  Pending: {formatCurrency(pendingAmount)} · Paid: {formatCurrency(paidAmount)}
                </CardDescription>
              </div>
              {pendingCommissions.length > 0 && (
                <Button size="sm" onClick={() => setShowPayoutModal(true)}>
                  <Plus className="mr-1 w-3.5 h-3.5" />
                  Create Payout
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {commissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(comm.createdAt)}</TableCell>
                        <TableCell className="font-medium">{comm.customerName}</TableCell>
                        <TableCell className="font-semibold text-primary text-right">{formatCurrency(comm.amountCents)}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{(comm.rate * 100).toFixed(0)}%</TableCell>
                        <TableCell>{getStatusBadge(comm.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col justify-center items-center py-12 text-center">
                  <Wallet className="mb-3 w-10 h-10 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground text-sm">No commissions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-base">Payout History</CardTitle>
                <CardDescription>{payouts.length} payout{payouts.length !== 1 ? 's' : ''}</CardDescription>
              </div>
              {pendingCommissions.length > 0 && (
                <Button size="sm" onClick={() => setShowPayoutModal(true)}>
                  <Plus className="mr-1 w-3.5 h-3.5" />
                  Create Payout
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {payouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Commissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead className="w-24">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(payout.createdAt)}</TableCell>
                        <TableCell className="font-semibold text-emerald-600 text-right">{formatCurrency(payout.amountCents)}</TableCell>
                        <TableCell className="text-right">{payout.commissionCount}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{payout.method || '\u2014'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {payout.processedAt ? formatDate(payout.processedAt) : '\u2014'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openStatusModal(payout)}>
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col justify-center items-center py-12 text-center">
                  <Wallet className="mb-3 w-10 h-10 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground text-sm">No payouts yet</p>
                  {pendingCommissions.length > 0 && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowPayoutModal(true)}>
                      Create First Payout
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Payout Dialog */}
      <Dialog open={showPayoutModal} onOpenChange={(open) => {
        setShowPayoutModal(open);
        if (!open) setSelectedCommissions([]);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Payout</DialogTitle>
            <DialogDescription>Select commissions to include in this payout</DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-muted-foreground text-sm">Selected total</p>
            <p className="font-bold text-primary text-2xl">
              {formatCurrency(
                selectedCommissions.reduce((sum, id) => {
                  const comm = pendingCommissions.find((c) => c.id === id);
                  return sum + (comm?.amountCents || 0);
                }, 0)
              )}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              {selectedCommissions.length} of {pendingCommissions.length} commissions
            </p>
          </div>

          <div className="space-y-2 pr-1 max-h-64 overflow-y-auto">
            {pendingCommissions.map((comm) => (
              <div
                key={comm.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                  selectedCommissions.includes(comm.id)
                    ? 'border-primary/50 bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleCommissionSelection(comm.id)}
              >
                <Checkbox
                  checked={selectedCommissions.includes(comm.id)}
                  onCheckedChange={() => toggleCommissionSelection(comm.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{comm.customerName}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(comm.createdAt)} · {(comm.rate * 100).toFixed(0)}%
                  </p>
                </div>
                <span className="font-semibold text-primary text-sm shrink-0">
                  {formatCurrency(comm.amountCents)}
                </span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPayoutModal(false); setSelectedCommissions([]); }}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayout} disabled={payoutLoading || selectedCommissions.length === 0}>
              {payoutLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Create Payout ({selectedCommissions.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusModal} onOpenChange={(open) => {
        setShowStatusModal(open);
        if (!open) setEditingPayout(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payout Status</DialogTitle>
            <DialogDescription>Change the processing status of this payout</DialogDescription>
          </DialogHeader>

          {editingPayout && (
            <>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm">Payout Amount</p>
                <p className="font-bold text-emerald-600 text-2xl">{formatCurrency(editingPayout.amountCents)}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {editingPayout.commissionCount} commissions · Created {formatDate(editingPayout.createdAt)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as typeof newStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending \u2014 Awaiting processing</SelectItem>
                    <SelectItem value="PROCESSING">Processing \u2014 Payment in progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed \u2014 Payment successful</SelectItem>
                    <SelectItem value="FAILED">Failed \u2014 Payment failed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {newStatus === 'COMPLETED' && 'Affiliate will be notified of payment completion'}
                  {newStatus === 'PROCESSING' && 'Payout is being processed'}
                  {newStatus === 'FAILED' && 'Payment failed, may need manual intervention'}
                  {newStatus === 'PENDING' && 'Payout is waiting to be processed'}
                </p>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowStatusModal(false); setEditingPayout(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayoutStatus} disabled={payoutLoading}>
              {payoutLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="rounded-full w-14 h-14" />
        <div>
          <Skeleton className="mb-1 w-48 h-7" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="rounded-lg w-10 h-10" />
                <div>
                  <Skeleton className="mb-1 w-20 h-7" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="w-96 h-10" />
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
