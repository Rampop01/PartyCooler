import { useEffect, useRef } from "react"

/**
 * useScrollReveal
 * Adds 'reveal-visible' to the element when it enters the viewport.
 * Usage: const ref = useScrollReveal(); <div ref={ref} className="reveal">...</div>
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible")
            // If you want one-time reveal, unobserve
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? "0px",
        threshold: options?.threshold ?? 0.15,
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return ref as React.RefObject<any>
}
