export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">1. Service description</h2>
          <p>
            LEXICA is a free, multi-source English dictionary and etymology research tool. It
            aggregates data from publicly available dictionary and linguistic databases to provide
            definitions, etymology, pronunciation, word frequency, and related information.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">2. User accounts</h2>
          <p>
            You may create an account to save bookmarks and word lists across devices. You are
            responsible for maintaining the security of your account credentials. You must provide
            a valid email address and may not impersonate another person or entity.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">3. Acceptable use</h2>
          <p>
            You agree to use LEXICA for lawful purposes only. You may not attempt to disrupt the
            service, access other users&apos; accounts, or use automated tools to scrape data at a
            rate that degrades the service for others.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">4. Content accuracy</h2>
          <p>
            Dictionary data in LEXICA is sourced from third-party databases and historical texts.
            While we strive for accuracy, we do not guarantee that all definitions, etymologies, or
            other information are complete or error-free. LEXICA should not be relied upon as the
            sole source for academic, legal, or professional purposes.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">5. Intellectual property</h2>
          <p>
            The dictionary data presented on LEXICA comes from public-domain and openly licensed
            sources. The LEXICA interface, design, and original features are the property of LEXICA.
            You may not reproduce or redistribute the compiled database without permission.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">6. Account termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or
            that are used to abuse the service. You may delete your account at any time by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">7. Limitation of liability</h2>
          <p>
            LEXICA is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for
            any damages arising from your use of the service, including but not limited to
            inaccuracies in dictionary data, service interruptions, or data loss.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">8. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted on this page with
            an updated date. Continued use of LEXICA after changes constitutes acceptance of the
            revised terms.
          </p>
        </section>
      </div>
    </main>
  );
}
