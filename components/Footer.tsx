import Link from "next/link";

const NAV_SECTIONS = [
  {
    title: "Discover",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Search", href: "/search" },
      { label: "Sources", href: "/dictionaries" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Words", href: "/lists" },
      { label: "Sign In", href: "/login" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-bold"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}
          >
            LEXICA
          </Link>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Built with 27+ sources spanning two centuries of English.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; 2024&ndash;{new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
