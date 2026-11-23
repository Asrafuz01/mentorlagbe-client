"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { getCollection } from "@/lib/dashboard-api"

export type DashboardCollectionState<T> = {
  items: T[]
  error: string | null
  loading: boolean
}

/** Small authenticated-fetch hook shared by every dashboard listing page. */
export function useDashboardCollection<T>(
  path: string,
  normalize: (value: unknown) => T | null
) {
  const [state, setState] = useState<DashboardCollectionState<T>>({
    items: [],
    error: null,
    loading: true,
  })
  const [reloadKey, setReloadKey] = useState(0)
  const reloadingRef = useRef(false)
  const reloadResolverRef = useRef<(() => void) | null>(null)

  const reload = useCallback(() => {
    if (reloadingRef.current) return Promise.resolve()
    reloadingRef.current = true
    setState((current) => ({ ...current, loading: true }))
    setReloadKey((key) => key + 1)
    return new Promise<void>((resolve) => {
      reloadResolverRef.current = resolve
    })
  }, [])

  useEffect(() => {
    let active = true
    getCollection<T>(path, normalize).then((result) => {
      if (active) {
        setState({ items: result.items, error: result.error, loading: false })
      }
      reloadingRef.current = false
      const resolve = reloadResolverRef.current
      reloadResolverRef.current = null
      resolve?.()
    })
    return () => {
      active = false
    }
  }, [path, normalize, reloadKey])

  return { ...state, reload }
}
