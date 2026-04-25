import { Brand } from "./brand";
import { Nav, NavMobile } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "@/components/shared/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--background)]/85 backdrop-blur">
      <Container width="wide">
        <div className="flex h-14 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-1">
            <Nav />
            <NavMobile />
            <span className="ml-1">
              <ThemeToggle />
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
}
