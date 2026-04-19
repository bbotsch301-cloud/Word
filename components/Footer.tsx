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
    <footer className="border-t border-border mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-serif text-sm font-semibold text-text-primary mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="font-serif text-sm font-bold hero-title"
          >
            LEXICA
          </Link>
          <p className="text-xs text-text-muted text-center">
            Built with 27+ sources spanning two centuries of English.
          </p>
          <p className="text-xs text-text-muted">
            &copy; 2024&ndash;{new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
