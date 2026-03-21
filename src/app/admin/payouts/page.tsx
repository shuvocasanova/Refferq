'use client';

import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  Ban,
  Download,
} from 'lucide-react';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/currency-format';

interface Payout {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  amountCents: number;
  commissionCount: number;
  status: string;
  method: string;
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  PROCESSING: { label: 'Processing', variant: 'outline', icon: Loader2 },
  COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/admin/payouts');
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts || []);
        setCurrencySymbol(data.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/payouts?format=csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export payouts:', error);
    }
  };

  if (loading) {
    return <PayoutsSkeleton />;
  }

  const filtered = payouts.filter((p) => statusFilter === 'all' || p.status === statusFilter);

  const stats = {
    total: payouts.length,
    pending: payouts.filter((p) => p.status === 'PENDING').length,
    completed: payouts.filter((p) => p.status === 'COMPLETED').length,
    totalPaid: payouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amountCents, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <div className="gap-4 grid md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">Manage partner commission payouts</p>
      </div>

      <div className="gap-4 grid md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Total Payouts</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Completed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Total Paid</CardTitle>
            <span className="font-bold text-muted-foreground text-sm">{currencySymbol}</span>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {currencySymbol}{(stats.totalPaid / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>All partner payout records</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 w-4 h-4" />
                Export CSV
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-lg">No payouts found</h3>
              <p className="text-muted-foreground text-sm">Payouts will appear here once processed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commissions</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payout) => {
                  const cfg = statusConfig[payout.status] || statusConfig.PENDING;
                  return (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{payout.affiliateName}</p>
                          <p className="text-muted-foreground text-xs">{payout.affiliateEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {currencySymbol}{(payout.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{payout.commissionCount}</TableCell>
                      <TableCell className="text-sm">{payout.method || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {payout.processedAt
                          ? new Date(payout.processedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PayoutsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="mb-1 w-36 h-7" />
          <Skeleton className="w-64 h-4" />
        </div>
      </div>

      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="w-24 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-32 h-8" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="mb-1 w-32 h-6" />
              <Skeleton className="w-48 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-9" />
              <Skeleton className="w-32 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
