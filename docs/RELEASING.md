# 发布 @bixlab/mtone

包名为 `@bixlab/mtone`，采用 MIT 许可证。`0.1.0` 已通过 npm staged publishing 和维护者审核正式发布。后续版本使用下述 GitHub Actions 可信发布流程，安装命令为 `npm install @bixlab/mtone`。

## 一次性设置

1. 确认 npm 账号有 `@bixlab` scope 的包创建/发布权限。匿名 registry 的 404 只代表未找到可公开访问的包，不证明名称可用或账号有权限。
2. 本项目采用 MIT，发布前确认 tarball 包含 LICENSE。
3. 先检查 npm 网站中该包是否已经存在及账号权限。官方 `npm trust` 文档要求包已存在；当前官方首次创建流程支持先 staged publish，再在网站管理包和 Trusted Publisher。这里不假设已登录账号的界面一定没有其他创建入口。下列是已由官方文档确认的引导方式：有权限的维护者使用 npm 最新稳定版本，`npm login` 后执行：

   ```bash
   npm ci
   npm test
   npm run typecheck
   npm run test:package
   cd packages/mtone
   npm stage publish --access public
   ```

   `npm stage publish` 创建新包时会发布一个公开的占位版本，实际提交的代码版本进入待审核队列，尚不能下载其内容。npm 网站的 Staged Packages 页可以查看该版本并点击 Approve，审批需要 2FA；不是必须通过 CLI 审批。不要把密码、验证码或 token 发到聊天中。通过 npm 网站审核/提升首版后，后续版本全部由 Actions 发布。若坚持首版也由 Actions 上传，可另外配置一次性 stage-only token，但本方案默认不保存任何 npm token。
4. GitHub 仓库 Settings → Environments 新建 `npm`，建议启用 required reviewers（选择维护者），并限制可部署的版本标签 `v*`。
5. npm 包 Settings → Trusted publishing → GitHub Actions：
   - Organization or user: `xingjianxu`
   - Repository: `mtone`
   - Workflow filename: `publish.yml`（不要填路径）
   - Environment name: `npm`
   - Allowed actions: **必须显式勾选允许直接 `npm publish`**。新配置默认仅允许 staged publish，不足以运行本项目的直接发布工作流；无需 dist-tag 管理权限。

   **临近第一次 Actions 发布时再创建此配置**：新 Trusted Publisher 必须在创建后 **2 天内完成首次成功发布**，才能完成验证并绑定仓库身份。超时配置会失效，需删除并重新创建，再在新的 2 天窗口内成功发布。不要在许可证、账号权限、版本或 CI 尚未准备好时提前配置；本地首次发布不代替这次 OIDC 验证。
6. 不需要配置 `NPM_TOKEN` / `NODE_AUTH_TOKEN`。OIDC 由 GitHub-hosted runner 签发短期身份。公开仓库发布公开包会附带 provenance。

## 日常发布

1. 完成改动及合并前的针对性检查；用 `npm version patch -w @bixlab/mtone --no-git-tag-version`（也可 minor/major）同步更新包版本和 lockfile，按仓库流程合入 `master`。
2. 明确授权发布后，从该提交创建 GitHub Release，标签严格为 `v<package.json版本>`，如 `v0.1.1`；只发布正式 Release，不勾选 prerelease。草稿、预发布、普通代码或标签推送均不会发布 npm。
3. **Publish npm package** 锁定 Release 的提交和标签，仅核对版本、许可证和提交，检查类型、文档构建和包内容，并实际安装 tarball 做冒烟验证。默认不重跑全量单元或浏览器回归。
4. 发包检查成功后，发布任务从同一提交构建，等待 `npm` environment 审批（若配置），然后通过 OIDC 发布到 npm `latest`。任何发布检查失败都不会进入发布。
5. 核对工作流、npm 页面版本及 provenance，再用 `npm install @bixlab/mtone` 验证。已发布版本不能覆盖，失败重试前先检查 registry，必要时递增版本。

### 按需运行全量回归

只在明确要求全量回归时，在 Actions 中打开 **Full regression (on demand)**，使用 **Run workflow** 选择要检查的分支或标签；也可运行：

```sh
gh workflow run full-regression.yml --ref <已核对的分支或标签>
```

确认目标引用指向待检查的提交。这个手动工作流覆盖全量单元测试及 Chromium、Firefox、WebKit 浏览器用例，不会发 npm，也不使用 npm 环境或可信发布权限。若要求全量回归通过后才发版，先等待该候选的手动工作流通过，再从同一提交创建正式 Release。

CI 使用 Node 24（npm 要求至少 11.5.1 / Node 22.14）。发布任务不使用依赖缓存，只拥有读取仓库和签发 OIDC 的权限。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)；[新包 staged publishing](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/)；[npm trust 前提](https://docs.npmjs.com/cli/v11/commands/npm-trust/)；[scoped 包与网站审核步骤](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)。


## 发布可选编辑器 `@bixlab/mtone-blockeditor`

编辑器独立版本为 `0.1.0`。从 `@bixlab/mtone-blocknote` 改名后，新名称在 npm 上是独立的包，首次发布要走新包流程。旧包不随源码重命名而变动；新包正式发布时同步更新文档里的安装提示。与主包一同发布时，先按上面的流程发布主包；编辑器不由主包的 `publish.yml` 发布，也不要为编辑器另建会触发主包流程的正式 GitHub Release。

在已通过要求的回归并部署文档的同一提交上，执行 `npm ci`，先构建主包、再构建编辑器，然后执行 `npm pack -w @bixlab/mtone-blockeditor`。检查 tarball 含 ESM、声明、样式、许可证和第三方告知，并在干净项目中与官方 npm 已发布的主包一起安装验证。首次发布由有 `@bixlab` 包创建权限的维护者在已登录并验证的 npm 会话使用 `npm stage publish <已核对的-tarball.tgz> --access public`，再在 npm 网站或 CLI 审核，以 2FA 确认。Staging 会公开创建占位版本，正式版本在审核后才可安装。确认 npm 的包名、版本和完整性后，再用官方 registry 进行一次干净安装。编辑器未来如需 OIDC，按包单独设置，并使用与主包区隔的发布工作流。
