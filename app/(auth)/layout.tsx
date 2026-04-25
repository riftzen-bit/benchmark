import { AuthRail } from "@/components/auth/auth-rail";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-2">
      <aside className="hidden md:block">
        <AuthRail />
      </aside>
      <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[var(--background)] px-6 py-14 md:px-10 md:py-16">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
