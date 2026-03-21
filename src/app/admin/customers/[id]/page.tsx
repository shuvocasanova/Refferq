'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Trash2,
  Link2,
  FileText,
  Shield,
  Loader2,
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
    partnerGroupId: string | null;
    commissionRate: number;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      const res = await fetch('/api/admin/referrals');
      const data = await res.json();
      if (data.success) {
        setCurrencySymbol(data.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
        const found = data.referrals.find((r: Referral) => r.id === id);
        if (found) {
          setReferral(found);
          setEditName(found.leadName);
          setEditEmail(found.leadEmail);
        }
      }
    } catch (error) {
      console.error('Failed to fetch referral:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: editName,
          leadEmail: editEmail,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchReferral();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/referrals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNotes: reviewNotes || undefined }),
      });
      if (res.ok) {
        await fetchReferral();
        setReviewNotes('');
      }
    } catch (error) {
      console.error('Failed to process action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/referrals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/customers');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9" />
          <Skeleton className="w-48 h-8" />
        </div>
        <div className="gap-6 grid md:grid-cols-3">
          <Skeleton className="md:col-span-2 h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/admin/customers')}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Customers
        </Button>
        <div className="flex flex-col justify-center items-center py-20 text-center">
          <User className="w-12 h-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold text-lg">Customer not found</h3>
          <p className="text-muted-foreground text-sm">This referral lead may have been deleted</p>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[referral.status] || statusConfig.PENDING;
  const StatusIcon = cfg.icon;
  const estimatedCommission = Math.round(referral.estimatedValue * referral.affiliate.commissionRate);
  const formatCurrency = (amount: number) => formatCurrencyValue(amount, currencySymbol, 'en-IN', 0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/customers')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-lg">
                {referral.leadName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">{referral.leadName}</h1>
              <p className="text-muted-foreground text-sm">{referral.leadEmail}</p>
            </div>
          </div>
          <Badge variant={cfg.variant} className="ml-2">
            <StatusIcon className="mr-1 w-3 h-3" />
            {cfg.label}
          </Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 w-4 h-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this referral lead?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{referral.leadName}</strong> and all associated
                conversions and commissions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="gap-6 grid md:grid-cols-3">
        {/* Left Column - Details & Edit */}
        <div className="space-y-6 md:col-span-2">
          {/* Lead Details Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Lead Details
                  </CardTitle>
                  <CardDescription>View and edit customer information</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saved ? (
                    <>
                      <CheckCircle2 className="mr-2 w-4 h-4 text-green-500" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="gap-2 grid">
                  <Label htmlFor="leadName">Full Name</Label>
                  <Input
                    id="leadName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="gap-2 grid">
                  <Label htmlFor="leadEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
                    <Input
                      id="leadEmail"
                      type="email"
                      className="pl-9"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="gap-4 grid md:grid-cols-2">
                <div className="gap-2 grid">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" value={referral.leadPhone || '—'} readOnly disabled />
                  </div>
                </div>
                <div className="gap-2 grid">
                  <Label>Company</Label>
                  <div className="relative">
                    <Building2 className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" value={referral.company || '—'} readOnly disabled />
                  </div>
                </div>
              </div>
              {referral.notes && (
                <div className="gap-2 grid">
                  <Label>Notes</Label>
                  <div className="bg-muted/50 p-3 border rounded-md text-sm">{referral.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Actions Card - only for PENDING */}
          {referral.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Review Lead
                </CardTitle>
                <CardDescription>Approve or reject this referral lead</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="gap-2 grid">
                  <Label htmlFor="reviewNotes">Review Notes (optional)</Label>
                  <Textarea
                    id="reviewNotes"
                    placeholder="Add notes about this review decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 w-4 h-4" />
                    )}
                    Approve Lead
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 w-4 h-4" />
                    )}
                    Reject Lead
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Value Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Estimated Value</span>
                <span className="font-semibold">{formatCurrency(referral.estimatedValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Commission Rate</span>
                <span className="font-semibold">{(referral.affiliate.commissionRate * 100).toFixed(0)}%</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Est. Commission</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(estimatedCommission)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Referring Partner Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <Link2 className="w-4 h-4" />
                Referring Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {referral.affiliate.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{referral.affiliate.name}</p>
                  <p className="text-muted-foreground text-xs">{referral.affiliate.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referral Code</span>
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
                    {referral.affiliate.referralCode}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner Group</span>
                  <Badge variant="outline" className="text-xs">{referral.affiliate.partnerGroup}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <Calendar className="w-4 h-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 mt-0.5 p-1 rounded-full">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lead Submitted</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(referral.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' at '}
                      {new Date(referral.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    referral.status === 'APPROVED'
                      ? 'bg-green-100'
                      : referral.status === 'REJECTED'
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                  }`}>
                    <StatusIcon className={`h-3 w-3 ${
                      referral.status === 'APPROVED'
                        ? 'text-green-600'
                        : referral.status === 'REJECTED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {referral.status === 'APPROVED'
                        ? 'Approved'
                        : referral.status === 'REJECTED'
                          ? 'Rejected'
                          : 'Awaiting Review'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {referral.status === 'PENDING'
                        ? 'Needs admin review'
                        : 'Decision recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
