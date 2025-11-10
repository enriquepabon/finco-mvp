import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - MentorIA',
  description: 'Accede a tu cuenta de MentorIA',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

