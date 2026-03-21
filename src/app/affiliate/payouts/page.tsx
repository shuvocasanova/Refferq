'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  CheckCircle2,
  Ban,
  Wallet,
  CreditCard,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/currency-format';

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
}

export default function PayoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);

  useEffect(() => {
    if (!authLoading && user) fetchPayouts();
  }, [authLoading, user]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const [payRes, profileRes] = await Promise.all([
        fetch('/api/affiliate/payouts'),
        fetch('/api/affiliate/profile'),
      ]);
      const payData = await payRes.json();
      const profileData = await profileRes.json();
      if (payData.success) setPayouts(payData.payouts || []);
      if (profileData.success) {
        setBalance(profileData.affiliate?.balanceCents || 0);
        setCurrencySymbol(profileData.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (cents: number) =>
    `${currencySymbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
      COMPLETED: { variant: 'default', icon: CheckCircle2 },
      PAID: { variant: 'default', icon: CheckCircle2 },
      PENDING: { variant: 'secondary', icon: Clock },
      PROCESSING: { variant: 'secondary', icon: Loader2 },
      FAILED: { variant: 'destructive', icon: Ban },
    };
    const { variant, icon: Icon } = map[status] || { variant: 'outline' as const, icon: Clock };
    return (
      <Badge variant={variant} className="gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const totalPaid = payouts.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayout = payouts.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  const exportCSV = () => {
    const headers = ['Date', 'Method', 'Status', 'Amount'];
    const rows = payouts.map((p) => [
      formatDate(p.paidAt || p.createdAt),
      p.method,
      p.status,
      (p.amount / 100).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <div className="gap-4 grid md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">Track your earnings and payout history</p>
        </div>
        {payouts.length > 0 && (
          <Button variant="outline" onClick={exportCSV} className="gap-1.5">
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-emerald-500/10 rounded-lg w-10 h-10">
                <span className="font-bold text-emerald-600 text-sm">{currencySymbol}</span>
              </div>
              <div>
                <p className="font-bold text-2xl">{formatCurrency(balance)}</p>
                <p className="text-muted-foreground text-xs">Current Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-blue-500/10 rounded-lg w-10 h-10">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-600 text-2xl">{formatCurrency(totalPaid)}</p>
                <p className="text-muted-foreground text-xs">Total Paid</p>
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
                <p className="font-bold text-amber-600 text-2xl">{formatCurrency(pendingPayout)}</p>
                <p className="text-muted-foreground text-xs">Pending</p>
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
                <p className="font-bold text-lg">{payouts.length}</p>
                <p className="text-muted-foreground text-xs">Total Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout info */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="mt-0.5 w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900 text-sm">Payout Schedule</p>
            <p className="text-blue-700 text-sm">
              Payouts are processed on the 1st of each month for the previous month&apos;s earnings. Minimum payout threshold is {currencySymbol}1,000.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout History</CardTitle>
          <CardDescription>{payouts.length} payout{payouts.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-center">
              <Wallet className="mb-3 w-12 h-12 text-muted-foreground/40" />
              <p className="font-medium">No payouts yet</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Start referring customers to earn commissions
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="text-sm">{formatDate(payout.paidAt || payout.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{payout.method || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="font-semibold text-right">{formatCurrency(payout.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
