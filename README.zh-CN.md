# dsh-web-attention-badge

[English](README.md) | 简体中文

一个面向 DeepSeek Harness Web profile 的浏览器表面插件：当有事情需要你注意时，
**Web UI 框架左上角**会出现 `(1)` 样式的角标，并在**浏览器标签页**同步提醒：

- **琥珀色**——有会话在等你输入（`SessionSummary.pendingInteraction`：
  `ask_user` 提问、审批弹窗或计划模式确认）。
- **绿色**——有会话在你未查看时运行完成、且尚未打开
  （`SessionSummary.completed`）。

同一计数还会：

- 给**浏览器标签页标题**加 `(N) ` 前缀，标签页在后台也能看到提醒；
- 把标签页最左侧的**鲸鱼 favicon 换色**——有等待输入时染琥珀色，仅剩已完成
  提醒时染绿色（此时标题里的数字恰好就是已完成数量）。计数归零后自动恢复
  原色鲸鱼。

角标是纯指示器（`pointer-events: none`），不会挡住左上角品牌区或折叠按钮的
点击。所有信号都复用侧边栏琥珀点/绿点背后的同一个会话存储，**无 host 端
代码、无额外通道**。

## 安装

需要 Node.js 环境并可通过 `npx @deepseek-ai/dsh web` 运行 dsh。两种渠道效果
相同：

```sh
# 从 npm 安装：
dsh plugin --profile web add dsh-web-attention-badge

# 或直接从 GitHub 仓库安装（任意分支/tag）：
dsh plugin --profile web add "github:Luaphes/dsh-web-attention-badge#v0.3.0"

# 升级 / 卸载：
dsh plugin --profile web update dsh-web-attention-badge
dsh plugin --profile web remove dsh-web-attention-badge
```

`dsh plugin` 会转发给 profile 目录下的 pnpm，并在安装后自动维护
`dsh.profile.bundles`（因为清单声明了 `dsh.bundle.patch`），安装者无需手改
任何配置。本地开发同样支持：

```sh
dsh plugin --profile web add /path/to/attention-badge   # 本地路径
```

## 发布

双渠道分发，二者同步成本都很低：

1. **GitHub 仓库（主渠道）**——社区通过
   [`dsh-plugin`](https://github.com/topics/dsh-plugin) 话题发现插件。把仓库
   推送到 GitHub 并添加 `dsh-plugin` 话题，用户即可用上面的
   `github:Luaphes/...#tag` 形式直接安装。
2. **npm 仓库（镜像）**——发布同一份代码，用户可用裸包名安装：

```sh
npm pack --dry-run          # 先检查 tarball 内容
npm publish --access public
```

仓库内置的 GitHub Actions（`.github/workflows/npm-publish.yml`）会在推送
`v*` tag 时自动发布（只需在仓库设置里配置一次 `NPM_TOKEN` secret）：

```sh
git tag v0.3.0 && git push --tags
```

推荐顺手向
[awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness)
（UI & Experience 分类，英文和中文 README 各加一行）和
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
提 PR，提高可见度。

## 调参

`lib/client.js` 顶部的常量：

- `TAB_TITLE_ENABLED`——是否给浏览器标签页标题加 `(N) ` 前缀。
- `FAVICON_ENABLED`——是否按状态给鲸鱼 favicon 换色（琥珀/绿；运行时抓取
  原 `/favicon.svg`，计数归零后恢复）。
- 角标颜色/位置——`AttentionBadge` / `Pill` 中的 `style`（使用主题变量
  `--dsw-alias-state-warn-primary` 与 `--dsw-alias-state-success-primary`；
  favicon 换色在运行时解析同名 token，回退色 `#f7a600` / `#2fb26b`）。

改 `lib/client.js` 后刷新页面即生效；改 manifest / 名单需重启 `dsh web`。

## 卸载

```sh
dsh plugin --profile web remove dsh-web-attention-badge
```

然后重启 `dsh web`。

## 许可

[MIT](LICENSE)
