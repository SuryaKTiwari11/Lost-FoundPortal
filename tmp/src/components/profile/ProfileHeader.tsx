import { Session } from "next-auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";

interface ProfileHeaderProps {
  session: Session | null;
  profileData: any;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export default function ProfileHeader({
  session,
  profileData,
  isEditing,
  setIsEditing,
}: ProfileHeaderProps) {
  return (
    <div className="bg-[#252525] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center border-b border-[#333]">
      <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden bg-[#333] flex items-center justify-center">
        {profileData?.avatar ? (
          <Image
            src={profileData.avatar}
            alt={profileData.name || session?.user?.name || "User"}
            fill
            className="object-cover"
          />
        ) : (
          <User className="h-14 w-14 text-gray-400" />
        )}
      </div>

      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-bold">
          {profileData?.name || session?.user?.name || "User"}
        </h2>
        <p className="text-gray-400">{session?.user?.email}</p>
        {profileData?.bio && (
          <p className="mt-2 text-gray-300 line-clamp-2">{profileData.bio}</p>
        )}
      </div>

      <Button
        onClick={() => setIsEditing(!isEditing)}
        variant={isEditing ? "destructive" : "outline"}
        className={isEditing ? "bg-red-500/90 hover:bg-red-500 text-white" : ""}
      >
        {isEditing ? (
          "Cancel"
        ) : (
          <>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </>
        )}
      </Button>
    </div>
  );
}
