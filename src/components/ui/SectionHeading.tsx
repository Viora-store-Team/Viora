import Link from "next/link";
import { ChevronLeft } from "lucide-react";
type Props = { eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string };
export default function SectionHeading({ eyebrow, title, description, href, linkLabel }: Props) {
  return <div className="v-section-heading"><div>{eyebrow && <span className="v-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{href && linkLabel && <Link href={href} className="v-text-link">{linkLabel}<ChevronLeft size={16} aria-hidden="true" /></Link>}</div>;
}
