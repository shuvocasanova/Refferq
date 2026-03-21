'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  Eye,
} from 'lucide-react';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyValue } from '@/lib/currency-format';

interface Referral {
  id: string;
  leadEmail: string;
  leadName: string;
  leadPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  estimatedValue: number;
  company: string;
  affiliate: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    partnerGroup: string;
    commissionRate: number;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  APPROVED: { label: 'Approved', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
};

export default function CustomersPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/admin/referrals');
      const data = await res.json();
      if (data.success) {
        setCurrencySymbol(data.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (referralIds: string[], action: 'approve' | 'reject') => {
    setActionLoading(referralIds[0]);
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralIds, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReferrals();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = referrals.filter((r) => {
    const matchesSearch =
      r.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leadEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    approved: referrals.filter((r) => r.status === 'APPROVED').length,
    rejected: referrals.filter((r) => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <div className="gap-4 grid md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage referral leads and customer conversions</p>
      </div>

      {/* Stats */}
      <div className="gap-4 grid md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Total Leads</CardTitle>
            <UserCheck className="w-4 h-4 text-muted-foreground" />
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
            <CardTitle className="font-medium text-sm">Approved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="font-medium text-sm">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Review and manage referral leads from your partners</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-lg">No leads found</h3>
              <p className="text-muted-foreground text-sm">Leads submitted by your partners will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {referral.leadName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{referral.leadName}</p>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Mail className="w-3 h-3" />
                            {referral.leadEmail}
                          </div>
                          {referral.leadPhone && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Phone className="w-3 h-3" />
                              {referral.leadPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {referral.company ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {referral.company}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{referral.affiliate.name}</p>
                        <p className="text-muted-foreground text-xs">{referral.affiliate.partnerGroup}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {formatCurrencyValue(referral.estimatedValue, currencySymbol, 'en-IN', 0, 2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[referral.status]?.variant || 'outline'}>
                        {statusConfig[referral.status]?.label || referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(referral.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/customers/${referral.id}`)}
                        >
                          <Eye className="mr-1 w-3.5 h-3.5" />
                          View
                        </Button>
                        {referral.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => { e.stopPropagation(); handleAction([referral.id], 'approve'); }}
                              disabled={actionLoading === referral.id}
                            >
                              <CheckCircle2 className="mr-1 w-3.5 h-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => { e.stopPropagation(); handleAction([referral.id], 'reject'); }}
                              disabled={actionLoading === referral.id}
                            >
                              <XCircle className="mr-1 w-3.5 h-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
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
