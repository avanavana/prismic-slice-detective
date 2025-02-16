import type { Metadata } from 'next'

import { SidebarProvider } from '@/components/ui/Sidebar'
import { AppSidebar } from '@/components/AppSidebar'

import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'Prismic Slice Detective',
  description: 'Get better insights into your Prismic repositories.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
      <AppSidebar />
      <main className='grow'>
        {children}
      </main>
    </SidebarProvider>
      </body>
    </html>
  )
}
