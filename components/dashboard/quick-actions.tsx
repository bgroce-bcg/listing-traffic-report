"use client"

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PlusCircleIcon,
  RefreshCwIcon,
  FileTextIcon,
  BarChartIcon,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  title: string
  description: string
  icon: LucideIcon
  href: string
  variant?: 'default' | 'outline' | 'secondary'
  disabled?: boolean
}

const quickActions: QuickAction[] = [
  {
    title: 'Add New Listing',
    description: 'Create a new property listing',
    icon: PlusCircleIcon,
    href: '/listings/new',
    variant: 'default',
  },
  {
    title: 'Refresh Metrics',
    description: 'Update all listing metrics',
    icon: RefreshCwIcon,
    href: '#',
    variant: 'outline',
    disabled: true,
  },
  {
    title: 'Generate Report',
    description: 'Create a new analytics report',
    icon: FileTextIcon,
    href: '/reports/new',
    variant: 'outline',
  },
  {
    title: 'View Analytics',
    description: 'See detailed performance data',
    icon: BarChartIcon,
    href: '/analytics',
    variant: 'outline',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    action.disabled
                      ? "bg-muted"
                      : "bg-primary/10 dark:bg-primary/20"
                  )}>
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        action.disabled
                          ? "text-muted-foreground"
                          : "text-primary"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold text-sm">
                      {action.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </div>
              </>
            )

            if (action.disabled) {
              return (
                <Button
                  key={action.title}
                  variant={action.variant}
                  className="h-auto p-4 justify-start"
                  disabled
                  aria-label={`${action.title} - ${action.description} (Coming soon)`}
                >
                  {content}
                </Button>
              )
            }

            return (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto p-4 justify-start transition-all hover:scale-[1.02]"
                asChild
              >
                <Link
                  href={action.href}
                  aria-label={`${action.title} - ${action.description}`}
                >
                  {content}
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}