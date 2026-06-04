'use client'

import { useState, type ReactNode } from 'react'
import SeniorScope from './SeniorScope'
import AccessBar from './AccessBar'
import HelpSheet from './HelpSheet'

type SeniorPageProps = {
  children: ReactNode
  showAccessBar?: boolean
}

// One-stop wrapper for new MVP surfaces (inbox, findings, etc.).
// Provides text-scaling context + the accessibility chrome (AccessBar at top,
// HelpSheet on demand). Pass showAccessBar={false} to hide the chrome
// without losing the scaling context.
export default function SeniorPage({ children, showAccessBar = true }: SeniorPageProps) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <SeniorScope>
      {showAccessBar && <AccessBar onHelp={() => setHelpOpen(true)} />}
      {children}
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </SeniorScope>
  )
}
