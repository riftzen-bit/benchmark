import { Brand } from "./brand";
import { Nav, NavMobile } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { AuthMenu } from "./auth-menu";
import { ReleaseTape } from "./release-tape";
import { Container } from "@/components/shared/container";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--background)]/90 backdrop-blur">
      <ReleaseTape />
      <Container width="wide">
        <div className="flex h-14 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-1">
            <Nav />
            <NavMobile />
            <span className="hidden md:inline-flex">
              <AuthMenu />
            </span>
            <span className="ml-1">
              <ThemeToggle />
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
}
