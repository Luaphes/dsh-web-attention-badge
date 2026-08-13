# dsh-web-attention-badge

A browser-surface plugin for the dsh web profile: a small corner badge in the
**top-left of the Web UI frame** that lights up whenever something needs your
attention, in the `(1)` count style:

- **Amber pill** — sessions waiting for user input
  (`SessionSummary.pendingInteraction`: an `ask_user` question, an approval
  prompt, or a plan-mode review).
- **Green pill** — sessions that finished while you were not viewing them and
  have not been opened yet (`SessionSummary.completed`).

The same totals prefix the **browser tab title** as `(N) ` so the reminder
survives a background tab, and the **whale favicon is recolored** while the
reminder is active — the favicon sits on the left side of the browser tab, so
the tint is visible even when the tab title is truncated. Priority color:
**amber** when any session waits for input, **green** when only completed
reminders remain (then the title's number is exactly the completed count).
When the count drops to zero the original whale favicon is restored. The badge
is a pure indicator: it is click-through (`pointer-events: none`) and never
steals clicks from the sidebar brand or collapse toggle underneath.

Both signals ride the client sessions store that the shipped sidebar already
uses for its amber/green per-session dots — this plugin is just a frame-level
aggregate of the same facts, so it has **no host-side code and no extra
transports**.

## Layout

```
attention-badge/
├── package.json            # dual-face manifest: dsh.bundle.patch + dsh.client
├── cordis.patch.yml        # bundle patch: inserts the ui-attention-badge roster row
├── LICENSE                 # MIT
├── .github/workflows/      # npm-publish.yml: publish on v* tag push
└── lib/
    ├── index.js            # host half: empty apply (row presence only)
    ├── client.js           # browser half: window.__ModuleLoader__ bundle
    └── types/              # .d.ts declarations
```

The client bundle is hand-written in the harness's ModuleLoader format (no
build step): it `require`s only the platform seed modules (`react`,
`react/jsx-runtime`) and registers one list entry into the frame-wide
`shell.overlay` slot (the layout's sanctioned seat for badges/toasts).

## Install

Requires Node.js with `dsh` on your `PATH` (`npx @deepseek-ai/dsh web` works
out of the box). Two channels, same result:

```sh
# From the npm registry:
dsh plugin --profile web add dsh-web-attention-badge

# Or straight from this GitHub repository (any branch/tag):
dsh plugin --profile web add "github:Luaphes/dsh-web-attention-badge#v0.3.0"

# Upgrade / uninstall later:
dsh plugin --profile web update dsh-web-attention-badge
dsh plugin --profile web remove dsh-web-attention-badge
```

`dsh plugin` forwards to pnpm in the profile directory, then reconciles
`dsh.profile.bundles` automatically because the manifest declares
`dsh.bundle.patch` — installers never edit manifests by hand. Local
development works the same way:

```sh
dsh plugin --profile web add /path/to/attention-badge   # local path spec
```

Without pnpm, wire it by hand (what the original checkout did):

1. Link the package into the profile's shared `node_modules`:
   `ln -s /path/to/attention-badge $DSH_HOME/profiles/node_modules/dsh-web-attention-badge`
2. Add `"dsh-web-attention-badge"` to `dsh.profile.bundles` in
   `$DSH_HOME/profiles/web/package.json` (and optionally a
   `link:...` dependency entry).
3. Restart `dsh web`. The roster row joins `window.__DSH_BOOT__`; the bundle
   is served at `/plugins/dsh-web-attention-badge/client.js`.

Verify the composition without booting:

```sh
dsh --profile web --dump-config   # should list - id: ui-attention-badge
```

## Publish

Distribution is two-channel, and both are cheap to keep in sync:

1. **GitHub repository (primary)** — the DeepSeek Harness community discovers
   plugins through the [`dsh-plugin`](https://github.com/topics/dsh-plugin)
   topic. Push this repo to GitHub, add the `dsh-plugin` topic in the repo
   settings, and users can install directly from it with the
   `github:Luaphes/dsh-web-attention-badge#tag` spec above.
2. **npm registry (mirror)** — publish the same tree so users can install by
   bare package name:

```sh
npm pack --dry-run          # check the tarball contents first
npm publish --access public
```

A GitHub Actions workflow (`.github/workflows/npm-publish.yml`) publishes
automatically when you push a `v*` tag (set the `NPM_TOKEN` secret in the
repo settings once):

```sh
git tag v0.3.0 && git push --tags
```

Optional but recommended for visibility: open a PR adding a one-line entry to
[awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness)
(UI & Experience category, both README and README.zh-CN) and to
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin).

## Tuning

Constants at the top of `lib/client.js`:

- `TAB_TITLE_ENABLED` — toggle the `(N) ` browser tab title prefix.
- `FAVICON_ENABLED` — toggle the whale-favicon recolor (amber/green by
  state; the original `/favicon.svg` is fetched once and restored when the
  count drops to zero).
- Pill colors/position — the `style` maps in `AttentionBadge` / `Pill`
  (theme variables `--dsw-alias-state-warn-primary` and
  `--dsw-alias-state-success-primary` are used; the favicon recolor resolves
  the same tokens at runtime with `#f7a600` / `#2fb26b` fallbacks).

Bundle edits are picked up by a page refresh (the server re-hashes and serves
the new `rev`); roster/manifest edits need a `dsh web` restart.

## Uninstall

Remove `dsh-web-attention-badge` from `dsh.profile.bundles`, delete the
`node_modules` link (or run `dsh plugin --profile web remove
dsh-web-attention-badge`), and restart `dsh web`.
