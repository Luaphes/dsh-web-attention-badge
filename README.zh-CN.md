# dsh-web-attention-badge

[English](README.md) | [简体中文](README.zh-CN.md)

DeepSeek Harness Web 的关注提醒。当有会话需要你时，三处同时亮起：页面左上角
`(1)` 式角标、浏览器标签页标题里的 `(N)` 计数、以及按状态换色的鲸鱼 favicon。

- **琥珀色**——有会话在等待你的输入（`ask_user` 提问、审批弹窗、计划确认）。
- **绿色**——有会话在你离开时运行完成、尚未打开。

三处提醒共享内置会话存储的同一组计数——无 host 代码、无额外通道。角标点击
穿透，不挡侧边栏。

## 安装

```sh
dsh plugin --profile web add dsh-web-attention-badge
```

或直接从 GitHub 安装：

```sh
dsh plugin --profile web add "github:Luaphes/dsh-web-attention-badge#v0.3.1"
```

升级 / 卸载：

```sh
dsh plugin --profile web update dsh-web-attention-badge
dsh plugin --profile web remove dsh-web-attention-badge
```

`dsh plugin` 会自动完成 bundle 登记，无需手动改配置。

## 调参

`lib/client.js` 顶部常量：

- `TAB_TITLE_ENABLED` — 标签页标题 `(N)` 前缀。
- `FAVICON_ENABLED` — 鲸鱼 favicon 换色。
- 角标颜色/位置 — `AttentionBadge` / `Pill` 中的 `style`。

改 bundle 刷新页面即生效；改 manifest 需重启 `dsh web`。

## 许可

[MIT](LICENSE)

## 参与开发

布局、发布与发版流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。
