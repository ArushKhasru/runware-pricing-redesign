import { Suspense } from "react";
import { RateSheet } from "@/components/rate-sheet/rate-sheet";
import { getEntries, getMeta } from "@/lib/pricing/load";
import { formatCount } from "@/lib/pricing/format";

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
      <header className="max-w-[72ch]">
        <h1 className="text-h1 text-foreground">
          What {formatCount(meta.counts.rows)} models cost at your volume
        </h1>
        <p className="text-body mt-5 text-muted-foreground">
          Every published Runware rate, normalised to the unit you actually count in and
          priced against your own monthly volume — including the output-token rates the
          live rate sheet keeps behind a row expander.
        </p>
        <p className="text-label mt-5 text-rw-neutral-30">
          Unaffiliated concept · not endorsed by Runware · rates are theirs
        </p>
      </header>

      {/* Sourced facts, with the snippet that turns a chosen model into a request. */}
      <section
        aria-label="Getting started"
        className="mt-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <div className="min-w-0 max-w-[46ch]">
          <p className="text-sm text-foreground">
            New accounts on a business email get{" "}
            <strong className="font-medium text-primary">$2 in free credits</strong>, and you
            are only billed for requests that return an output.
          </p>
          <p className="text-caption mt-1.5 text-rw-neutral-30">
            Both quoted from Runware&apos;s pricing FAQ. Every figure here is a list price;
            volume discounts are negotiated with their sales team.
          </p>
        </div>

        <div className="min-w-0 lg:max-w-[46rem] lg:flex-1">
          <p className="text-label mb-2 text-rw-neutral-30">
            The Model ID column is this <code className="text-muted-foreground">model</code>{" "}
            field
          </p>
          <pre className="overflow-x-auto rounded-md border border-border/60 bg-background p-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
            <code>{`curl https://api.runware.ai/v1 \\
  -H "Authorization: Bearer $RUNWARE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '[{"taskType":"imageInference",
       "model":"bfl:flux@3-image-klein",
       "positivePrompt":"a lighthouse at dusk",
       "width":1024,"height":1024}]'`}</code>
          </pre>
        </div>
      </section>

      {/*
        The sheet reads its entire state from the URL, so it cannot be prerendered.
        Everything above streams immediately; this boundary holds its space rather than
        collapsing the page, so nothing jumps when the controls arrive.
      */}
      <div className="mt-10">
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
