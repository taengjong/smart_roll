'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">SmartRoll</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                      대시보드
                    </Link>
                  </NavigationMenuItem>
                  {user?.profile?.role === 'admin' && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/admin/students" className="text-sm font-medium hover:text-primary transition-colors">
                          학생관리
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/admin/courses" className="text-sm font-medium hover:text-primary transition-colors">
                          수강권관리
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/admin/attendance" className="text-sm font-medium hover:text-primary transition-colors">
                          출석관리
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                  {user?.profile?.role === 'student' && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/attendance" className="text-sm font-medium hover:text-primary transition-colors">
                          출석체크
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/schedule" className="text-sm font-medium hover:text-primary transition-colors">
                          수업일정
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{user.profile?.name || user.email}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {user.profile?.role === 'admin' ? '관리자' : '학생'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">로그인</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">회원가입</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm border-b pb-3">
                    <User className="h-4 w-4" />
                    <span>{user.profile?.name || user.email}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {user.profile?.role === 'admin' ? '관리자' : '학생'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href="/dashboard" 
                      className="block py-2 text-sm font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      대시보드
                    </Link>
                    
                    {user.profile?.role === 'admin' ? (
                      <>
                        <Link 
                          href="/admin/students" 
                          className="block py-2 text-sm font-medium hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          학생관리
                        </Link>
                        <Link 
                          href="/admin/courses" 
                          className="block py-2 text-sm font-medium hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          수강권관리
                        </Link>
                        <Link 
                          href="/admin/attendance" 
                          className="block py-2 text-sm font-medium hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          출석관리
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/attendance" 
                          className="block py-2 text-sm font-medium hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          출석체크
                        </Link>
                        <Link 
                          href="/schedule" 
                          className="block py-2 text-sm font-medium hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          수업일정
                        </Link>
                      </>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>로그인</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>회원가입</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}