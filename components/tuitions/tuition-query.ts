export type TuitionFilters = {
  search: string
  subject: string
  classLevel: string
  mode: string
}

export const EMPTY_FILTERS: TuitionFilters = {
  search: "",
  subject: "",
  classLevel: "",
  mode: "",
}

export const SUBJECT_OPTIONS: readonly string[] = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Programming",
  "English",
  "IELTS",
  "Biology",
  "Economics",
]

export const CLASS_LEVEL_OPTIONS: readonly string[] = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "HSC",
  "University",
  "Adults",
]

export const MODE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "", label: "All modes" },
  { value: "Online", label: "Online" },
  { value: "Offline", label: "Offline" },
]

export function buildTuitionsHref(
  filters: TuitionFilters,
  page?: number
): string {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.subject) params.set("subject", filters.subject)
  if (filters.classLevel) params.set("classLevel", filters.classLevel)
  if (filters.mode) params.set("mode", filters.mode)
  if (page && page > 1) params.set("page", String(page))

  const query = params.toString()
  return query ? `/tuitions?${query}` : "/tuitions"
}

export function withCurrentOption(
  options: readonly string[],
  current: string
): readonly string[] {
  return current && !options.includes(current) ? [current, ...options] : options
}
