# Contributing

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

## Local development

```sh
dsh plugin --profile web add /path/to/attention-badge   # local path spec
dsh --profile web --dump-config                          # should list - id: ui-attention-badge
```

Bundle edits are picked up by a page refresh (the server re-hashes and serves
the new `rev`); roster/manifest edits need a `dsh web` restart.

## Release

1. Bump `version` in `package.json` (and note the change in the README
   install examples that pin a tag, if the install docs move to the new tag).
2. Commit, tag and push:

```sh
git tag v<version>
git push origin main --tags
```

3. Publish to npm — either manually:

```sh
npm pack --dry-run          # check the tarball contents first
npm publish --access public
```

or automatically: the CI workflow `.github/workflows/npm-publish.yml` runs
`npm publish` on every `v*` tag push. Set the `NPM_TOKEN` secret once in the
repo settings (Settings → Secrets and variables → Actions → New repository
secret).

## Community visibility

- The repo carries the [`dsh-plugin`](https://github.com/topics/dsh-plugin)
  GitHub topic (official discovery channel for DeepSeek Harness plugins).
- Optionally open a PR adding a one-line entry to
  [awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness)
  (UI & Experience category — update `README.md` and `README.zh-CN.md` in the
  same PR) and to
  [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin).

## Install sources

`dsh plugin` forwards to pnpm in the profile directory and reconciles
`dsh.profile.bundles` automatically because the manifest declares
`dsh.bundle.patch` — any pnpm spec works: npm package name, `github:` URL,
tarball, or local path.
