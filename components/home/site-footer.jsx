import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const BUILD_YEAR = new Date().getFullYear();

const BROWSE = [
  { href: "/cars", label: "Cars" },
  { href: "/saved-cars", label: "Saved" },
  { href: "/reservations", label: "Reservations" },
];

const SOCIALS = [
  { label: "Instagram", icon: Instagram },
  { label: "X", icon: Twitter },
  { label: "YouTube", icon: Youtube },
];

function ColumnTitle({ children }) {
  return (
    <p className="text-xs uppercase tracking-[0.3em] text-[#ff4d1a]">
      {children}
    </p>
  );
}

export default function SiteFooter({ className }) {
  return (
    <footer
      className={cn(
        "relative z-20 border-t border-white/10 bg-[#050505] px-5 pt-16 pb-10 sm:px-10 md:pt-20",
        className
      )}
    >
      <p className="max-w-full font-display text-[clamp(3.5rem,14vw,12rem)] uppercase leading-[0.8] text-white">
        {BRAND_NAME}
      </p>

      <nav
        aria-label="Footer"
        className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-4"
      >
        <div>
          <ColumnTitle>Browse</ColumnTitle>
          <ul className="mt-4 space-y-2">
            {BROWSE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Company</ColumnTitle>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/cars"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Test drive
              </Link>
            </li>
            <li>
              <span className="text-sm text-white/70" aria-disabled="true">
                Contact
              </span>
            </li>
          </ul>
        </div>

        <div>
          <ColumnTitle>Legal</ColumnTitle>
          <ul className="mt-4 space-y-2">
            <li>
              <span className="text-sm text-white/70" aria-disabled="true">
                Privacy
              </span>
            </li>
            <li>
              <span className="text-sm text-white/70" aria-disabled="true">
                Terms
              </span>
            </li>
          </ul>
        </div>

        <div>
          <ColumnTitle>Social</ColumnTitle>
          <ul className="mt-4 flex gap-3" aria-label="Social profiles">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <li key={label}>
                <span
                  aria-label={label}
                  role="img"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <p className="border-t border-white/10 pt-4 text-xs text-white/70">
        &copy; {BUILD_YEAR} {BRAND_NAME}
      </p>
    </footer>
  );
}
