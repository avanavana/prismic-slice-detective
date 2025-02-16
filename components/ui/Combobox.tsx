import * as React from 'react'
import { BookMarked, Check, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/Command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { ScrollArea } from '@/components/ui/ScrollArea'

import { cn } from '@/lib/utils'

export type ComboboxOptions = {
  value: string
  label: string
}

interface ComboboxProps {
  createLabelFunction?: (value: string) => string
  label?: string
  options: ComboboxOptions[]
  selected: string
  className?: string
  placeholder?: string
  onChange?: (event: string) => void
  onCreate?: (value: string) => void
}

export function Combobox({
  createLabelFunction,
  label,
  options,
  selected,
  className,
  placeholder,
  onChange,
  onCreate,
}: ComboboxProps) {
  const [ open, setOpen ] = React.useState(false)
  const [ query, setQuery ] = React.useState<string>('')

  return (
    <div className={cn('block', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            key={'combobox-trigger'}
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full max-w-72 justify-between font-normal pl-2'
          >
            <BookMarked size={16} />
            {selected && selected.length > 0 ? (
              <div className='relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden'>
                <span className='text-sm text-gray-300 truncate'>
                  <span className='text-foreground'>{options.find((item) => item.value === selected)?.label}</span>
                  <span>.cdn.prismic.io/api/v2/</span>
                </span>
              </div>
            ) : (
              label ?? 'Search for an option...'
            )}
            <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 rotate-0 opacity-50 transition-transform', { 'rotate-180': open })} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-72 max-w-sm p-0'>
          <Command
            filter={(value, search) => {
              if (value.includes(search)) return 1
              return 0
            }}
            // shouldFilter={true}
          >
            <CommandInput
              placeholder={placeholder ?? 'Choose an option…'}
              value={query}
              onValueChange={(value: string) => setQuery(value)}
            />
            <CommandList>
              {options.length || query ? (
                <>
                  <CommandEmpty
                    onClick={() => {
                      if (onCreate && onChange) {
                        onCreate(query)
                        onChange(query)
                      }

                      setQuery('')
                      setOpen(false)
                    }}
                    className='overflow-hidden p-1 text-foreground'
                  >
                    <div className='relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'>
                      <Plus className='mr-2 h-4 w-4' />
                      <span className='truncate'>
                        {createLabelFunction
                          ? createLabelFunction(query)
                          : `Create: '${query}'`}
                      </span>
                    </div>
                  </CommandEmpty>
                  {options.length ? (
                    <ScrollArea>
                      <div className='max-h-80'>
                        <CommandGroup>
                          {options.map((option) => (
                            <CommandItem
                              key={option.label}
                              value={option.label}
                              onSelect={() => {
                                if (onChange) onChange(option.value)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selected.includes(option.value)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </div>
                    </ScrollArea>
                  ) : null}
                </>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
