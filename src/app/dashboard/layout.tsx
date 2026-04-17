import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Control | Barberiapp',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
