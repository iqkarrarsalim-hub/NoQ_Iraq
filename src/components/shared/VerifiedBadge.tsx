import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ className = '', size = 'sm' }: VerifiedBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 rounded-full shadow-xs ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${className}`}
    >
      <ShieldCheck className={isSmall ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
      موثق من المنصة
    </span>
  );
}
