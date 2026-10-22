import {
  Facebook,
  Music,
  MessageCircle,
  Mail,
  Youtube,
  Search,
  Users,
  Video,
  Share2,
  Instagram,
  Send,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Facebook,
  Music,
  MessageCircle,
  Mail,
  Youtube,
  Search,
  Users,
  Video,
  Share2,
  Instagram,
  Send,
  TrendingUp,
};

export function getMethodIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? TrendingUp;
}
