# Multiwyre User FE — Non-Custodial Redesign · Developer Handoff

## 0. ⚠️ SECURITY NOTICE — read first

The cloned repo shipped with **malware embedded in `next.config.mjs`** (appended after
`export default config;`, obfuscated with `\uXXXX` escapes). It was introduced in commit
**`61cb415`**. It used the **Ethereum blockchain as a C2 dead-drop** (hardcoded address
`0xa322E5f3D311D3080e6f0121063e9aDC2490Ef1a`) to resolve a server IP, then downloaded,
`eval()`'d, and `spawn`'d (`node -e`, detached) a remote payload. It runs whenever Node loads
the config (`next dev/build/start/lint`).

- **It has been removed** from `next.config.mjs` in this branch (the file now ends cleanly at
  `export default config;`). The IOC scan found it **only** in that one file; `package.json` has
  no install hooks.
- It **did not execute** during this work — a duplicate `createRequire` declaration made the file
  fail to parse, so the payload never ran.
- **Still required on your side:** investigate how commit `61cb415` got the payload (compromised
  dev machine or stolen GitHub token is typical), **rotate GitHub tokens/credentials**, check the
  `devniti-dev` branch and other repos for the same IOCs, and rotate any secrets on machines that
  previously built/ran this repo.

---

## 1. Where the code is (nothing was pushed)

- Everything lives on local branch **`feat/user-fe-noncustodial-redesign`**.
- **Nothing was committed or pushed to GitHub.** Changes are uncommitted working-tree edits.
- `.env` was created locally from `.env.example` (public test values) so the app can build/run.

## 2. What's new

Design ported 1:1 from the handoff (`Multiwyre User FE Non-Custodial.zip`). Strategy: the
prototype's own CSS was ported verbatim into one stylesheet and the DOM reproduced in React, so the
result is pixel-faithful. All screens are wired to the **existing** endpoints/libraries — no new
data libraries were added.

**New files**
- `src/styles/mw.css` — design system: tokens (colors/typography/spacing/effects) + all component
  styles. Scoped under `.mw-root` so legacy pages are untouched. Imported in `_app.tsx`.
- `src/components/mw/` — shared primitives: `toast.ts` (styled react-hot-toast), `Otp.tsx` (6-digit
  code), `Modal.tsx`, `useConfirm.tsx` (custom confirm dialog), `icons.tsx`, `assets.ts`
  (coin glyph/color + base-ticker/network derivation from `fireblockAssetId`).
- `src/components/dashboard/AddAccountModal.tsx` — 3-step add/edit-wallet wizard (details → 2FA → done).
- `src/components/profile/OrgManagement.tsx` — Roles/Users tab + drawers (see §3 Profile — **no backend**).
- `public/mw/*` — design icons/images (nav, sidebar, header, logos).
- (A dev-only `mw-preview` page was used during development to render all 5 screens without a
  backend/login; it was **removed before pushing** since it bypassed auth. Re-add a similar page
  locally if you want to preview without wiring auth.)

**Rewritten to the new design (endpoint wiring preserved)**
- Shell: `src/components/common/Sidebar.tsx`, `src/components/common/Header.tsx`, `src/components/layout.tsx`
- Screens: `src/components/dashboard/Dashboard.tsx`, `src/components/exchange/ExchangeNew.tsx`,
  `src/components/invoices/Invoices.tsx`, `src/components/reports/Reports.tsx` (History),
  `src/components/profile/Profile.tsx`
- Pages: `src/pages/_app.tsx` (import mw.css), `src/pages/app/exchange.tsx` (title),
  `src/pages/app/history.tsx` + `reports.tsx` (always render the unified History)

**Nav change (per design):** the sidebar now shows **Dashboard · OTC Exchange · Invoice · History ·
Profile**. **Transfers** and **Bulk Payout** were removed from the nav but their routes/pages
(`/app/transfers`, `/app/bulkPayout`) were left intact.

**Type safety:** `tsc --noEmit` is clean for all new/edited files (0 new errors). The pre-existing
122 TS errors are unrelated (108 were the malware in the config, now gone; the rest are in untouched
`buycrypto/`, `transfers/`, `ecomreports/`). The project builds (`ignoreBuildErrors` is on).

---

## 3. Endpoint gaps — what YOU need to build

### Dashboard (non-custodial "Accounts")
Wired to the real whitelist endpoints: `GET/POST/DELETE /accounts/whitelist`
(payload `{ assetId, label, assetAddress, description }`), balances from `GET /accounts/dashboard`,
asset catalogue from `GET /accounts/assets`, activity from `GET transaction/accountBalanceStats`.

**Missing / needs backend:**
1. **Tri-state approval workflow.** `WhitelistAddress.status` is a **boolean** today. The design
   needs **pending / approved / rejected** + an admin approve/reject flow. (Currently mapped
   `true→Approved`, `false→Pending`; "Rejected" cannot appear.)
2. **Explicit `network` field.** Whitelist has none — network is inferred from the `fireblockAssetId`
   suffix (`USDT_ERC20` → ERC20). Add a real column if you want it authoritative.
3. **Update endpoint.** Only create + delete exist. "Edit" is emulated as **delete-then-recreate**
   (changes the id). Add `PUT/PATCH /accounts/whitelist/{id}`.
4. **Payment-activity time-series.** `accountBalanceStats` returns only aggregate 24h/7d/30d
   counts+amounts — the mini bar charts are **decorative**. Define/return a time series
   (stubs `ecommerce/payment-activity-deposit` / `-withdraw` exist but are unused).

