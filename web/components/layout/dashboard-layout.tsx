import { Header } from './header'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    role: 'student' | 'admin'
  } | null
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 lg:pl-64">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}