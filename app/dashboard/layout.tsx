import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import DashboardNav from '@/components/DashboardNav'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f6] flex flex-col lg:flex-row antialiased selection:bg-[#ff5722] selection:text-white">
      <DashboardNav />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-gradient-to-b from-[#0a0c12] via-[#090a0f] to-[#06070a]">
        {children}
      </div>
    </div>
  )
}
