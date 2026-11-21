# 合并前全量回归与文档发布

在得到合并授权后，先验证拟合并的**完整 Git 树**，再合入 `master`。同一棵树只需在合并前跑一次全量回归；`master` 的 Documentation 工作流重新构建文档，不再跑这套回归。此流程不发布 npm。

## 准备并验证候选

1. 将当前远端 `master` 和待合并改动整合为最终候选，不要把待审查的内容直接推上 `master`。如果用了普通 PR，请先把该 PR 的改动与当前目标分支整合；也可以从候选分支直接开 PR。
2. 确认候选工作树干净，审查实际提交，再用具备授权的 GitHub 账号建同仓库 `release-candidate/<任务名>` 分支。例如：

   ```sh
   candidate=$(git rev-parse HEAD)
   git status --short
   git push origin "$candidate:refs/heads/release-candidate/<任务名>"
   ```

3. 在 **Actions → Documentation** 找到候选提交的运行，等 **Full regression** 成功（不是仅看工作流摘要）。它检出该事件的指定 SHA，核对 Git 树，运行原有类型检查、单元测试、文档构建、包冒烟检查、参考文件一致性与全部浏览器回归。构建或测试若重写了受 Git 跟踪的文件也会失败；应更新候选并重新验证。候选运行没有 Pages 写权限，不会部署。

GitHub 不一定会为使用内置 `GITHUB_TOKEN` 发起的推送创建新的运行。若候选推送未产生运行，先核实分支和 SHA，再从 Documentation 手动对当前候选分支运行一次，检查其 SHA 与候选一致；不要重复启动同一候选。首次启用新版流程时，候选本身必须包含该工作流，优先通过候选分支推送触发；看不到验证运行时不要直接切换 `master` 或绕过验证。

## 合并和核验 Pages

候选通过后，确认它仍是希望合并的最新结果。若直接推进 `master`，要使用普通快进推送，不得强推；若分支受保护，使用获授权的 PR 合并路径。合并提交、squash 或 rebase 产生的新 SHA 都可接受，但最终完整 Git 树必须与某个通过的候选完全相同。如果目标分支、冲突解法或 PR 内容变化导致树不同，先验证新候选。

```sh
git fetch origin master
git merge-base --is-ancestor origin/master "$candidate"
git push origin "$candidate:refs/heads/master"
```

合并成功后，`master` 的 Documentation 自动运行。它优先查找相同提交的验收，再查最近成功运行中同树的候选；候选必须来自本仓库、指定候选分支和同一个工作流，且对应 run attempt 的 **Full regression** 确实完成。匹配不到、GitHub API 返回错误或当前 `master` 变化均不会发布。通过后从当前事件提交构建并上传本站产物，不下载候选运行中的文件。最后核对成功的 Pages 部署对应目标 SHA，以及线上 `llms.txt` 与该提交一致。

没有有效证据时，先核实候选和目标树；如果只找不到较早的同树证据，请从仍正确的树生成新候选并等待通过，再针对当前 `master` 手动重跑 Documentation。若合并事件由于认证方式等原因未创建运行，也可手动针对当前 `master` 运行，验证规则不变。不要手动上传未通过验证的站点或对过时提交强制部署。

## 权限边界

这是发布门禁，不会自行阻止仓库在 GitHub 上合并 PR；合并前须由获授权的整合者核对成功的候选与预期合并树。如需在仓库层强制合并审批、禁止未审核推送或保护工作流、验证脚本及测试变更，应由仓库管理员设置分支规则和代码所有权。本变更不修改任何仓库或 Pages 环境设置。

同仓库 `release-candidate/**` 是受信任的整合者路径，不面向外部 PR 或其他不受信任的代码。候选工作流运行仓库代码，候选命名空间的写入者以及对验证定义的审核须受控；GitHub 运行记录不能识别被故意削弱的测试。外部贡献应先由维护者审阅，再进入同仓库候选。候选只授予只读权限，不注入仓库秘密；只有 `github-pages` 部署作业授予 Pages 和 OIDC 写权限。
