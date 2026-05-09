'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  height?: number
}

export default function Logo({ height = 32 }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const src = isDark ? '/assets/beni-logo-wordmark-dark.svg' : '/assets/beni-logo-wordmark.svg'
  const width = height * (300 / 100)

  return (
    <Image
      src={src}
      alt="Béni"
      width={width}
      height={height}
      priority
    />
  )
}
