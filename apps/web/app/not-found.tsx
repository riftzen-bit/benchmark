import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ArrowLink } from "@/components/shared/arrow-link";

export default function NotFound() {
  return (
    <Container width="default" className="flex min-h-[70vh] flex-col justify-center py-16">
      <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:items-end md:gap-y-0">
        {/* Left: huge 404 — cols 1-6 */}
        <div className="md:col-span-6">
          <p
            className="display leading-[0.85] tracking-tighter text-[var(--accent)] text-9xl md:text-[14rem]"
            aria-label="404"
          >
            404
          </p>
        </div>

        {/* Right: message — cols 7-12 */}
        <div className="md:col-span-6">
          <Eyebrow>Page not found</Eyebrow>
          <h1 className="display mt-3 text-3xl font-medium tracking-tight">
            We can&apos;t find that page.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--mute)]">
            The link may be old, or there&apos;s a typo in the URL.
          </p>
          <div className="mt-8">
            <ArrowLink href="/" variant="primary">Back to the issue</ArrowLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
