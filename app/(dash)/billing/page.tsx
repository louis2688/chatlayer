import { requireContext } from "@/lib/server-auth";
import { PACKAGES, getBalance, recentTxns, type CreditPackage } from "@/lib/credits";
import { devTopUpAllowed } from "@/lib/config";
import { purchaseCreditsAction } from "@/app/(dash)/actions";

export const dynamic = "force-dynamic";

const cardClass = (popular?: boolean) =>
  `rounded-xl border p-5 ${popular ? "border-emerald-500/50 bg-emerald-950/10" : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40"}`;

function PackageBody({ p }: { p: CreditPackage }) {
  return (
    <>
      {p.popular && (
        <span className="mb-2 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
          Popular
        </span>
      )}
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{p.label}</p>
      <p className="mt-1 text-2xl font-semibold">${p.price}</p>
      <p className="text-xs text-neutral-500">{p.credits.toLocaleString()} credits</p>
    </>
  );
}

export default async function BillingPage() {
  const { orgId } = await requireContext();
  const [balance, txns] = await Promise.all([getBalance(orgId), recentTxns(orgId)]);
  const stripeOn = !!process.env.STRIPE_SECRET_KEY;
  const canTopUp = devTopUpAllowed();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">1 credit = 1 user message. Credits are shared across your bots.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Available message credits</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-emerald-400">{balance.toLocaleString()}</p>
        </div>
        <svg className="h-10 w-10 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
        </svg>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Get message credits</h2>
        {canTopUp ? (
          <p className="mb-3 mt-1 text-xs text-amber-500">
            Dev mode: purchases top up instantly with no payment. This is disabled in production.
          </p>
        ) : (
          <p className="mb-3 mt-1 text-xs text-neutral-500">
            Checkout is not live yet. Get in touch and we will top up your workspace manually.
          </p>
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) =>
            canTopUp ? (
              <form key={p.id} action={purchaseCreditsAction} className={cardClass(p.popular)}>
                <input type="hidden" name="packageId" value={p.id} />
                <PackageBody p={p} />
                <button type="submit" className="mt-4 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400">
                  {stripeOn ? "Buy" : "Add (dev)"}
                </button>
              </form>
            ) : (
              <div key={p.id} className={cardClass(p.popular)}>
                <PackageBody p={p} />
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full cursor-not-allowed rounded-lg bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 dark:bg-neutral-800"
                >
                  Coming soon
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <ul className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          {txns.length === 0 && <li className="px-4 py-3 text-sm text-neutral-500">No activity yet.</li>}
          {txns.map((t) => (
            <li key={t.id} className="flex items-center justify-between bg-white dark:bg-neutral-900/40 px-4 py-2.5 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">{t.reason}</span>
              <span className={t.delta < 0 ? "tabular-nums text-neutral-500" : "tabular-nums text-emerald-400"}>{t.delta > 0 ? "+" : ""}{t.delta.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}