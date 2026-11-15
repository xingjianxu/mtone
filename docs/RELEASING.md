# 发布 @bixlab/mtone

包名已配置为 `@bixlab/mtone`，版本 `0.1.0`。本次配置不发布 npm，也不创建 GitHub Release。当前许可证仍是 `UNLICENSED`，正式发布步骤会主动阻止，待仓库所有者明确选择许可证后再修改并加入相应 LICENSE 文件。

## 一次性设置

1. 确认 npm 账号有 `@bixlab` scope 的包创建/发布权限。匿名 registry 的 404 只代表未找到可公开访问的包，不证明名称可用或账号有权限。
2. 选择许可证并提交对应 package.json / LICENSE。公开下载不等于开放源代码授权。
3. 新包还不能预先设置 Trusted Publisher。可由有权限的维护者在自己的电脑使用 npm 最新稳定版本，`npm login` 后执行：

   ```bash
   npm ci
   npm test
   npm run typecheck
   npm run test:package
   cd packages/mtone
   npm stage publish --access public
   ```

   `npm stage publish` 创建包并将首版放入待审核队列，不会立即开放安装。不要把密码、验证码或 token 发到聊天中。通过 npm 网站审核/提升首版后，后续版本全部由 Actions 发布。若坚持首版也由 Actions 上传，可另外配置一次性 stage-only token，但本方案默认不保存任何 npm token。
4. GitHub 仓库 Settings → Environments 新建 `npm`，建议启用 required reviewers（选择维护者），并限制可部署的版本标签 `v*`。
5. npm 包 Settings → Trusted publishing → GitHub Actions：
   - Organization or user: `xingjianxu`
   - Repository: `mtone`
   - Workflow filename: `publish.yml`（不要填路径）
   - Environment name: `npm`
   - Allowed actions: 允许直接 `npm publish`。无需 dist-tag 管理权限。
6. 不需要配置 `NPM_TOKEN` / `NODE_AUTH_TOKEN`。OIDC 由 GitHub-hosted runner 签发短期身份。公开仓库发布公开包会附带 provenance。

## 日常发布

1. 修改代码并通过测试；用 `npm version patch -w @bixlab/mtone --no-git-tag-version`（也可 minor/major）同步更新包版本和 lockfile，提交到 master。
2. GitHub Actions → Publish npm package → Run workflow：只验证，不发布。验证包括类型、全部测试、文档构建、真实 tarball 安装及 React 渲染/TypeScript/CSS 检查。
3. 从该提交创建 GitHub Release，标签严格为 `v<package.json版本>`，如 `v0.1.1`；只发布正式 release，不勾选 prerelease。草稿不会触发。
4. 工作流验证通过后等待 `npm` environment 审批（若配置），然后 Actions 使用 OIDC 发布到 npm `latest`。只推送代码/标签不会发布。
5. 检查工作流成功、npm 页面版本与 provenance，再用 `npm install @bixlab/mtone` 验证。已发布版本不能覆盖，失败重试前先检查 registry，必要时递增版本。

CI 使用 Node 24（npm 要求至少 11.5.1 / Node 22.14）。发布任务不使用依赖缓存，只拥有读取仓库和签发 OIDC 的权限。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)；[新包 staged publishing](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/)。
