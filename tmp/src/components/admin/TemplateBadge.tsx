import { Badge } from "@/components/ui/badge";

interface TemplateBadgeProps {
  type: string;
}

export function TemplateBadge({ type }: TemplateBadgeProps) {
  switch (type) {
    case "notification":
      return (
        <Badge className="bg-blue-700 hover:bg-blue-800">Notification</Badge>
      );
    case "match":
      return <Badge className="bg-green-700 hover:bg-green-800">Match</Badge>;
    case "claim":
      return <Badge className="bg-purple-700 hover:bg-purple-800">Claim</Badge>;
    case "verification":
      return (
        <Badge className="bg-yellow-700 hover:bg-yellow-800">
          Verification
        </Badge>
      );
    default:
      return <Badge className="bg-gray-700 hover:bg-gray-800">Other</Badge>;
  }
}
