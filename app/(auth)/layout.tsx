import { Container } from "@/components/shared/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container width="narrow" className="py-16">
      <div className="mx-auto max-w-sm">{children}</div>
    </Container>
  );
}
