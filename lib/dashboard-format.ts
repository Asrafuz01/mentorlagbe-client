/** Shared display helpers for dashboard tables and cards. */
export function formatDate(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatMoney(amount: number, currency = "BDT"): string {
  const value = Number(amount) || 0
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return currency.toUpperCase() === "USD" ? `$${formatted}` : `৳${formatted}`
}
