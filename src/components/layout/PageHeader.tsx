import Link from "next/link"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 animate-fade-up", className)}>
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageActionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="text-link">
      {children}
    </Link>
  )
}
