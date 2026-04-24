import { cn } from '@/lib/utils';

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'completed' | 'processing' | 'failed' | 'cancelled' | 'default';

const variantClasses: Record<BadgeVariant, string> = {
  pending:    'bg-warning/20 text-warning border-warning/30',
  approved:   'bg-success/20 text-success border-success/30',
  completed:  'bg-success/20 text-success border-success/30',
  rejected:   'bg-danger/20 text-danger border-danger/30',
  failed:     'bg-danger/20 text-danger border-danger/30',
  processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cancelled:  'bg-gray-500/20 text-gray-400 border-gray-500/30',
  default:    'bg-bg-muted text-gray-300 border-bg-border',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
