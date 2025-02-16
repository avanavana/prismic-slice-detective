import { Fragment } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/Breadcrumb'
import { Separator } from '@/components/ui/Separator'
import { SidebarTrigger } from '@/components/ui/Sidebar'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[]
}

export default function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  return (
    <nav className='flex items-center gap-2 h-10 border-b px-8'>
      <SidebarTrigger />
      <Separator orientation='vertical' className='mr-2 h-4' />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map(({ title, href }, i) => (
            <Fragment key={title}>
              <BreadcrumbItem>
                {i < items.length - 1 ? <BreadcrumbLink href={href}>{title}</BreadcrumbLink> : <BreadcrumbPage>{title}</BreadcrumbPage>}
              </BreadcrumbItem>
              {i < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  )
}
