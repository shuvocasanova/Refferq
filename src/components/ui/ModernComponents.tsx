'use client';

// Re-export all components from ModernUI for backwards compatibility
export * from './ModernUI';

// Additional specialized components for admin dashboard

import React from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyCents } from '@/lib/currency-format';

// ============================================
// REVENUE CARD (Special variant)
// ============================================

export const RevenueCard = ({
  title,
  amount,
  currency = '$',
  subtitle,
  icon,
  trend,
  trendValue,
  gradient = 'from-emerald-500 to-teal-600'
}: {
  title: string;
  amount: number;
  currency?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: string;
}) => {
  const trendStyles = {
    up: { color: 'text-emerald-400', icon: '↗' },
    down: { color: 'text-red-400', icon: '↘' },
    neutral: { color: 'text-gray-400', icon: '→' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white shadow-2xl`}
    >
      {/* Decorative elements */}
      <div className="-top-8 -right-8 absolute bg-white/10 blur-2xl rounded-full w-32 h-32" />
      <div className="-bottom-8 -left-8 absolute bg-white/10 blur-2xl rounded-full w-24 h-24" />

      <div className="z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-white/80 text-sm">{title}</span>
          {icon && (
            <div className="flex justify-center items-center bg-white/20 backdrop-blur-sm rounded-xl w-10 h-10">
              {icon}
            </div>
          )}
        </div>

        <div className="mb-2">
          <span className="font-bold text-4xl">
            {currency}{(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          {subtitle && (
            <span className="text-white/60 text-sm">{subtitle}</span>
          )}
          {trend && trendValue && (
            <span className={`flex items-center gap-1 text-sm font-medium ${trendStyles[trend].color}`}>
              {trendStyles[trend].icon} {trendValue}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// METRIC CARD (Compact variant)
// ============================================

export const MetricCard = ({
  label,
  value,
  icon,
  color = 'indigo',
  delay = 0
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
  delay?: number;
}) => {
  const colorStyles = {
    indigo: { bg: 'from-indigo-50 to-indigo-100', icon: 'from-indigo-500 to-purple-600', text: 'text-indigo-900' },
    emerald: { bg: 'from-emerald-50 to-teal-100', icon: 'from-emerald-500 to-teal-600', text: 'text-emerald-900' },
    amber: { bg: 'from-amber-50 to-orange-100', icon: 'from-amber-500 to-orange-600', text: 'text-amber-900' },
    rose: { bg: 'from-rose-50 to-pink-100', icon: 'from-rose-500 to-pink-600', text: 'text-rose-900' },
    purple: { bg: 'from-purple-50 to-violet-100', icon: 'from-purple-500 to-violet-600', text: 'text-purple-900' },
    blue: { bg: 'from-blue-50 to-sky-100', icon: 'from-blue-500 to-sky-600', text: 'text-blue-900' }
  };

  const style = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-to-br ${style.bg} rounded-2xl p-5 border border-white/50`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-medium text-gray-600 text-sm">{label}</span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.icon} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-bold ${style.text}`}>{value}</div>
    </motion.div>
  );
};

// ============================================
// PARTNER ROW (List item)
// ============================================

export const PartnerRow = ({
  name,
  email,
  code,
  revenue,
  currency = DEFAULT_CURRENCY_SYMBOL,
  status,
  avatar,
  onClick
}: {
  name: string;
  email: string;
  code: string;
  revenue: number;
  currency?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  avatar?: string;
  onClick?: () => void;
}) => {
  const statusStyles = {
    ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    SUSPENDED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const style = statusStyles[status];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 border-gray-100 last:border-0 border-b rounded-xl transition-all cursor-pointer"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="rounded-xl w-12 h-12 object-cover" />
      ) : (
        <div className="flex justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg rounded-xl w-12 h-12 font-bold text-white">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-gray-500 text-sm truncate">{email}</div>
      </div>

      <div className="px-4 text-center">
        <div className="mb-1 text-gray-500 text-xs">Referral Code</div>
        <div className="bg-indigo-50 px-2 py-1 rounded-lg font-mono font-medium text-indigo-600 text-sm">{code}</div>
      </div>

      <div className="px-4 text-right">
        <div className="mb-1 text-gray-500 text-xs">Revenue</div>
        <div className="font-bold text-gray-900">{formatCurrencyCents(revenue, currency)}</div>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {status}
      </span>
    </motion.div>
  );
};

// ============================================
// CUSTOMER ROW (List item)
// ============================================

export const CustomerRow = ({
  email,
  partner,
  date,
  amount,
  currency = DEFAULT_CURRENCY_SYMBOL,
  status,
  onClick
}: {
  email: string;
  partner: string;
  date: string;
  amount?: number;
  currency?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  onClick?: () => void;
}) => {
  const statusStyles = {
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const style = statusStyles[status];

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
      onClick={onClick}
      className="items-center gap-4 grid grid-cols-5 p-4 border-gray-100 last:border-0 border-b rounded-xl transition-all cursor-pointer"
    >
      <div className="text-gray-600 text-sm">
        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <div className="font-medium text-gray-900 truncate">{email}</div>
      <div className="text-gray-600 truncate">{partner}</div>
      <div className="font-semibold text-gray-900">
        {amount !== undefined ? formatCurrencyCents(amount, currency) : '-'}
      </div>
      <div className="flex justify-end">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {status}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================
// ACTION CARD (For quick actions)
// ============================================

export const ActionCard = ({
  title,
  description,
  icon,
  onClick,
  color = 'indigo'
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}) => {
  const colorStyles = {
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/30'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group bg-white shadow-lg hover:shadow-xl p-6 border border-gray-100 rounded-2xl w-full text-left transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center text-white text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="mb-1 font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </motion.button>
  );
};

// ============================================
// NOTIFICATION ITEM
// ============================================

export const NotificationItem = ({
  title,
  message,
  time,
  icon,
  type = 'info',
  unread = false
}: {
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  unread?: boolean;
}) => {
  const typeStyles = {
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    error: 'bg-red-100 text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${unread ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
    >
      <div className={`w-10 h-10 rounded-xl ${typeStyles[type]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{title}</span>
          {unread && <span className="bg-indigo-500 rounded-full w-2 h-2" />}
        </div>
        <p className="text-gray-600 text-sm truncate">{message}</p>
        <span className="mt-1 text-gray-400 text-xs">{time}</span>
      </div>
    </motion.div>
  );
};

// ============================================
// STAT WITH CHART
// ============================================

export const StatWithChart = ({
  title,
  value,
  change,
  changeType = 'neutral',
  data,
  color = '#6366f1'
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  data: number[];
  color?: string;
}) => {
  const changeStyles = {
    positive: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '↑' },
    negative: { bg: 'bg-red-50', text: 'text-red-600', icon: '↓' },
    neutral: { bg: 'bg-gray-50', text: 'text-gray-600', icon: '→' }
  };

  const max = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-500 text-sm">{title}</span>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeStyles[changeType].bg} ${changeStyles[changeType].text}`}>
            {changeStyles[changeType].icon} {change}
          </span>
        )}
      </div>

      <div className="mb-4 font-bold text-gray-900 text-3xl">{value}</div>

      <div className="h-16">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${title})`}
          />
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
};

// ============================================
// SECTION HEADER
// ============================================

export const SectionHeader = ({
  title,
  action,
  icon
}: {
  title: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg rounded-xl w-10 h-10 text-white">
          {icon}
        </div>
      )}
      <h2 className="font-bold text-gray-900 text-xl">{title}</h2>
    </div>
    {action}
  </div>
);

// ============================================
// FILTER PILL
// ============================================

export const FilterPill = ({
  label,
  active,
  count,
  onClick
}: {
  label: string;
  active?: boolean;
  count?: number;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
      ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}
  >
    {label}
    {count !== undefined && (
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-semibold
        ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
      `}>
        {count}
      </span>
    )}
  </motion.button>
);
