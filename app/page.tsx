import { Suspense } from 'react'

import BreadcrumbBar from '@/components/BreadcrumbBar'
import { ErrorBoundaryWithRetry } from '@/components/ErrorBoundary'
import List from '@/components/List'
import Spinner from '@/components/Spinner'


export default async function Home() {                                                                                                
  return (
    <div className='flex flex-col h-screen'>
      <BreadcrumbBar items={[ { title: 'Prismic Slice Detective', href: '/' }, { title: 'All Documents'}]} />
      <ErrorBoundaryWithRetry message={`Couldn't load data for the selected repository. If you're sure the repository you've chosen isn't set to "private", please try again.`}>
        <Suspense fallback={<div className='flex items-center justify-center grow p-8'><Spinner /></div>}>
          <List />
        </Suspense>
      </ErrorBoundaryWithRetry>
    </div>
  )
}
