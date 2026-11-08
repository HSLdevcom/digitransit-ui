---
applyTo: '**'
---

# Code review

Apply this file only when reviewing a change. Read the surrounding code, not just the diff.

## Standard

- Report defects the change introduces or exposes, most severe first. Don't aim for perfect code.
- Each finding needs a concrete trigger and result: the input, config or state, and what goes wrong. Without one, leave
  it out or ask a question.
- Check the code before reporting. Confirm that callers, types and existing guards don't already handle the case.
- Don't report style preferences, or anything lint, CI or tests enforce: formatting, import boundaries, translation key
  parity, package version and README checks.
- Don't flag omitted stable values such as `config` in hook dependency arrays. This is deliberate.
- Don't flag a failing version check on a package PR. Versions are bumped after approval.

## Regional configs

- A change must work for every region, not only the one tested. `config.default.js` is the base, and shared parents
  such as `config.waltti.js` reach many regions.
- Guard nested access to config keys that only some regions define.
- Merging replaces arrays, deep-merges objects, and ignores a non-array override of an array, so `false` or `null`
  doesn't clear it.
- Prefer feature config keys over checks on the theme or region name.
- Never store request data on a config object. It's shared between requests.

## Server and security

- All merged config is public through `window.config`. Secrets must stay in server-only code.
- Treat request values as untrusted: path, query, cookies, `req.hostname` and forwarded headers. Check escaping in HTML
  output and that redirect targets stay local.
- Don't keep per-request state on shared objects such as the OIDC strategy, and don't log tokens or user data.
- Flag `dangerouslySetInnerHTML` and `innerHTML` with remote, config or translated content unless it's sanitised.

## Data and async

- Handle nullable GraphQL fields. Passing relay-compiler only proves a query matches the checked-in schema, and each OTP
  endpoint may differ.
- Late results and errors must not update the view after inputs change or the page unmounts.
- Clear timers, MQTT subscriptions and listeners on unmount or when their inputs change.
- Keep the configured time zone explicit. `new Date()` and `toLocale*` use the device's zone, and CI's Helsinki `TZ`
  hides these bugs.

## Compatibility

- Existing links must keep working: route paths, URL formats and query parameters are public.
- Stored data outlives deploys. Changing the shape of `localStorage` data or favourites must handle old and corrupt
  values.
- Published packages have external consumers, and CI doesn't check semver. Flag breaking changes to exports or props.
- Packages must not change global state in the host app, or duplicate shared peers such as `react`.

## Styles

- A class is only unused if nothing uses it at runtime. Check `cx()` keys, built names, HTML strings, `@extend`, SVGs
  and class names added by libraries.
- Narrowing a selector or removing `!important` can change which rule wins, so check for visual regressions.
- Check that a `var()` token exists, because an undefined one fails silently. `var()` doesn't work in media queries.
- Per-theme values must be defined for every theme through a default. Colors used by JS belong in the config.

## Accessibility and text

- Interactive elements need keyboard access, visible focus and an accessible name. Dialogs must manage focus.
- User-facing text, including `aria-label`, `title` and `alt`, must be translated. Package text goes in that package's
  own translations.

## Tests and docs

- Tests must fail when the behaviour breaks. Regressions and app-breaking logic need coverage.
- Update `docs/` when a change affects what they describe.
