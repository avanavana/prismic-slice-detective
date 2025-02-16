'use client'

import { useEffect, useState } from 'react'
import { BookMarked, ChevronsUpDown, Plus } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/Sidebar'
import { set } from 'zod'

interface SidebarRepositorySwitcherProps {
  repositories: string[]
}

export function SidebarRepositorySwitcher({
  repositories,
}: SidebarRepositorySwitcherProps) {
  const { isMobile } = useSidebar()
  const [ selectedRepository, setSelectedRepository ] = useState(repositories[0])

  useEffect(() => {
    setSelectedRepository(repositories[0])
  }, [ repositories ])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <BookMarked className='size-4 shrink-0' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  Prismic Slice Detective
                </span>
                {repositories.length > 0 ? (
                  <span className='text-gray-400 text-xs truncate'><span className='text-sidebar-accent-foreground font-medium'>{selectedRepository}</span><span className=' font-normal'>.cdn.prismic.io/api/v2/</span></span>
                ) : (
                  <span className='text-gray-400 text-xs truncate'>Click to add a repository</span>
                )}
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Repositories
            </DropdownMenuLabel>
            {repositories.length > 0 ?repositories.map((repository, i) => (
              <DropdownMenuItem
                key={`${i}-${repository}`}
                onClick={() => setSelectedRepository(repository)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border shrink-0'>
                  <BookMarked className='size-4 shrink-0' />
                </div>
                <span className='truncate'>{repository}</span>
                <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            )) : (
              <div className='flex gap-2 p-2'>
                <span className='text-sm truncate'>No repositories found.</span>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-muted-foreground'>Add repository</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
