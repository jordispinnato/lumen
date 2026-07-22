import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  CreditCard,
  Home,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

/*
 * Unico punto de acceso a Lucide en todo el producto (Product Bible v1.0,
 * cap. 5). Ningun componente debe importar iconos de "lucide-react"
 * directamente: se agregan aca y se consumen via <AppIcon name="..." />.
 */
const ICONS = {
  "arrow-right": ArrowRight,
  award: Award,
  "badge-check": BadgeCheck,
  bell: Bell,
  "book-open": BookOpen,
  calendar: Calendar,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  clock: Clock,
  compass: Compass,
  "credit-card": CreditCard,
  home: Home,
  "message-circle": MessageCircle,
  package: Package,
  settings: Settings,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  user: User,
  users: Users,
  video: Video,
  close: X,
};

const SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function AppIcon({ name, size = "md", label, className, ...props }) {
  const Icon = ICONS[name];

  if (!Icon) {
    return null;
  }

  const pixelSize = SIZES[size] || SIZES.md;

  return (
    <Icon
      size={pixelSize}
      strokeWidth={1.75}
      className={className}
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label}
      {...props}
    />
  );
}
