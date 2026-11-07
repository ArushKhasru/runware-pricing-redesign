import { Suspense } from "react";
import { CurlLine } from "@/components/rate-sheet/curl-line";
import { RateSheet } from "@/components/rate-sheet/rate-sheet";
import { getEntries, getMeta } from "@/lib/pricing/load";
import { formatCount } from "@/lib/pricing/format";

/** The Model ID column is exactly this `model` field. Verified against Runware's docs. */
const CURL =
  `curl https://api.runware.ai/v1 -H "Authorization: Bearer $RUNWARE_API_KEY" ` +
  `-H "Content-Type: application/json" -d '[{"taskType":"imageInference",` +
  `"model":"bfl:flux@3-image-klein","positivePrompt":"a lighthouse at dusk",` +
  `"width":1024,"height":1024}]'`;

/** Reserves the estimator and table space so the layout does not shift on hydration. */
function SheetSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="h-[8.5rem] rounded-lg border border-border bg-card" />
      <div className="h-11 rounded-md border border-border bg-input/30" />
      <div className="flex flex-col gap-px">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-12 border-b border-border/40" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const entries = getEntries();
  const meta = getMeta();

  const scraped = new Date(meta.scrapedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-[var(--sheet-max)] px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
      {/*
        The heading takes the full measure and the attribution sits beside it rather than
        below the fold furniture. A narrow measure broke the rag on the page's key number
        and left ~1000x370px of empty ground to the right, which the rate sheet was paying
        for in lost rows.
      */}
      <header className="flex flex-col gap-x-12 gap-y-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-[62ch]">
          <h1 className="text-h1 text-foreground">
            What {formatCount(meta.counts.rows)} models cost at your volume
          </h1>
          <p className="text-body mt-4 max-w-[68ch] text-muted-foreground">
            Every published Runware rate, normalised to the unit you actually count in and
            priced against your own monthly volume — including the output-token rates the
            live rate sheet keeps behind a row expander.
          </p>
        </div>
        <p className="text-label shrink-0 leading-relaxed text-rw-neutral-30 lg:max-w-[38ch] lg:text-right">
          Unaffiliated concept · not endorsed by Runware
          <br className="hidden lg:inline" /> rates are theirs
        </p>
      </header>

      {/*
        Sourced facts and the snippet that turns a chosen model into a request, kept to
        two lines so the rate sheet is not pushed out of the first viewport.
      */}
      <section
        aria-label="Getting started"
        className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6"
      >
        <p className="text-caption min-w-0 shrink-0 text-muted-foreground lg:max-w-[42ch]">
          New accounts on a business email get{" "}
          <strong className="font-medium text-foreground">$2 in free credits</strong>, and
          you are only billed for requests that return an output — both from
          Runware&apos;s FAQ. Every figure here is a list price.
        </p>
        <div className="min-w-0 lg:flex-1">
          <CurlLine snippet={CURL} />
        </div>
      </section>

      {/*
        The sheet reads its entire state from the URL, so it cannot be prerendered.
        Everything above streams immediately; this boundary holds its space rather than
        collapsing the page, so nothing jumps when the controls arrive.
      */}
      <div className="mt-7">
        <Suspense fallback={<SheetSkeleton />}>
          <RateSheet entries={entries} />
        </Suspense>
      </div>

      <footer className="mt-16 border-t border-border/60 pt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-[62ch]">
            <h2 className="text-sm font-medium text-foreground">About this page</h2>
            <p className="text-caption mt-2 text-muted-foreground">
              An unsolicited redesign concept for the AI API pricing section of{" "}
              <a
                href="https://runware.ai/pricing"
                target="_blank"
                rel="noreferrer noopener"
                className="text-foreground underline decoration-border hover:decoration-primary"
              >
                runware.ai/pricing
              </a>
              . It is not affiliated with, commissioned by, or endorsed by Runware, and it
              uses neither their wordmark nor their licensed heading typeface. All prices are
              theirs, read from the public page.
            </p>
            <p className="text-caption mt-2 text-muted-foreground">
              No conversion metrics are claimed anywhere on this page. There is no access to
              Runware&apos;s analytics, so each change is a hypothesis with a stated way to
              measure it — the repository README sets those out.
            </p>
          </div>

          <dl className="shrink-0 space-y-2 sm:text-right">
            <div>
              <dt className="text-label text-rw-neutral-30">Rates captured</dt>
              <dd className="text-caption text-muted-foreground">{scraped}</dd>
            </div>
            <div>
              <dt className="text-label text-rw-neutral-30">Rows · models</dt>
              <dd data-numeric className="text-caption font-mono text-muted-foreground">
                {formatCount(meta.counts.rows)} · {formatCount(meta.counts.models)}
              </dd>
            </div>
            <div>
              <dt className="text-label text-rw-neutral-30">With hidden tiers</dt>
              <dd data-numeric className="text-caption font-mono text-muted-foreground">
                {formatCount(meta.counts.withHiddenTiers)}
              </dd>
            </div>
          </dl>
        </div>
      </footer>
    </main>
  );
}
