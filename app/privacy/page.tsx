import Link from 'next/link'
import Logo from '@/components/Logo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Béni',
  description: 'How Béni handles your health data and what we collect.',
}

const LAST_UPDATED = 'May 21, 2026'
const CONTACT_EMAIL = 'hello@benihealth.app'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'var(--font-manrope), sans-serif',
        fontWeight: 700, fontSize: 20,
        color: 'var(--fg-1)', marginBottom: 16,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-manrope), sans-serif',
      fontSize: 15, lineHeight: 1.7,
      color: 'var(--fg-2)', marginBottom: 12,
    }}>
      {children}
    </p>
  )
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{
          fontFamily: 'var(--font-manrope), sans-serif',
          fontSize: 15, lineHeight: 1.7,
          color: 'var(--fg-2)', marginBottom: 6,
        }}>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <header style={{
        borderBottom: 'var(--border-hairline)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo height={28} />
        </Link>
        <Link href="/dashboard" style={{
          fontFamily: 'var(--font-manrope), sans-serif',
          fontSize: 13, fontWeight: 600,
          color: 'var(--beni-sky)', textDecoration: 'none',
        }}>
          Back to app →
        </Link>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 28px 80px' }}>

        {/* Title */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontFamily: 'var(--font-manrope), sans-serif',
            fontWeight: 800, fontSize: 36,
            color: 'var(--fg-1)', marginBottom: 8,
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: 'var(--font-manrope), sans-serif',
            fontSize: 14, color: 'var(--fg-4)',
          }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Key message callout */}
        <div style={{
          background: 'var(--beni-sky-12)', borderRadius: 'var(--r-4)',
          padding: '18px 22px', marginBottom: 48,
          borderLeft: '4px solid var(--beni-sky)',
        }}>
          <p style={{
            fontFamily: 'var(--font-manrope), sans-serif',
            fontSize: 15, fontWeight: 600,
            color: 'var(--beni-sky)', margin: 0, lineHeight: 1.6,
          }}>
            Your health records stay with your insurer. Béni reads them to show you insights — we never copy, store, or sell them.
          </p>
        </div>

        <Section title="1. Who we are">
          <P>
            Béni Health Inc. ("Béni", "we", "us") is a consumer health technology company. We build tools that help individuals understand their health insurance coverage and healthcare spending. Our registered address is in the United States. Questions? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>
              {CONTACT_EMAIL}
            </a>.
          </P>
        </Section>

        <Section title="2. The data we collect">
          <P>We collect the minimum necessary to run the service:</P>
          <Ul items={[
            'Account information: your name and email address when you sign up.',
            'Encrypted OAuth tokens: short-lived credentials that authorize Béni to read your insurance data on your behalf. These are encrypted using AES-256-GCM and stored only as opaque ciphertext.',
            'An encrypted reference ID used to fetch your data from your insurer. Stored only as opaque ciphertext.',
            'App preferences: your selected insurer, theme preference, and onboarding status.',
          ]} />
          <P>
            That is the complete list. We do not collect your health records, medical history, diagnoses, prescriptions, lab results, or claims data.
          </P>
        </Section>

        <Section title="3. What we never store — our ephemeral architecture">
          <P>
            When you connect your insurer, Béni fetches your plan data, claims, and health records live from your insurer's servers each time you open the app. This data is displayed to you in your browser and then discarded — it is never written to our database.
          </P>
          <P>The following data is <strong>never stored by Béni</strong>:</P>
          <Ul items={[
            'Health records, clinical notes, or diagnoses',
            'Claims history or Explanation of Benefits (EOBs)',
            'Prescription or medication records',
            'Lab results or imaging reports',
            'Immunization records',
            'Any other Protected Health Information (PHI)',
          ]} />
          <P>
            This is not just a policy — it is how our system is built. Our database contains no tables for health records. There is nothing to breach, sell, or subpoena.
          </P>
        </Section>

        <Section title="4. How we use your data">
          <P>We use the data we collect only to:</P>
          <Ul items={[
            'Authenticate your account and keep it secure.',
            'Connect to your insurer on your behalf using your encrypted credentials.',
            'Display your health insurance data to you in the app.',
            'Send essential service emails (account confirmation, security alerts). We do not send marketing emails without your explicit consent.',
          ]} />
          <P>We do not sell, rent, or share your data with third parties for advertising or marketing purposes.</P>
        </Section>

        <Section title="5. How we protect your data">
          <Ul items={[
            'All OAuth tokens are encrypted with AES-256-GCM before being stored. The encryption key is stored separately from the database.',
            'All data in transit is encrypted via TLS.',
            'Our database (Supabase) uses Row Level Security — your data is only accessible by your own account.',
            'We do not log health data returned from insurer APIs.',
          ]} />
        </Section>

        <Section title="6. Third-party services">
          <P>Béni uses a small number of third-party services to operate:</P>
          <Ul items={[
            'Supabase — database and authentication. Hosted in the United States.',
            'Vercel — application hosting and deployment.',
            'Your insurer\'s FHIR API — we connect to your insurer\'s servers at your direction to fetch your data.',
          ]} />
          <P>
            We only share data with these services to the extent necessary to operate Béni. We do not share your health data with any of these services — health data is fetched from your insurer directly in your session and never persisted.
          </P>
        </Section>

        <Section title="7. Your rights and choices">
          <P>You have full control over your data:</P>
          <Ul items={[
            'Access: you can view all data Béni holds about you in Settings.',
            'Deletion: you can permanently delete your account and all associated data from Settings → Danger zone → Delete account. This also revokes Béni\'s access to your insurer.',
            'Disconnection: you can disconnect your insurer at any time from Settings, which revokes our OAuth token.',
            'Portability: contact us at ' + CONTACT_EMAIL + ' to request an export of your account data.',
          ]} />
        </Section>

        <Section title="8. Applicable regulations">
          <P>
            Because Béni fetches health data at the user's own direction (consumer-directed OAuth), and does not store health records, Béni is not a HIPAA Covered Entity or Business Associate under current HHS guidance.
          </P>
          <P>
            Béni operates as a Personal Health Record (PHR) vendor under the <strong>FTC Health Breach Notification Rule (2024)</strong>. In the event of an unauthorized acquisition or disclosure of your data, we will notify you, the FTC, and (where required) the media within 60 days.
          </P>
          <P>
            If you are a California resident, you have additional rights under the CCPA, including the right to know what personal information we collect and the right to request deletion. Contact us to exercise these rights.
          </P>
        </Section>

        <Section title="9. Data retention">
          <P>
            We retain your account information (name, email, encrypted tokens) for as long as your account is active. When you delete your account, all data is permanently deleted from our systems within 30 days. Health data is never retained — it exists only in your session.
          </P>
        </Section>

        <Section title="10. Changes to this policy">
          <P>
            We will notify you of material changes to this policy by email and by posting a notice in the app at least 14 days before the changes take effect. Your continued use of Béni after the effective date constitutes acceptance of the updated policy.
          </P>
        </Section>

        <Section title="11. Contact">
          <P>
            Questions, concerns, or data requests:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--beni-sky)', textDecoration: 'none', fontWeight: 600 }}>
              {CONTACT_EMAIL}
            </a>
          </P>
        </Section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: 'var(--border-hairline)',
        padding: '24px 28px',
        display: 'flex', justifyContent: 'center',
        fontFamily: 'var(--font-manrope), sans-serif',
        fontSize: 13, color: 'var(--fg-4)',
      }}>
        © 2026 Béni Health Inc.
      </footer>
    </div>
  )
}
