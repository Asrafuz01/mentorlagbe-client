import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import {
  TuitionFilters as TuitionFiltersForm,
  TuitionPagination,
  TuitionResults,
  type TuitionFilterValues,
} from "@/components/tuitions"
import { getTuitions } from "@/lib/tuition-api"

export const metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description:
    "Search approved online and offline tuitions from verified tutors.",
}

type SearchParamValue = string | string[] | undefined

function firstValue(value: SearchParamValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}

type TuitionsPageProps = {
  searchParams: Promise<{
    search?: SearchParamValue
    subject?: SearchParamValue
    classLevel?: SearchParamValue
    mode?: SearchParamValue
    page?: SearchParamValue
  }>
}

export default async function TuitionsPage({
  searchParams,
}: TuitionsPageProps) {
  const params = await searchParams
  const filters: TuitionFilterValues = {
    search: firstValue(params.search).trim(),
    subject: firstValue(params.subject),
    classLevel: firstValue(params.classLevel),
    mode: firstValue(params.mode),
  }

  const requestedPage = Number(firstValue(params.page))
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1

  let result = await getTuitions({ ...filters, page })
  if (result.totalPages > 0 && result.page > result.totalPages) {
    result = await getTuitions({ ...filters, page: result.totalPages })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1 border-t border-border/80 bg-muted/20 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse Tuitions
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore approved 1-on-1 sessions and mentorship batches from
              verified tutors. Search and filter to find the right fit.
            </p>
          </div>

          <div className="mt-8">
            <TuitionFiltersForm filters={filters} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              {result.total > 0
                ? `${result.total} tuition${result.total === 1 ? "" : "s"} found`
                : "No matching tuitions"}
            </p>
            {result.totalPages > 1 ? (
              <p>
                Page {result.page} of {result.totalPages}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <TuitionResults tuitions={result.items} />
          </div>

          <TuitionPagination
            filters={filters}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
