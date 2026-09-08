import {
  Activity,
  Award,
  CarFront,
  CircleDot,
  Disc,
  Flag,
  Flame,
  Goal,
  Medal,
  Shield,
  Swords,
  Target,
  Trophy,
  Volleyball,
} from "lucide-react";

interface SportIconProps {
  sportId: string;
  className?: string;
}

export function SportIcon({ sportId, className = "h-6 w-6" }: SportIconProps) {
  const id = sportId.toLowerCase();

  switch (id) {
    case "football":
      return <Goal className={className} aria-hidden="true" />;

    case "basketball":
      return <Volleyball className={className} aria-hidden="true" />;

    case "american-football":
      return <Shield className={className} aria-hidden="true" />;

    case "hockey":
      return <Disc className={className} aria-hidden="true" />;

    case "baseball":
      return <Award className={className} aria-hidden="true" />;

    case "motor-sports":
      return <CarFront className={className} aria-hidden="true" />;

    case "fight":
      return <Swords className={className} aria-hidden="true" />;

    case "tennis":
      return <Volleyball className={className} aria-hidden="true" />;

    case "rugby":
      return <Medal className={className} aria-hidden="true" />;

    case "golf":
      return <Flag className={className} aria-hidden="true" />;

    case "billiards":
      return <CircleDot className={className} aria-hidden="true" />;

    case "afl":
      return <Flame className={className} aria-hidden="true" />;

    case "darts":
      return <Target className={className} aria-hidden="true" />;

    case "cricket":
      return <Trophy className={className} aria-hidden="true" />;

    default:
      return <Activity className={className} aria-hidden="true" />;
  }
}
