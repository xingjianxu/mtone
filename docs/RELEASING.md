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

1. 修改代码并通过测试；用 `npm version patch -w @bixlab/mtone --no-git-tag-version`（也可 minor/major）同步更新包版本和 lockfile，提交到 master。
2. GitHub Actions → Publish npm package → Run workflow：只验证，不发布。验证包括类型、全部测试、文档构建、真实 tarball 安装及 React 渲染/TypeScript/CSS 检查。
3. 从该提交创建 GitHub Release，标签严格为 `v<package.json版本>`，如 `v0.1.1`；只发布正式 release，不勾选 prerelease。草稿不会触发。
4. 工作流验证通过后等待 `npm` environment 审批（若配置），然后 Actions 使用 OIDC 发布到 npm `latest`。只推送代码/标签不会发布。
5. 检查工作流成功、npm 页面版本与 provenance，再用 `npm install @bixlab/mtone` 验证。已发布版本不能覆盖，失败重试前先检查 registry，必要时递增版本。

CI 使用 Node 24（npm 要求至少 11.5.1 / Node 22.14）。发布任务不使用依赖缓存，只拥有读取仓库和签发 OIDC 的权限。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)；[新包 staged publishing](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/)；[npm trust 前提](https://docs.npmjs.com/cli/v11/commands/npm-trust/)；[scoped 包与网站审核步骤](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)。
