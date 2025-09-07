'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Users, 
  BookOpen, 
  ClipboardList,
  Settings,
  BarChart3
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const studentMenuItems = [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: '출석체크',
      href: '/attendance',
      icon: CheckSquare
    },
    {
      title: '수업일정',
      href: '/schedule',
      icon: Calendar
    },
    {
      title: '내 수강권',
      href: '/subscriptions',
      icon: BookOpen
    }
  ]

  const adminMenuItems = [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: '출석관리',
      href: '/admin/attendance',
      icon: CheckSquare
    },
    {
      title: '학생관리',
      href: '/admin/students',
      icon: Users
    },
    {
      title: '수강권관리',
      href: '/admin/courses',
      icon: BookOpen
    },
    {
      title: '수업관리',
      href: '/admin/classes',
      icon: Calendar
    },
    {
      title: '통계',
      href: '/admin/analytics',
      icon: BarChart3
    },
    {
      title: '설정',
      href: '/admin/settings',
      icon: Settings
    }
  ]

  const menuItems = user.profile?.role === 'admin' ? adminMenuItems : studentMenuItems

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background/95 lg:backdrop-blur">
      <div className="flex flex-col flex-1 min-h-0 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            SmartRoll
          </Link>
        </div>
        
        <nav className="mt-8 flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left font-medium',
                  isActive && 'bg-secondary text-secondary-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </nav>
        
        <div className="flex-shrink-0 px-4 py-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.profile?.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.profile?.role === 'admin' ? '관리자' : '학생'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}