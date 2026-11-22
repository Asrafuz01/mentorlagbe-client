"use client"

import { useCallback, useEffect, useState } from "react"

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

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true }))
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let active = true
    getCollection<T>(path, normalize).then((result) => {
      if (!active) return
      setState({ items: result.items, error: result.error, loading: false })
    })
    return () => {
      active = false
    }
  }, [path, normalize, reloadKey])

  return { ...state, reload }
}
