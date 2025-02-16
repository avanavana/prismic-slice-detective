import { useEffect, useState } from 'react'

const NO_REDUCED_MOTION_PREFERENCE = '(prefers-reduced-motion: no-preference)'

const usePrefersReducedMotion = () => {
  const [ prefersReducedMotion, setPrefersReducedMotion ] = useState<boolean | null>(null)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(NO_REDUCED_MOTION_PREFERENCE)
    setPrefersReducedMotion(!mediaQueryList.matches)

    const matchMotionPreference = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(!event.matches);
    }

    mediaQueryList.addEventListener('change', matchMotionPreference)

    return () => {
      mediaQueryList.removeEventListener('change', matchMotionPreference)
    }
  }, [])

  return prefersReducedMotion ?? false
}

export { usePrefersReducedMotion }
