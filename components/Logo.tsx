import Image from 'next/image'

interface LogoProps {
  height?: number
  dark?: boolean
}

export default function Logo({ height = 32, dark = false }: LogoProps) {
  const src = dark ? '/assets/beni-logo-wordmark-dark.svg' : '/assets/beni-logo-wordmark.svg'
  const width = height * (280 / 80)

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