### OTC Exchange
Wired to: Kraken public ticker (client rate) × `GET /price-list/fxmarkupfees/{id}` markup +
`GET /price-list/transferfees` fees; execute via `POST /exchange/addOrder`; crypto→EUR also posts
`POST /exchange/euro-transaction` with beneficiary details.

**Missing / needs backend:**
1. **Server-side price/quote** — there is none; the rate comes from **Kraken client-side**. A backend
   quote endpoint would be more reliable/consistent.
2. **Per-order 2FA** — no exchange 2FA endpoint. The "Confirm" 2FA step is gated on the existing
   `POST /auth/verify-two-factor-otp` (only when the user already has 2FA enabled). Provide a real
   per-order verification endpoint if required.
3. **From = EUR "Multiwyre banking details"** are a **static placeholder** in the design, and the
   payment **reference is generated client-side**. Provide a backend source for Multiwyre's
   beneficiary bank details + a real reference (e.g. via `/accounts/checkClientDetails`).
4. **OTC-desk / limits routing** — the old `Exchange.tsx` used `GET /exchange-limits/limit/{id}` +
   `POST /exchange/otc-trade` for out-of-limit orders. The redesign does **not** gate on limits; add
   it back if large orders must route to the OTC desk.

### Invoice
Wired to `GET/POST invoice/addinvoice`; the existing `AddInvoice` MUI dialog is reused for creation.

**Missing / needs backend:**
1. **Server-side search** — the list API supports only column-filter params, no `search`/`q`. The
   search box currently filters the **current page client-side**. Add a search param for full search.
2. **Row (kebab) actions** — only "open invoice URL" is wired. Edit/Delete/Download-PDF per row need
   endpoints/wiring (old PDF flow used `/accounts/checkClientDetails` + html2pdf).

### History (Trading + Processing)
Wired to `GET transaction/exchange/reports` (Trading) and `GET transaction/ecom-transaction-reports`
(Processing). Filters: currency (sent as `assetName`, value = `fireblockAssetId`), `fromDate`, `toDate`.

**Missing / needs backend:**
1. **`Merchant Name` column** — **no such field** in either endpoint; shows `-`. Add it to the ecom
   report if needed.
2. **Pagination** — loads one page of 50, no pager (design has none). Add server pagination for
   large volumes.

### Profile
- **Account Settings** — fully wired (photo `/auth/update-profile-photo`; email OTP
  `/verify/get-email-otp` + `/verify/user/email`; SMS `/verify/get-phone-otp` + `/verify/verify-phone`;
  password `/auth/reset-password`; 2FA `/auth/two-factor-authenticator` + `/auth/verify-two-factor-otp`).
- **Identity "View/Update"** — display-only. Upload endpoints exist (`/verify/user/identity`,
  `/verify/user/address`) but are **not wired** — build the flow.
- **Fees** — only **Transfer fees** have a live feed (`GET /price-list/transfer-fees/{id}` +
  `GET /lib/operation-types-users`). **Network / Exchange / Ecommerce fee categories have no
  dedicated endpoints** (Ecommerce card shows "No fees configured yet."). Either wire the existing
  `GET /price-list/fxmarkupfees/{id}` (FX) and `GET /checkout-merchant/checkout-fees/{id}` (ecom), or
  add dedicated endpoints.
- **Organisation Management (Roles & Users) — NO BACKEND EXISTS.** There are **no** endpoints for
  roles, users, or a permissions catalogue anywhere in the API. The full UI (roles/users tables,
  add/edit drawers, permission groups, custom confirm-delete) was built as a **functional in-memory
  prototype** — **nothing persists across refresh.** This is the largest backend gap.

---

## 4. Backend work needed — consolidated

| Priority | Area | What to build |
|---|---|---|
| **High** | Organisation Management | Full CRUD for **roles**, **users**, and a **permissions catalogue**, plus permission enforcement across the app. Entirely new. |
| **High** | Non-custodial accounts | Tri-state approval (pending/approved/rejected) + admin approve/reject; `PUT/PATCH` update endpoint; optional explicit `network` field. |
| **Medium** | Fees | Endpoints (or wiring) for **Network**, **Exchange/FX**, **Ecommerce** fee categories. |
| **Medium** | Exchange | Per-order 2FA verification; Multiwyre bank-details + reference for From=EUR; optional server quote; OTC limits routing. |
| **Medium** | Payment activity | Time-series endpoint for the deposit/withdrawal charts. |
| **Low** | Invoice | Server-side `search` param; per-row actions (edit/delete/PDF). |
| **Low** | History | `merchantName` in the ecom report; server pagination. |
| **Low** | Identity | Wire `/verify/user/identity` + `/verify/user/address` to the "View/Update" button. |
| **Cross-cutting** | Per-action 2FA | A reusable per-action 2FA verify endpoint (used by add-wallet + exchange confirm) instead of reusing the enable-2FA endpoint. |

## 5. Run / preview

```bash
npm install
# .env already created from .env.example
npm run dev
```
- Auth-gated screens (`/app/*`) redirect to login without a token, so use a real login/token to
  view them. (The throwaway `mw-preview` page used during development was removed before pushing.)

## 6. Notable decisions / deviations
- **Font:** kept the app's existing **Manrope** (Segoe UI as fallback per the tokens) for consistency
  across the app, rather than switching globally to the handoff's Segoe-UI-first stack. Easy to flip
  in `src/styles/mw.css` (`--font-sans`).
- No data was faked: where the design implied data with no endpoint, the UI is built and the gap is
  flagged above (approval status, PA charts, org roles/users, ecommerce/network fees, merchant name).
- Toasts use the existing **react-hot-toast**; the custom confirm dialog replaces native `confirm()`.
