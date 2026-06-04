'use client'

import { useEffect } from 'react'

type HelpSheetProps = {
  open: boolean
  onClose: () => void
  phoneNumber?: string
  phoneHref?: string
  hoursText?: string
  headline?: string
  subhead?: string
}

const SZ = {
  illusW:    'calc(var(--s) * 120px)',
  h2Fs:      'calc(var(--s) * 30px)',
  pFs:       'calc(var(--s) * 20px)',
  pMt:       'calc((var(--s) * 0.5 + 0.5) * 12px)',
  pMb:       'calc((var(--s) * 0.5 + 0.5) * 24px)',
  ctaH:      'calc(var(--s) * 72px)',
  ctaFs:     'calc(var(--s) * 24px)',
  hoursFs:   'calc(var(--s) * 17px)',
  hoursMt:   'calc((var(--s) * 0.5 + 0.5) * 14px)',
  closeFs:   'calc(var(--s) * 19px)',
  closeMt:   'calc((var(--s) * 0.5 + 0.5) * 20px)',
  pad:       'calc((var(--s) * 0.5 + 0.5) * 36px)',
}

export default function HelpSheet({
  open,
  onClose,
  phoneNumber = '1-800-BENI-HELP',
  phoneHref = 'tel:18002364357',
  hoursText = 'Open every day, 7am – 9pm. Average wait under 2 minutes.',
  headline = "We're here to help",
  subhead = 'A real person can walk you through anything. No menus, no robots.',
}: HelpSheetProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-sheet-headline"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(13,27,42,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 28,
          maxWidth: 520,
          width: '100%',
          padding: SZ.pad,
          boxShadow: 'var(--shadow-4)',
          textAlign: 'center',
        }}
      >
        <img
          src="/illus-care.svg"
          alt=""
          aria-hidden
          style={{ width: SZ.illusW, margin: '0 auto 12px', display: 'block' }}
        />

        <h2
          id="help-sheet-headline"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: SZ.h2Fs,
            color: 'var(--fg-1)',
            margin: 0,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontSize: SZ.pFs,
            color: 'var(--fg-2)',
            lineHeight: 1.5,
            margin: `${SZ.pMt} 0 ${SZ.pMb}`,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {subhead}
        </p>

        <a
          href={phoneHref}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'var(--beni-navy)',
            color: '#FFE9CF',
            textDecoration: 'none',
            minHeight: SZ.ctaH,
            borderRadius: 999,
            fontSize: SZ.ctaFs,
            fontWeight: 800,
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <span aria-hidden="true">☎</span> Call {phoneNumber}
        </a>

        <p
          style={{
            fontSize: SZ.hoursFs,
            color: 'var(--fg-3)',
            margin: `${SZ.hoursMt} 0 0`,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {hoursText}
        </p>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: SZ.closeMt,
            background: 'transparent',
            border: 0,
            color: 'var(--action-primary)',
            fontSize: SZ.closeFs,
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
