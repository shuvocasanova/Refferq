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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings2,
  Save,
  Plus,
  Pencil,
  Trash2,
  Percent,
  CheckCircle2,
  Globe,
  Code2,
  Copy,
  ExternalLink,
  Zap,
  Clock,
} from 'lucide-react';
import { getCurrencySymbolForCode } from '@/lib/currency-format';

interface ProgramSettings {
  id: string;
  programId: string;
  productName: string;
  programName: string;
  websiteUrl: string;
  currency: string;
  portalSubdomain: string;
  minimumPayoutThreshold: number;
  payoutTerm: string;
  commissionHoldDays: number;
  commissionRules: CommissionRule[];
}

interface CommissionRule {
  id: string;
  name: string;
  type: string;
  value: number;
  conditions: Record<string, unknown>;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function ProgramSettingsPage() {
  const [settings, setSettings] = useState<ProgramSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Commission rule dialog
  const [ruleDialog, setRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    type: 'PERCENTAGE',
    value: '',
    isDefault: false,
  });
  const [savingRule, setSavingRule] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopySnippet = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: settings.productName,
          programName: settings.programName,
          websiteUrl: settings.websiteUrl,
          currency: settings.currency,
          portalSubdomain: settings.portalSubdomain,
          minimumPayoutThreshold: settings.minimumPayoutThreshold,
          payoutTerm: settings.payoutTerm,
          commissionHoldDays: settings.commissionHoldDays,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRule = async () => {
    setSavingRule(true);
    try {
      const action = editingRule ? 'update' : 'create';
      const ruleData = editingRule
        ? { id: editingRule.id, name: ruleForm.name, type: ruleForm.type, value: parseFloat(ruleForm.value), isDefault: ruleForm.isDefault }
        : { name: ruleForm.name, type: ruleForm.type, value: parseFloat(ruleForm.value), isDefault: ruleForm.isDefault };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ruleData }),
      });
      if (res.ok) {
        await fetchSettings();
        setRuleDialog(false);
        setEditingRule(null);
        setRuleForm({ name: '', type: 'PERCENTAGE', value: '', isDefault: false });
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this commission rule?')) return;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ruleData: { id } }),
      });
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const openCreateRule = () => {
    setEditingRule(null);
    setRuleForm({ name: '', type: 'PERCENTAGE', value: '', isDefault: false });
    setRuleDialog(true);
  };

  const openEditRule = (rule: CommissionRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      type: rule.type,
      value: String(rule.value),
      isDefault: rule.isDefault,
    });
    setRuleDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-56 h-8" />
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Program Settings</h1>
        <p className="text-muted-foreground">Configure your affiliate program</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic program configuration</CardDescription>
            </div>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saved ? (
                <>
                  <CheckCircle2 className="mr-2 w-4 h-4 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="gap-6 grid">
          <div className="gap-4 grid md:grid-cols-2">
            <div className="gap-2 grid">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={settings.productName}
                onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
              />
            </div>
            <div className="gap-2 grid">
              <Label htmlFor="programName">Program Name</Label>
              <Input
                id="programName"
                value={settings.programName}
                onChange={(e) => setSettings({ ...settings, programName: e.target.value })}
              />
            </div>
          </div>
          <div className="gap-4 grid md:grid-cols-2">
            <div className="gap-2 grid">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <div className="relative">
                <Globe className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="websiteUrl"
                  className="pl-9"
                  value={settings.websiteUrl}
                  onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="gap-2 grid">
              <Label htmlFor="portalSubdomain">Portal Subdomain</Label>
              <Input
                id="portalSubdomain"
                value={settings.portalSubdomain}
                onChange={(e) => setSettings({ ...settings, portalSubdomain: e.target.value })}
              />
            </div>
          </div>
          <Separator />
          <div className="gap-4 grid md:grid-cols-3">
            <div className="gap-2 grid">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => setSettings({ ...settings, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="gap-2 grid">
              <Label htmlFor="minimumPayoutThreshold">Min Payout Threshold (cents)</Label>
              <Input
                id="minimumPayoutThreshold"
                type="number"
                value={settings.minimumPayoutThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, minimumPayoutThreshold: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="gap-2 grid">
              <Label htmlFor="payoutTerm">Payout Term</Label>
              <Select
                value={settings.payoutTerm}
                onValueChange={(v) => setSettings({ ...settings, payoutTerm: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NET-15">NET-15</SelectItem>
                  <SelectItem value="NET-30">NET-30</SelectItem>
                  <SelectItem value="NET-60">NET-60</SelectItem>
                  <SelectItem value="NET-90">NET-90</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="gap-2 grid">
              <Label htmlFor="commissionHoldDays">Commission Hold Period (Days)</Label>
              <div className="relative">
                <Clock className="top-2.5 left-3 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="commissionHoldDays"
                  type="number"
                  className="pl-9"
                  value={settings.commissionHoldDays}
                  onChange={(e) =>
                    setSettings({ ...settings, commissionHoldDays: parseInt(e.target.value) || 0 })
                  }
                  placeholder="30"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Number of days to hold commissions for refund protection</p>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-muted-foreground text-xs">
              Program ID: <span className="font-mono">{settings.programId}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Commission Rules
              </CardTitle>
              <CardDescription>Define how commissions are calculated</CardDescription>
            </div>
            <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={openCreateRule}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRule ? 'Edit Rule' : 'New Commission Rule'}</DialogTitle>
                  <DialogDescription>
                    {editingRule ? 'Update commission rule details' : 'Create a new commission calculation rule'}
                  </DialogDescription>
                </DialogHeader>
                <div className="gap-4 grid py-4">
                  <div className="gap-2 grid">
                    <Label>Rule Name</Label>
                    <Input
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                      placeholder="e.g., Standard Commission"
                    />
                  </div>
                  <div className="gap-4 grid md:grid-cols-2">
                    <div className="gap-2 grid">
                      <Label>Type</Label>
                      <Select value={ruleForm.type} onValueChange={(v) => setRuleForm({ ...ruleForm, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FLAT">Flat Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="gap-2 grid">
                      <Label>Value</Label>
                      <div className="relative">
                        {ruleForm.type === 'PERCENTAGE' ? (
                          <Percent className="top-2.5 right-3 absolute w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span className="top-2.5 left-3 absolute text-muted-foreground text-sm">
                            {getCurrencySymbolForCode(settings.currency)}
                          </span>
                        )}
                        <Input
                          type="number"
                          className={ruleForm.type === 'FLAT' ? 'pl-9' : ''}
                          value={ruleForm.value}
                          onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })}
                          placeholder={ruleForm.type === 'PERCENTAGE' ? '10' : '500'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ruleForm.isDefault}
                      onCheckedChange={(v) => setRuleForm({ ...ruleForm, isDefault: v })}
                    />
                    <Label>Set as default rule</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRuleDialog(false)}>Cancel</Button>
                  <Button onClick={handleSaveRule} disabled={savingRule || !ruleForm.name || !ruleForm.value}>
                    {savingRule ? 'Saving...' : editingRule ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {settings.commissionRules.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <Percent className="w-12 h-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-lg">No commission rules</h3>
              <p className="text-muted-foreground text-sm">Create your first commission rule to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.commissionRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {rule.type === 'PERCENTAGE' ? `${rule.value}%` : `${getCurrencySymbolForCode(settings.currency)}${rule.value}`}
                    </TableCell>
                    <TableCell>
                      {rule.isDefault && <Badge variant="default">Default</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditRule(rule)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tracking Widget / Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Referral Tracking Widget
          </CardTitle>
          <CardDescription>
            Embed this script on <strong>{settings.websiteUrl || 'your website'}</strong> to automatically track referral visits and conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 — website URL reminder */}
          {!settings.websiteUrl && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Set your <strong>Website URL</strong> in General Settings above first so the snippet is pre-configured.
              </p>
            </div>
          )}

          <Tabs defaultValue="script" className="space-y-4">
            <TabsList>
              <TabsTrigger value="script">Tracking Script</TabsTrigger>
              <TabsTrigger value="conversion">Conversion Tracking</TabsTrigger>
              <TabsTrigger value="referral">Referral Links</TabsTrigger>
            </TabsList>

            {/* ── Tab: Tracking Script ── */}
            <TabsContent value="script" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium text-sm">1. Add this script before <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> on every page</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopySnippet('script', `<script src="${appUrl}/scripts/refferq-tracker.js" data-api-url="${appUrl}"></script>`)}>
                    {copiedSnippet === 'script' ? <><CheckCircle2 className="mr-1 w-3.5 h-3.5 text-green-600" />Copied</> : <><Copy className="mr-1 w-3.5 h-3.5" />Copy</>}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm">
                  <span className="text-blue-600">&lt;script</span>
                  {' '}<span className="text-purple-600">src</span>=<span className="text-green-600">&quot;{appUrl}/scripts/refferq-tracker.js&quot;</span><br />
                  {'  '}<span className="text-purple-600">data-api-url</span>=<span className="text-green-600">&quot;{appUrl}&quot;</span>
                  <span className="text-blue-600">&gt;&lt;/script&gt;</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 p-4 border rounded-md">
                <h4 className="flex items-center gap-2 font-medium text-sm"><Zap className="w-4 h-4" />How it works</h4>
                <ol className="space-y-2 text-muted-foreground text-sm list-decimal list-inside">
                  <li>A visitor arrives on <strong>{settings.websiteUrl || 'your site'}</strong> via a referral link (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs">?ref=CODE</code>)</li>
                  <li>The script automatically detects the <code className="bg-muted px-1 py-0.5 rounded text-xs">ref</code> parameter and stores a 30-day cookie</li>
                  <li>When the visitor converts (signup, purchase, etc.), you call <code className="bg-muted px-1 py-0.5 rounded text-xs">Refferq.trackConversion()</code></li>
                  <li>The referral and commission are recorded in your dashboard automatically</li>
                </ol>
              </div>
            </TabsContent>

            {/* ── Tab: Conversion Tracking ── */}
            <TabsContent value="conversion" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium text-sm">Call this when a visitor completes a conversion event</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopySnippet('conversion', `// Track a conversion (e.g. after signup or purchase)\nRefferq.trackConversion({\n  email: customer.email,\n  name: customer.name,\n  amount: 4999,        // amount in smallest unit (e.g. paise / cents)\n  currency: '${settings.currency || 'INR'}',\n  orderId: 'ORD-12345' // optional\n});`)}>
                    {copiedSnippet === 'conversion' ? <><CheckCircle2 className="mr-1 w-3.5 h-3.5 text-green-600" />Copied</> : <><Copy className="mr-1 w-3.5 h-3.5" />Copy</>}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre">
                  {`// Track a conversion (e.g. after signup or purchase)
Refferq.trackConversion({
  email: customer.email,
  name: customer.name,
  amount: 4999,        // amount in smallest unit (e.g. paise / cents)
  currency: '${settings.currency || 'INR'}',
  orderId: 'ORD-12345' // optional
});`}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium text-sm">Other helpers</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleCopySnippet('helpers', `// Get the current referral code (or null)\nconst code = Refferq.getReferralCode();\n\n// Clear the stored referral code\nRefferq.clearReferralCode();`)}>
                    {copiedSnippet === 'helpers' ? <><CheckCircle2 className="mr-1 w-3.5 h-3.5 text-green-600" />Copied</> : <><Copy className="mr-1 w-3.5 h-3.5" />Copy</>}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre">
                  {`// Get the current referral code (or null)
const code = Refferq.getReferralCode();

// Clear the stored referral code
Refferq.clearReferralCode();`}
                </div>
              </div>
            </TabsContent>

            {/* ── Tab: Referral Links ── */}
            <TabsContent value="referral" className="space-y-4">
              <div className="space-y-3 p-4 border rounded-md">
                <h4 className="font-medium text-sm">Referral link format</h4>
                <p className="text-muted-foreground text-sm">
                  Affiliates share links to your website with a <code className="bg-muted px-1 py-0.5 rounded text-xs">ref</code> query parameter.
                  The tracking script picks this up automatically.
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                  {settings.websiteUrl || 'https://yoursite.com'}/<span className="text-blue-600">?ref=</span><span className="text-green-600">PARTNER-CODE</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  The script also recognizes <code className="bg-muted px-1 py-0.5 rounded text-xs">?referral=</code> and <code className="bg-muted px-1 py-0.5 rounded text-xs">?affiliate=</code> parameters.
                </p>
              </div>

              <div className="space-y-3 p-4 border rounded-md">
                <h4 className="font-medium text-sm">Direct referral route</h4>
                <p className="text-muted-foreground text-sm">
                  You can also use the built-in redirect route to send visitors through Refferq first:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                  {appUrl}/<span className="text-blue-600">r/</span><span className="text-green-600">PARTNER-CODE</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
