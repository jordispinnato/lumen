import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  Package,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

/*
 * Unico punto de acceso a Lucide en todo el producto (Product Bible v1.0,
 * cap. 5). Ningun componente debe importar iconos de "lucide-react"
 * directamente: se agregan aca y se consumen via <AppIcon name="..." />.
 */
const ICONS = {
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  "book-open": BookOpen,
  calendar: Calendar,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  clock: Clock,
  "message-circle": MessageCircle,
  package: Package,
  "shield-check": ShieldCheck,
  users: Users,
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
