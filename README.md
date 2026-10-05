# VEWU Finance Pilot V2.0.2

Oct–Dec 2026 的本地 PWA。React、TypeScript、Vite；金额按整数分计算，CSV 完整备份。无云同步或第三方财务连接。公开项目不含私人账本。

## 上传至现有 GitHub 仓库

1. 打开 `paay-waay/finance-tracker` 的 `main` 分支，选择 **Add file → Upload files**。
2. 上传本文件夹里的内容：`docs/`、`src/`、`public/`、`scripts/` 及根目录配置文件。不要把外层 `finance-tracker-v2-upload` 文件夹一起嵌套上传。
3. 在 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch → main → /docs**，保存。
4. 发布后访问 `https://paay-waay.github.io/finance-tracker/`。不需要在 GitHub 上运行构建。
5. 后续版本继续覆盖同一仓库的文件和 `docs/`；网页提示更新时点击更新。

如果仓库已有旧的 GitHub Actions Pages 工作流，请在仓库 Actions 中停用该工作流；此包使用 `main / docs` 部署。旧 `docs/assets/` 中多出的旧文件可保留，新的页面与离线缓存只使用本次构建的文件。

## 旧账本升级与更换网址

- 在**原网址、原浏览器、原设备**上更新应用，V1 账本自动升级。保留原数据库、存储表和记录键；升级前原始 V1 快照保存在本机，迁移和写入在同一事务中完成。
- 修改网址的协议、域名或端口，以及更换浏览器或设备，都会使用另一个本地存储空间。请先在原应用升级至 V2，选择 **Export CSV**；在新应用选择 **Import CSV** 并确认替换。
- 旧 JSON / ZIP 文件不由本版本导入。CSV 必须来自 V2。重复导入同一 CSV 替换整本账本，不追加交易。
- 初次安装且没有旧账本时，可导入私人 CSV，或创建账本后设置期初余额及 Plan（仅预填通用的 MV 基准、Personal 与 Investment 规则）。公开代码不预装真实收入、资产或消费记录。
- CSV 是完整季度账本，含原始 Plan、Actual 的空值与零值、交易 ID、日期、资金来源、期初余额、分配比例、月结状态、历史版本、语言及备份状态。不要把私人 CSV 上传至公开仓库。

## 本次专项修复

2.0.2：修正日常预算、收入和结算预览最后一行向右偏移的问题。分隔线脱离横向布局，各组的金额和箭头右边界一致；保留 2.0.1 的跳跃修复。

根据 2026-10-04 的 iPhone 录屏，修正设置面板打开时的越界位移和键盘出现后的额外滚动。面板只使用一套可见视窗坐标，取消百分比入场与延迟强制滚动；焦点保持在静止弹窗上，内部切换复用同一弹窗。关闭时恢复原页面位置；保存反馈不挤动内容，写入期间不强制让金额输入失焦。

本次保持旧数据库和账本格式，原网址覆盖更新即可。上传后在应用中安装更新，再重新打开。不要清除网站数据或删除本地账本。修复后的物理 iPhone 键盘与滑动手感仍需复测。

## 使用

- 本月：Lifestyle Remaining、Plan Surplus、MV Savings；Streaming 在折叠的 Fixed 中。
- 修改 Plan 或 Fund 比例：选择仅本月，或本月及后续未月结月份。后续 Actual 和流水保留。
- 记账：金额默认空白；退款填负数。选择 Fund 后仅扣该 Fund。
- 月结：核对收入、固定与个人支出、流水及月末资产，再确认月结。更正时保留历史版本并重新打开本月及后续月份。
- Export CSV 可随时导出完整账本；生成成功更新 Last backup。每月 1–7 日检查上月月结与当前版本备份状态，关闭提醒只对当天有效。
- 主题随系统，玻璃与动效遵守系统的减少透明度、减少动态效果及高对比度偏好。

## 本地维护

需要 Node.js 22.12+（建议 24）。

```sh
npm ci
npm run dev
npm test
npm run build:pages
```

修改源码后运行 `build:pages`，再上传新的 `docs/`。`docs/` 是已构建网站，`src/` 是源码。依赖目录、私人账本、本地数据库与迁移快照均不属于上传内容。

## 验证范围

自动验证和浏览器验收见 `VERIFICATION.md`。物理 iPhone Safari / 安装到主屏幕后真实键盘、系统文字放大及 VoiceOver 尚待实机验收。
