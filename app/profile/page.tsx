import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/db/queries/profiles";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in?next=/profile");
  const profile = await getOwnProfile(user.id);
  return (
    <Container width="narrow" className="py-16">
      <Eyebrow className="mb-6">Profile</Eyebrow>
      <ProfileForm
        profile={{
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        }}
      />
    </Container>
  );
}
