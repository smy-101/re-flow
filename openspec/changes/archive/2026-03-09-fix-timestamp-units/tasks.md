## 1. 时间基础设施

- [x] 1.1 编写 __tests__/lib/time/timestamp.test.ts 失败用例，覆盖秒级生成、秒/毫秒归一化与展示容错（Red）
- [x] 1.2 运行 pnpm test __tests__/lib/time/timestamp.test.ts 并确认新用例先失败（Red）
- [x] 1.3 实现 lib/time 时间工具与数据库修复辅助逻辑，统一输出秒级时间戳
- [x] 1.4 运行 pnpm test __tests__/lib/time/timestamp.test.ts 并确认全部通过（Green）

## 2. API 写入修复

- [x] 2.1 编写 __tests__/app/api/ai-configs、__tests__/app/api/craft-templates、__tests__/app/api/pipelines 失败用例，覆盖创建、更新、测试状态更新时的秒级时间写入（Red）
- [x] 2.2 运行 pnpm test __tests__/app/api/ai-configs __tests__/app/api/craft-templates __tests__/app/api/pipelines 并确认新用例先失败（Red）
- [x] 2.3 实现 app/api/ai-configs、app/api/craft-templates、app/api/pipelines 路由，改为统一写入秒级时间并复用时间工具
- [x] 2.4 实现 lib/db 迁移或修复脚本，将 ai_configs、craft_templates、pipelines 中的毫秒级历史值归一为秒级
- [x] 2.5 运行 pnpm test __tests__/app/api/ai-configs __tests__/app/api/craft-templates __tests__/app/api/pipelines 并确认全部通过（Green）

## 3. 设置页展示修复

- [x] 3.1 编写手工测试用例 components/ai、components/craft、components/pipeline：Given 已存在历史毫秒数据与新秒级数据，When 用户访问设置页，Then 创建时间与错误时间均显示真实日期
- [x] 3.2 实现 components/ai、components/craft、components/pipeline 的共享时间格式化接入，消除重复的秒/毫秒处理分支
- [x] 3.3 手工验证 app/(dashboard)/settings/ai、app/(dashboard)/settings/craft、app/(dashboard)/settings/pipelines：历史数据与新建数据均不再显示异常未来日期

## 4. 回归校验

- [x] 4.1 运行 pnpm test __tests__/lib/time/timestamp.test.ts __tests__/app/api/ai-configs __tests__/app/api/craft-templates __tests__/app/api/pipelines __tests__/lib/api/craft-templates.test.ts __tests__/lib/api/pipelines.test.ts 并确认全部通过
- [x] 4.2 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 4.3 运行 pnpm exec tsc --noEmit 确认零类型错误
