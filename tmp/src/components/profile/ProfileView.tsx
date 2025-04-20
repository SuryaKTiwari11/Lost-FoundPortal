import {
  Phone,
  MapPin,
  Calendar,
  Mail,
  Briefcase,
  BookOpen,
  Building,
} from "lucide-react";

interface ProfileViewProps {
  profileData: any;
}

export default function ProfileView({ profileData }: ProfileViewProps) {
  if (!profileData) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Profile information not available.</p>
      </div>
    );
  }

  // Format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Info item component for consistent styling
  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start mb-4">
      <div className="mr-3 mt-1 text-[#FFD166]">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Bio section */}
      {profileData.bio && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">About</h3>
          <p className="text-gray-300">{profileData.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Personal Information
          </h3>

          <InfoItem
            icon={<Mail className="h-5 w-5" />}
            label="Email"
            value={profileData.email}
          />

          <InfoItem
            icon={<Phone className="h-5 w-5" />}
            label="Phone"
            value={profileData.phone}
          />

          <InfoItem
            icon={<MapPin className="h-5 w-5" />}
            label="Location"
            value={profileData.location}
          />

          <InfoItem
            icon={<Calendar className="h-5 w-5" />}
            label="Joined"
            value={formatDate(profileData.createdAt)}
          />
        </div>

        {/* Professional information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Professional Information
          </h3>

          <InfoItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Occupation"
            value={profileData.occupation}
          />

          <InfoItem
            icon={<Building className="h-5 w-5" />}
            label="Organization"
            value={profileData.organization}
          />

          <InfoItem
            icon={<BookOpen className="h-5 w-5" />}
            label="Education"
            value={profileData.education}
          />
        </div>
      </div>
    </div>
  );
}
