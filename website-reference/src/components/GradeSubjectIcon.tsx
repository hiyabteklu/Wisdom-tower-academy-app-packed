import {
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Monitor,
  BookOpen,
  Globe2,
  ScrollText,
  Coins,
  Scale,
  Languages,
  Ruler,
  Briefcase,
  HeartPulse,
  Sprout,
  Target,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  leaf: Leaf,
  monitor: Monitor,
  book: BookOpen,
  globe: Globe2,
  scroll: ScrollText,
  coins: Coins,
  scale: Scale,
  languages: Languages,
  ruler: Ruler,
  briefcase: Briefcase,
  heart: HeartPulse,
  sprout: Sprout,
  target: Target,
  lightbulb: Lightbulb,
};

export default function GradeSubjectIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] || BookOpen;
  return <Icon className={className} aria-hidden />;
}
