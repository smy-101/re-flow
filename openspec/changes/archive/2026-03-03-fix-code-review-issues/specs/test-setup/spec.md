## ADDED Requirements

### Requirement: TypeScript Vitest 全局类型支持

系统 SHALL 配置 TypeScript 以识别 Vitest 的全局测试函数和变量。

#### Scenario: 全局函数类型识别
- **WHEN** 在测试文件中使用 `describe`, `it`, `expect`, `vi` 等全局函数
- **THEN** TypeScript 正确识别这些函数的类型
- **AND** 不抛出 "Cannot find name" 错误

#### Scenario: 测试文件编译通过
- **WHEN** 运行 `pnpm exec tsc --noEmit`
- **THEN** 测试文件不产生类型错误
- **AND** 类型检查成功通过

#### Scenario: Vitest 配置保持一致
- **WHEN** TypeScript 配置已设置全局类型支持
- **THEN** vitest.config.ts 的 `globals: true` 设置保持不变
- **AND** 测试运行器行为不受影响
