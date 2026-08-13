# dsh-web-attention-badge

[English](README.md) | [简体中文](README.zh-CN.md)

Attention reminders for the DeepSeek Harness Web UI. Whenever a session needs
you, three surfaces light up at once: a `(1)`-style badge in the top-left of
the frame, a `(N)` count in the browser tab title, and a recolored whale
favicon.

- **Amber** — sessions waiting for your input (`ask_user` question, approval
  prompt, plan-mode review).
- **Green** — sessions that finished while you were away and have not been
  opened yet.

All three share the same counts from the built-in sessions store — no host
code, no extra transports. The badge is click-through and never blocks the
sidebar.

## Install

```sh
dsh plugin --profile web add dsh-web-attention-badge
```

Or install straight from GitHub:

```sh
dsh plugin --profile web add "github:Luaphes/dsh-web-attention-badge#v0.3.1"
```

Upgrade / uninstall:

```sh
dsh plugin --profile web update dsh-web-attention-badge
dsh plugin --profile web remove dsh-web-attention-badge
```

`dsh plugin` registers the bundle automatically — no manual config.

## Tuning

Constants at the top of `lib/client.js`:

- `TAB_TITLE_ENABLED` — the `(N)` browser tab title prefix.
- `FAVICON_ENABLED` — the whale-favicon recolor.
- Pill colors/position — the `style` maps in `AttentionBadge` / `Pill`.

Bundle edits apply on a page refresh; manifest edits need a `dsh web`
restart.

## License

[MIT](LICENSE)

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for layout, release and publishing.
