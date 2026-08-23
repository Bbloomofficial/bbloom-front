import type { PublicSection } from "../api/types";
import { Container } from "../components/layout";
import { useSite } from "../context";
import { bool, str } from "../utils/content";

/** Thin static strip above the header — the classic shop. */
export function AnnouncementBar({ section }: { section: PublicSection }) {
  const text = str(section.content, "text");
  const href = str(section.content, "href");
  if (!text) return null;

  const body = <span className="text-sm font-medium">{text}</span>;

  return (
    <div
      id={section.key}
      className="bg-site-primary py-2 text-center text-site-on-primary"
      role="region"
    >
      <Container>
        {href ? (
          <a href={href} className="underline-offset-4 hover:underline">
            {body}
          </a>
        ) : (
          body
        )}
      </Container>
    </div>
  );
}

/** Gradient strip that scrolls its message — the flagships.
 *
 *  Two things about the motion here are not interchangeable with the other
 *  animations on a site. First, when it is *not* animated the text has to be
 *  allowed to wrap: the strip clips, so a nowrap announcement wider than a
 *  phone loses its first and last words with no way to reach them — and
 *  "free delivery" is exactly the sort of thing that lives at one of those
 *  ends. Second, the blanket prefers-reduced-motion rule in site.css snaps
 *  every animation to its end state, and this animation's end state is
 *  translateX(-50%), which would freeze the message mid-phrase forever. It
 *  gets its own reduced-motion rule there for that reason. */
export function AnnouncementMarquee({ section }: { section: PublicSection }) {
  const { effects } = useSite();
  const text = str(section.content, "text");
  const href = str(section.content, "href");
  const animated = bool(section.content, "animated", true);
  if (!text) return null;

  const item = (
    <span
      className={`mx-6 inline-flex items-center gap-3 text-sm font-semibold tracking-wide ${
        animated ? "whitespace-nowrap" : ""
      }`}
    >
      <span aria-hidden="true">✦</span>
      {text}
    </span>
  );

  const content = animated ? (
    <div className="site-marquee" aria-hidden="false">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  ) : (
    <div className="py-0.5 text-center">{item}</div>
  );

  return (
    <div
      id={section.key}
      className={`overflow-hidden py-2.5 text-site-on-primary ${
        effects.gradientText ? "site-gradient-bg" : "bg-site-primary"
      }`}
    >
      {href ? (
        <a href={href} className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
