import {
  Utensils,
  Bus,
  Smartphone,
  BookOpen,
  Music,
  Home,
  ShoppingCart,
  Heart,
  Package,
} from 'lucide-react'

const MAP: Record<string, React.ElementType> = {
  Food: Utensils,
  Transport: Bus,
  'Airtime/Data': Smartphone,
  'Books/Stationery': BookOpen,
  Entertainment: Music,
  'Rent/Hostel': Home,
  Groceries: ShoppingCart,
  Health: Heart,
  Miscellaneous: Package,
}

export default function CategoryIcon({
  category,
  size = 16,
  className = '',
  style,
}: {
  category: string
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = (MAP[category] ?? Package) as React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>
  return <Icon size={size} className={className} style={style} />
}
