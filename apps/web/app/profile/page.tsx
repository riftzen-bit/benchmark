import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/db/queries/profiles";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in?next=/profile");
  const profile = await getOwnProfile(user.id);
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  return (
    <Container width="narrow" className="py-16">
      <Eyebrow className="mb-3">Profile</Eyebrow>
      <h1 className="display mb-8 text-3xl tracking-tight md:text-4xl">
        Your registry record.
      </h1>
      <ProfileForm
        profile={{
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        }}
        account={{
          email: user.email ?? "",
          provider,
          createdAt: user.created_at,
        }}
      />
    </Container>
  );
}
