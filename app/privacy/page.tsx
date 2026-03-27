export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">What we collect</h2>
          <p>
            LEXICA collects only the information necessary to provide your account and save your data.
            When you create an account, we store your email address and display name. If you sign in
            with Google or GitHub, we receive your email address, name, and profile image from those
            services. We also store your bookmarked words and custom word lists.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">How we store your data</h2>
          <p>
            Your account data is stored in a database on our server. Passwords are hashed using
            bcrypt and are never stored in plain text. Sessions are managed using secure, signed
            JSON Web Tokens (JWT) stored in cookies.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Cookies</h2>
          <p>
            LEXICA uses a single session cookie to keep you signed in. This cookie is set when
            you log in and is removed when you sign out or when it expires (after 30 days). We do
            not use tracking cookies, advertising cookies, or third-party analytics.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Third-party services</h2>
          <p>
            If you choose to sign in with Google or GitHub, your authentication is handled by those
            services under their respective privacy policies. LEXICA only receives the basic profile
            information listed above and does not access any other data from your Google or GitHub accounts.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Analytics and tracking</h2>
          <p>
            LEXICA does not use any analytics services, tracking pixels, or advertising networks.
            We do not sell, share, or monetize your personal data in any way.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Anonymous usage</h2>
          <p>
            You can use LEXICA without creating an account. When used anonymously, your bookmarks and
            word lists are stored locally in your browser using localStorage. No data is sent to our
            servers unless you create an account and choose to import your local data.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Data deletion</h2>
          <p>
            You can delete your bookmarks and word lists at any time through the My Words page.
            To delete your account entirely, please contact us and we will remove all associated
            data from our servers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Changes to this policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be reflected on this
            page with an updated date. Continued use of LEXICA after changes constitutes acceptance
            of the revised policy.
          </p>
        </section>
      </div>
    </main>
  );
}
