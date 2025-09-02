import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface NavigationMenuProps {
  className?: string
  children: React.ReactNode
}

const NavigationMenu = React.forwardRef<
  HTMLElement,
  NavigationMenuProps
>(({ className, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
  </nav>
))
NavigationMenu.displayName = "NavigationMenu"

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = "NavigationMenuList"

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={className} {...props} />
))
NavigationMenuItem.displayName = "NavigationMenuItem"

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
}