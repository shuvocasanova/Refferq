'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AffiliateStats {
  totalEarnings: number;
  totalClicks: number;
  totalLeads: number;
  totalReferredCustomers: number;
  referralLink: string;
  referralCode: string;
}

interface Referral {
  id: string;
  leadName: string;
  leadEmail: string;
  company?: string;
  estimatedValue: number;
  status: string;
  createdAt: string;
  amountPaid?: number;
  commission?: number;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
}

// Dashboard Page Component
function DashboardPage({ stats, referrals }: { stats: AffiliateStats | null; referrals: Referral[] }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Total Earnings</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">💰</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            ₹{((stats?.totalEarnings || 0) / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Total Clicks</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">👆</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stats?.totalClicks || 0}</p>
          <p className="text-xs text-gray-400 mt-2">Link clicks</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Total Leads</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stats?.totalLeads || 0}</p>
          <p className="text-xs text-gray-400 mt-2">Submitted leads</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Customers</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <span className="text-white">✅</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stats?.totalReferredCustomers || 0}</p>
          <p className="text-xs text-gray-400 mt-2">Converted customers</p>
        </div>
      </div>

      {/* Links Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Your Referral Links</h3>
        
        {!stats?.referralCode ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <p className="text-gray-600 mb-2 font-medium">No referral code found</p>
            <p className="text-sm text-gray-400 mb-5">
              Generate your referral code to start earning commissions
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/affiliate/generate-code', { method: 'POST' });
                  const data = await response.json();
                  if (data.success) {
                    window.location.reload();
                  } else {
                    alert('Failed to generate code: ' + data.error);
                  }
                } catch (error) {
                  console.error('Failed to generate code:', error);
                  alert('Failed to generate code. Please try again.');
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 font-medium transition-all duration-300"
            >
              Generate Referral Code
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Referral Link</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  readOnly
                  value={stats?.referralLink || ''}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  onClick={() => copyToClipboard(stats?.referralLink || '')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 text-sm font-semibold transition-all duration-300"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Referral Code</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  readOnly
                  value={stats?.referralCode || ''}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  onClick={() => copyToClipboard(stats?.referralCode || '')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 text-sm font-semibold transition-all duration-300"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Referrals */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Recent Referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="font-medium">No referrals yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                {referrals.slice(0, 5).map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-5 text-sm font-medium text-gray-900">{ref.leadName}</td>
                    <td className="py-4 px-5 text-sm text-gray-500">{ref.leadEmail}</td>
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ref.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        ref.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-sm font-semibold text-gray-900 text-right">
                      ₹{(Number(ref.estimatedValue) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Referrals Page Component
function ReferralsPage({ referrals, onSubmitLead }: { referrals: Referral[]; onSubmitLead: () => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'submitted'>('all');

  const filteredReferrals = activeTab === 'submitted' 
    ? referrals.filter(r => r.status === 'PENDING')
    : referrals;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
        <button
          onClick={onSubmitLead}
          className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg hover:shadow-gray-900/20 font-medium flex items-center gap-2 transition-all duration-300"
        >
          <span className="text-lg">+</span>
          <span>Submit lead</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Referrals ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'submitted'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Submitted Leads ({referrals.filter(r => r.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <p className="text-gray-600 mb-2 font-medium text-lg">No referrals yet</p>
            <p className="text-gray-400 mb-6">Start submitting leads to earn commissions</p>
            <button
              onClick={onSubmitLead}
              className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-300"
            >
              Submit your first lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Name</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-5 text-sm font-medium text-gray-900">{ref.leadName}</td>
                    <td className="py-4 px-5 text-sm text-gray-500">{ref.leadEmail}</td>
                    <td className="py-4 px-5 text-sm text-gray-500">{ref.company || '-'}</td>
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ref.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        ref.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-sm font-semibold text-gray-900 text-right">
                      ₹{(Number(ref.estimatedValue) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Payouts Page Component
function PayoutsPage({ stats, payouts }: { stats: AffiliateStats | null; payouts: Payout[] }) {
  const totalPaid = payouts
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Earned</p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            ₹{((stats?.totalEarnings || 0) / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-600">
            ₹{(totalPaid / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            ₹{(pendingAmount / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-600 mb-2">Next Payout</p>
          <p className="text-lg font-bold text-gray-900">Jan 1, 2026</p>
          <p className="text-xs text-gray-500 mt-1">Monthly cycle</p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout History</h3>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(payout.paidAt || payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{payout.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payout.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        payout.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      ₹{(payout.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage({ 
  settingsForm, 
  setSettingsForm, 
  onUpdate 
}: { 
  settingsForm: any; 
  setSettingsForm: (form: any) => void;
  onUpdate: (field: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Personal Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
          <button
            onClick={() => onUpdate('Personal Details')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Update
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={settingsForm.company}
              onChange={(e) => setSettingsForm({ ...settingsForm, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settingsForm.email}
              onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={settingsForm.country}
              onChange={(e) => setSettingsForm({ ...settingsForm, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          <button
            onClick={() => onUpdate('Payment Details')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Update
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={settingsForm.paymentMethod}
              onChange={(e) => setSettingsForm({ ...settingsForm, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Stripe">Stripe</option>
              <option value="Wire Transfer">Wire Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Email / Account</label>
            <input
              type="text"
              value={settingsForm.paymentEmail}
              onChange={(e) => setSettingsForm({ ...settingsForm, paymentEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="payment@example.com"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Payouts are processed on the 1st of each month for the previous month's earnings. 
            Minimum payout threshold is ₹1,000.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Referral form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    leadName: '',
    leadEmail: '',
    estimatedValue: '0',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    company: '',
    email: '',
    country: '',
    paymentMethod: 'PayPal',
    paymentEmail: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/affiliate/profile');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalEarnings: data.affiliate?.balanceCents || 0,
          totalClicks: 0,
          totalLeads: data.referrals?.length || 0,
          totalReferredCustomers: data.referrals?.filter((r: any) => r.status === 'APPROVED').length || 0,
          referralLink: `${window.location.origin}/r/${data.affiliate?.referralCode}`,
          referralCode: data.affiliate?.referralCode || '',
        });
        setReferrals(data.referrals || []);
        
        // Load user settings
        setSettingsForm({
          name: user?.name || '',
          company: '',
          email: user?.email || '',
          country: 'India',
          paymentMethod: 'PayPal',
          paymentEmail: user?.email || '',
        });
      }
      
      // Load payouts
      const payoutsRes = await fetch('/api/affiliate/payouts');
      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.payouts || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/affiliate/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_name: submitForm.leadName,
          lead_email: submitForm.leadEmail,
          estimated_value: submitForm.estimatedValue,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotification({ type: 'success', message: 'Lead submitted successfully! Waiting for admin approval.' });
        setShowSubmitModal(false);
        setSubmitForm({ leadName: '', leadEmail: '', estimatedValue: '0' });
        loadDashboardData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to submit lead' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'An error occurred while submitting lead' });
    }

    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateSettings = async (field: string) => {
    try {
      const response = await fetch('/api/affiliate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: `${field} updated successfully!` });
      } else {
        setNotification({ type: 'error', message: `Failed to update ${field}` });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'An error occurred' });
    }

    setTimeout(() => setNotification(null), 5000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.hasAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">Affiliate account required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border backdrop-blur-sm animate-slideIn ${
          notification.type === 'success' 
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' 
            : 'bg-red-50/90 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
            </div>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-xl shadow-gray-200/20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white text-lg">💎</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Affiliate Portal</h1>
          </div>
          <p className="text-sm text-gray-500 ml-1">Welcome, {user.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left font-medium transition-all duration-200 ${
              activePage === 'dashboard' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActivePage('referrals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left font-medium transition-all duration-200 ${
              activePage === 'referrals' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">👥</span>
            <span>Referrals</span>
          </button>
          
          <button
            onClick={() => setActivePage('resources')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left font-medium transition-all duration-200 ${
              activePage === 'resources' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">📚</span>
            <span>Resources</span>
          </button>
          
          <button
            onClick={() => setActivePage('payouts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left font-medium transition-all duration-200 ${
              activePage === 'payouts' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">💳</span>
            <span>Payouts</span>
          </button>
          
          <button
            onClick={() => setActivePage('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-left font-medium transition-all duration-200 ${
              activePage === 'reports' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="flex items-center gap-2">
              Reports
              <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold">Beta</span>
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setActivePage('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-left font-medium transition-all duration-200 ${
              activePage === 'settings' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-50 font-medium transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-60 p-8">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 mb-6 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">💰</span>
            </div>
            <span className="font-semibold">Earn 20% on all paid customers. Start referring today!</span>
          </div>
        </div>

        {/* Dashboard Page */}
        {activePage === 'dashboard' && (
          <DashboardPage stats={stats} referrals={referrals} />
        )}

        {/* Referrals Page */}
        {activePage === 'referrals' && (
          <ReferralsPage 
            referrals={referrals} 
            onSubmitLead={() => setShowSubmitModal(true)} 
          />
        )}

        {/* Payouts Page */}
        {activePage === 'payouts' && (
          <PayoutsPage stats={stats} payouts={payouts} />
        )}

        {/* Settings Page */}
        {activePage === 'settings' && (
          <SettingsPage 
            settingsForm={settingsForm} 
            setSettingsForm={setSettingsForm}
            onUpdate={handleUpdateSettings}
          />
        )}

        {/* Other Pages */}
        {(activePage === 'resources' || activePage === 'reports') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>

      {/* Submit Lead Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Submit lead</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Enter the details below to submit a lead. Ensure all information is accurate for proper tracking and follow-up.
            </p>

            <form onSubmit={handleSubmitLead} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's the lead's name?*
                </label>
                <input
                  type="text"
                  required
                  value={submitForm.leadName}
                  onChange={(e) => setSubmitForm({ ...submitForm, leadName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What is the main contact's email address?*
                </label>
                <input
                  type="email"
                  required
                  value={submitForm.leadEmail}
                  onChange={(e) => setSubmitForm({ ...submitForm, leadEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What is the estimated deal size for this lead? (Type 0 if unsure)*
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    required
                    value={submitForm.estimatedValue}
                    onChange={(e) => setSubmitForm({ ...submitForm, estimatedValue: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg hover:shadow-gray-900/20 font-semibold transition-all duration-300"
              >
                Submit lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}