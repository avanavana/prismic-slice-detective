'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, FileText, LayoutTemplate } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/Collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/Sidebar'
import { SidebarRepositorySwitcher } from '@/components/SidebarRepositorySwitcher'
import { Skeleton } from '@/components/ui/Skeleton'

import { fetchAllDocumentTypes, fetchAllSlices } from '@/lib/api'

import type { LucideIcon } from 'lucide-react'
import type { PrismicSlice } from '@/lib/prismic'

interface SidebarSectionItem { 
  title: string
  url: string
  isActive?: boolean
  items?: SidebarSectionItem[]
}

interface SidebarSectionProps {
  Icon: LucideIcon
  items: SidebarSectionItem[]
  title: string
}

const SidebarSection = ({ Icon, items, title }: SidebarSectionProps) => (
  <SidebarGroup>
    <SidebarGroupLabel>{title}</SidebarGroupLabel>
    <SidebarMenu>
      {items.map((item, i) => (
        <Collapsible
          key={`${i}-${item.title}`}
          asChild
          defaultOpen={item.isActive}
          className='group/collapsible'
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title} className='group/item'>
                {Icon && <Icon />}
                <a href={item.url} className='grow truncate'>
                  <span className='truncate'>{item.title}</span>
                </a>
                {item.items && <Badge variant='sidebar'>{item.items?.length}</Badge>}
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items && item.items.map((subItem, i) => (
                  <SidebarMenuSubItem key={`${i}-${subItem.title}`}>
                    <SidebarMenuSubButton asChild>
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  </SidebarGroup>
)

interface SidebarSkeletonSectionProps {
  count: number
  title: string
}

const SidebarSkeletonSection = ({ count, title }: SidebarSkeletonSectionProps) => (
  <SidebarGroup>
    <SidebarGroupLabel>{title}</SidebarGroupLabel>
    <SidebarMenu>
      {[ ...Array(count) ].map((_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton>
            <Skeleton className='w-full h-5' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  </SidebarGroup>
)
  
export function AppSidebar() {
  const [ repositories, setRepositories ] = useState<string[]>([])
  const [ documentTypes, setDocumentTypes ] = useState<string[]>([])
  const [ slices, setSlices ] = useState<PrismicSlice[]>([])
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const router = useRouter()

  const defaultItemCount = 3
  const prevDocumentTypeCount = documentTypes.length || defaultItemCount
  const prevSliceCount = slices.length || defaultItemCount

  useEffect(() => {
    const updateSidebarData = async () => {
      setIsLoading(true)

      const storedRepositories = JSON.parse(localStorage.getItem('repositories') || '[]')
      setRepositories(storedRepositories)

      if (storedRepositories.length) {
        try {
          const documentTypes = await fetchAllDocumentTypes(storedRepositories[0])
          setDocumentTypes(documentTypes)

          const slices: PrismicSlice[] = await fetchAllSlices(storedRepositories[0])
          setSlices(slices)
        } catch (error) {
          console.error('Error loading sidebar data:', error)
        }
      }

      setIsLoading(false)
    }

    updateSidebarData()
    window.addEventListener('storage', updateSidebarData)
    return () => window.removeEventListener('storage', updateSidebarData)
  }, [ router ])
  
  return (
    <Sidebar>
      <SidebarHeader className='border-b'>
        <SidebarRepositorySwitcher repositories={repositories} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <>
            <SidebarSkeletonSection title='Slice Types' count={prevSliceCount} />
            <SidebarSkeletonSection title='Document Types' count={prevDocumentTypeCount} />
          </>
        ) : (
          <>
            <SidebarSection
              title='Slice Types'
              Icon={LayoutTemplate}
              items={slices.map((slice, i) => ({
                title: slice.slice_label ?? slice.slice_type,
                url: `/${repositories[0]}/slices/${slice.slice_type}`,
                isActive: i === 0,
                items: slice.variations
                  ? slice.variations.map((variation) => ({
                    title: variation,
                    url: `/${repositories[0]}/slices/${slice}/${variation}`
                    }))
                  : []
                })
              )}
            /> 
            <SidebarSection
              title='Document Types'
              Icon={FileText}
              items={documentTypes.map((type) => ({
                title: type,
                url: `/${repositories[0]}/documents/types/${type}`
              }))}
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
  