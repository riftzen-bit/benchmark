import { Rule } from "@/components/shared/rule";
import { Eyebrow } from "@/components/shared/eyebrow";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function MethSection({ id, eyebrow, title, children }: Props) {
  return (
    <section id={id} className="py-12">
      <Rule weight="hair" />
      <div className="mt-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="display mt-2 text-2xl font-medium tracking-tight md:text-3xl">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
