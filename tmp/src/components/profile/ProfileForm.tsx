import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProfileFormProps {
  profileData: any;
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export default function ProfileForm({
  profileData,
  onSubmit,
  isLoading,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profileData?.name || "",
    bio: profileData?.bio || "",
    phone: profileData?.phone || "",
    location: profileData?.location || "",
    occupation: profileData?.occupation || "",
    organization: profileData?.organization || "",
    education: profileData?.education || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* General Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="bg-[#252525] border-[#333] text-white min-h-20"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Professional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Your job title"
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Company or organization"
                className="bg-[#252525] border-[#333] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="Your education background"
              className="bg-[#252525] border-[#333] text-white"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-[#FFD166] text-[#121212] hover:bg-amber-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
