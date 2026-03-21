'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  Wallet,
  UserCheck,
  CreditCard,
  Activity,
  Eye,
} from 'lucide-react';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyCents } from '@/lib/currency-format';

interface DashboardStats {
  totalRevenue: number;
  totalEstimatedRevenue: number;
  totalEstimatedCommission: number;
  totalClicks: number;
  totalLeads: number;
  totalReferredCustomers: number;
  totalAffiliates: number;
  pendingReferrals: number;
}

interface TopAffiliate {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  totalRevenue: number;
  totalReferrals: number;
}

interface RecentCustomer {
  id: string;
  leadName: string;
  leadEmail: string;
  affiliateName: string;
  amountPaid: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topAffiliates, setTopAffiliates] = useState<TopAffiliate[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, referralsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/analytics?days=30'),
        fetch('/api/admin/referrals'),
      ]);

      const [statsData, analyticsData, referralsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        referralsRes.json(),
      ]);

      if (statsData.success) {
        setCurrencySymbol(statsData.currencySymbol || DEFAULT_CURRENCY_SYMBOL);
        setStats({
          totalRevenue: statsData.stats.totalRevenue || 0,
          totalEstimatedRevenue: statsData.stats.totalEstimatedRevenue || 0,
          totalEstimatedCommission: statsData.stats.totalEstimatedCommission || 0,
          totalClicks: 0,
          totalLeads: statsData.stats.totalReferrals || 0,
          totalReferredCustomers: statsData.stats.approvedReferrals || 0,
          totalAffiliates: statsData.stats.totalAffiliates || 0,
          pendingReferrals: statsData.stats.pendingReferrals || 0,
        });
      }

      if (analyticsData.success && analyticsData.analytics.topAffiliates) {
        setTopAffiliates(analyticsData.analytics.topAffiliates.slice(0, 5));
      }

      if (referralsData.success) {
        const recent = referralsData.referrals.slice(0, 10).map((ref: any) => ({
          id: ref.id,
          leadName: ref.leadName,
          leadEmail: ref.leadEmail,
          affiliateName: ref.affiliate.name,
          amountPaid: 0,
          status: ref.status,
          createdAt: ref.createdAt,
        }));
        setRecentCustomers(recent);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: 'Estimated Revenue',
      value: formatCurrencyCents(stats?.totalEstimatedRevenue || 0, currencySymbol),
      icon: Wallet,
      description: 'Total projected value',
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Confirmed Revenue',
      value: formatCurrencyCents(stats?.totalRevenue || 0, currencySymbol),
      icon: TrendingUp,
      description: 'Approved transactions',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Commission Owed',
      value: formatCurrencyCents(stats?.totalEstimatedCommission || 0, currencySymbol),
      icon: Wallet,
      description: 'Pending payouts',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Total Partners',
      value: stats?.totalAffiliates || 0,
      icon: Users,
      description: 'Active affiliates',
      trend: '+5',
      trendUp: true,
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
  ];

  const conversionRate = stats && stats.totalLeads > 0
    ? ((stats.totalReferredCustomers / stats.totalLeads) * 100).toFixed(1)
    : '0.0';

  const quickActions = [
    {
      title: 'Partners',
      description: 'Manage affiliates',
      icon: Users,
      href: '/admin/partners',
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Customers',
      description: 'View referrals',
      icon: UserCheck,
      href: '/admin/customers',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Payouts',
      description: 'Process payments',
      icon: CreditCard,
      href: '/admin/payouts',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Reports',
      description: 'Analytics & insights',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your affiliate program performance
          </p>
        </div>

        {/* Primary Stat Cards */}
        <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-muted-foreground text-sm">{stat.title}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-2xl tracking-tight">{stat.value}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground text-xs">{stat.description}</span>
                  {stat.trend && (
                    <Badge variant="secondary" className="gap-0.5 bg-emerald-50 px-1.5 border-0 h-5 font-semibold text-[10px] text-emerald-700">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Overview Row */}
        <div className="gap-4 grid md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-amber-500/10 rounded-xl w-12 h-12">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-2xl">{stats?.pendingReferrals || 0}</p>
                  <p className="text-muted-foreground text-sm">Pending Leads</p>
                </div>
                {(stats?.pendingReferrals || 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => router.push('/admin/customers')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Review pending</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-blue-500/10 rounded-xl w-12 h-12">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-2xl">{stats?.totalLeads || 0}</p>
                  <p className="text-muted-foreground text-sm">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-emerald-500/10 rounded-xl w-12 h-12">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-2xl">{stats?.totalReferredCustomers || 0}</p>
                  <p className="text-muted-foreground text-sm">Conversions</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-muted-foreground text-xs">Rate</p>
                  <p className="font-bold text-emerald-600 text-sm">{conversionRate}%</p>
                </div>
              </div>
              <Progress
                value={parseFloat(conversionRate)}
                className="[&>div]:bg-emerald-500 mt-3 h-1.5"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="group hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bg}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-muted-foreground text-xs">{action.description}</p>
                </div>
                <ArrowRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Tables */}
        <div className="gap-6 grid lg:grid-cols-2">
          {/* Top Partners */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div>
                <CardTitle className="font-semibold text-base">Top Partners</CardTitle>
                <CardDescription>Best performing affiliates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/admin/partners')}>
                View all
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {topAffiliates.length > 0 ? (
                <div className="space-y-1">
                  {topAffiliates.map((affiliate: any, index: number) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center gap-3 hover:bg-muted/50 p-2.5 rounded-lg transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/partners/${affiliate.id}`)}
                    >
                      <span className="flex justify-center items-center bg-muted rounded-full w-6 h-6 font-bold text-muted-foreground text-xs">
                        {index + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
                          {affiliate.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{affiliate.name}</p>
                        <p className="font-mono text-muted-foreground text-xs">{affiliate.referralCode}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">{formatCurrencyCents(affiliate.totalRevenue, currencySymbol)}</p>
                        <p className="text-[11px] text-muted-foreground">{affiliate.totalReferrals} referrals</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No partners yet"
                  description="Partners will appear here once they join"
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Customers */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div>
                <CardTitle className="font-semibold text-base">Recent Customers</CardTitle>
                <CardDescription>Latest referred customers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/admin/customers')}>
                View all
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {recentCustomers.length > 0 ? (
                <div className="space-y-1">
                  {recentCustomers.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 hover:bg-muted/50 p-2.5 rounded-lg transition-colors"
                    >
                      <p className="w-12 text-[11px] text-muted-foreground text-center shrink-0">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{customer.leadEmail}</p>
                        <p className="text-muted-foreground text-xs">via {customer.affiliateName}</p>
                      </div>
                      <StatusBadge status={customer.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title="No customers yet"
                  description="Referred customers will appear here"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
    APPROVED: { variant: 'default', label: 'Approved' },
    PENDING: { variant: 'secondary', label: 'Pending' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
  };
  const { variant, label } = config[status] || { variant: 'secondary' as const, label: status };

  return (
    <Badge variant={variant} className="px-2 py-0.5 font-medium text-[10px]">
      {label}
    </Badge>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col justify-center items-center py-10 text-center">
      <div className="flex justify-center items-center bg-muted rounded-xl w-12 h-12">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="mt-3 font-medium text-muted-foreground text-sm">{title}</p>
      <p className="mt-1 text-muted-foreground/70 text-xs">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-1 w-36 h-7" />
        <Skeleton className="w-64 h-4" />
      </div>
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="rounded-lg w-9 h-9" />
              </div>
              <Skeleton className="mt-2 w-32 h-8" />
              <Skeleton className="mt-2 w-20 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="gap-4 grid md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="rounded-xl w-12 h-12" />
              <div>
                <Skeleton className="mb-1 w-16 h-7" />
                <Skeleton className="w-24 h-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="gap-6 grid lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-48 h-3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="rounded-full w-8 h-8" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 w-32 h-4" />
                      <Skeleton className="w-20 h-3" />
                    </div>
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
