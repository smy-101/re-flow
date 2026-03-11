## Context

当前前端界面由少量自制基础组件和大量页面内联样式混合构成。`components/ui` 只覆盖 Button、Card、Input、Modal 等少数能力，导航、认证页、表单、列表和反馈状态仍大量直接书写颜色与结构，导致控件状态、留白节奏、亮暗模式和交互容器行为不一致。项目已存在部分 `dark:` 样式，但只覆盖 dashboard 局部壳层，尚未形成统一主题系统。

本次变更是跨 `app/`、`components/` 与全局样式层的横切改造，需要先建立稳定的设计系统底座，再逐步迁移高频界面。现有业务路由保持不变，重点影响的页面包括 `/login`、`/register`、`/forgot-password`、`/reset-password`、`/feeds`、`/items`、`/settings/ai` 及其相关详情与表单页面。

## Goals / Non-Goals

**Goals:**
- 建立基于 shadcn/ui 的统一组件底座和语义化主题 token
- 为亮色与暗色模式提供统一的主题切换与持久化体验
- 统一 dashboard 壳层、认证壳层和高频工作流界面的控件、反馈与表面层级
- 通过兼容性包装降低现有页面迁移成本，并为后续页面统一调整预留稳定 API

**Non-Goals:**
- 不修改后端 API、数据库 schema 或认证业务逻辑
- 不在本次变更中重写所有低频页面与营销入口页
- 不追求首轮清除所有历史内联样式，而是优先覆盖核心壳层与高频路径

## Decisions

### 决策 1：以 shadcn/ui 作为基础组件实现，保留项目内统一入口

采用 shadcn/ui 提供 Button、Input、Textarea、Select、Dialog、Sheet、Dropdown Menu、Alert Dialog、Badge、Skeleton、Toast 等基础能力，但优先通过 `components/ui` 目录暴露项目统一入口，而不是第一轮直接把所有页面改成分散的原始导入。

原因：当前仓库已经大量依赖 `components/ui/Button`、`components/ui/Input`、`components/ui/Modal` 等入口，保留兼容层可以降低迁移风险，并让高频页面先完成统一。替代方案是一次性全量改写 imports，但这会放大改动面并增加回归成本。

### 决策 2：主题系统采用语义化 CSS 变量驱动，使用 class 方式切换主题

主题令牌集中定义在 `app/globals.css`，覆盖背景、前景、表面、边框、输入态、焦点环、强调色、成功/警告/错误反馈等语义层，而不是继续依赖页面内硬编码的 `gray-*`、`blue-*`。主题切换通过根布局挂载的 Theme Provider 驱动，确保亮暗模式可持久化并作用于所有组件。

原因：语义化 token 才能支撑全局换肤和组件复用。替代方案是继续在页面级补 `dark:` 类，但那会让暗色模式继续失控，并阻碍后续统一视觉调整。

### 决策 3：壳层先行，分为 dashboard shell 与 auth shell 两个表面系统

`app/(dashboard)` 与认证页面共享同一套 token，但分别定义自己的布局容器、标题层级与交互密度。dashboard shell 负责顶栏、侧栏、移动端抽屉、用户菜单与主题入口；auth shell 负责认证卡片、表单节奏、状态提示和品牌氛围。

原因：两类页面信息密度不同，不能只靠一个 Card 模板解决；但它们又必须共享同一套设计语言。现有路由不新增，仅重构已有页面表现层。

### 决策 4：高频工作流先覆盖“表单 + 列表卡片 + 反馈”三类界面

第一轮优先迁移添加订阅、AI 配置等表单，以及订阅卡片、文章卡片、列表筛选、空状态、错误态和 Toast 反馈。表单页保留为 Client Component；涉及布局与静态容器的页面可继续使用现有 Server/Client 组合，不引入新的数据获取模式。

原因：这些区域最能暴露设计系统是否足够稳定，也最容易形成用户可感知的统一体验。替代方案是先全量翻修所有业务页，但收益不如优先打通核心路径。

### 决策 5：本次设计文档明确文件变更分层

预期变更主要分为以下层级：
- 全局主题层：`app/globals.css`、`app/layout.tsx`、新增主题 Provider 与工具模块
- 基础组件层：`components/ui/*`
- 壳层组件：`components/layout/*`、`app/(dashboard)/layout.tsx`
- 认证界面：`app/login/page.tsx`、`app/register/page.tsx`、`app/forgot-password/page.tsx`、`app/reset-password/page.tsx`
- 高频工作流：`components/feeds/*`、`components/items/*`、`components/ai/*` 等高频组件

## Risks / Trade-offs

- [范围膨胀] 设计系统改造容易演变为全站重写 → 通过“主题层 → 基础控件 → 壳层 → 高频工作流”分批推进控制范围
- [兼容层债务] 保留 `components/ui` 包装会短期存在双层抽象 → 先保证迁移平滑，后续在系统稳定后再收敛 API
- [亮暗模式回归] 历史页面存在大量硬编码颜色 → 优先覆盖核心路径并在 specs 中约束新 UI 只依赖语义 token
- [手工验证成本高] 页面与组件层以手工验收为主 → 在 tasks 中明确核心场景与设备维度，减少模糊回归
- [主题切换闪烁] 根布局挂载主题时可能出现首屏切换抖动 → 通过根级主题初始化和统一 token 降低闪烁风险

## Migration Plan

1. 引入 shadcn/ui 所需依赖、Theme Provider 与语义化主题 token
2. 重建 `components/ui` 作为统一控件入口，优先替换按钮、输入、弹窗、菜单、抽屉与反馈控件
3. 重构 dashboard shell 与 auth shell，确保亮暗模式贯通核心布局
4. 迁移高频表单、列表卡片与反馈态，逐步减少页面级硬编码样式
5. 完成手工验证、ESLint 与 TypeScript 校验后进入实现阶段

回滚策略：若中途出现不可控回归，可先保留主题基础设施与新组件入口，单独回退尚未稳定的页面级重构；由于不涉及 API 与数据结构，回滚范围可限制在前端文件。

## Open Questions

- 主题切换入口默认放在用户菜单中，是否还需要在 dashboard 顶栏提供显式快捷按钮
- 首页 `app/page.tsx` 是否纳入本次重整第一轮，还是在核心工作流稳定后单独处理
