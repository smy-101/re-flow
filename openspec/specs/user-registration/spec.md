# User Registration Spec

## ADDED Requirements

### Requirement: Username validation

系统 SHALL 在用户注册时验证用户名符合以下规则：
- 长度 3-20 个字符
- 仅允许字母、数字、下划线
- 用户名必须唯一

#### Scenario: Valid username
- **WHEN** 用户提交有效的用户名（符合所有规则）
- **THEN** 系统接受该用户名并继续处理注册请求

#### Scenario: Username too short
- **WHEN** 用户提交少于 3 个字符的用户名
- **THEN** 系统返回错误信息 "用户名至少需要 3 个字符"

#### Scenario: Username too long
- **WHEN** 用户提交超过 20 个字符的用户名
- **THEN** 系统返回错误信息 "用户名最多 20 个字符"

#### Scenario: Username with invalid characters
- **WHEN** 用户提交包含非字母数字下划线字符的用户名
- **THEN** 系统返回错误信息 "用户名只能包含字母、数字和下划线"

#### Scenario: Duplicate username
- **WHEN** 用户提交已存在的用户名
- **THEN** 系统返回错误信息 "该用户名已被占用"

### Requirement: Password validation

系统 SHALL 在用户注册时验证密码符合以下规则：
- 长度至少 8 个字符

#### Scenario: Valid password
- **WHEN** 用户提交至少 8 个字符的密码
- **THEN** 系统接受该密码并继续处理注册请求

#### Scenario: Password too short
- **WHEN** 用户提交少于 8 个字符的密码
- **THEN** 系统返回错误信息 "密码至少需要 8 个字符"

### Requirement: Password storage

系统 SHALL 使用 bcrypt 算法（salt rounds: 10）对密码进行哈希后存储，不得明文存储密码。

#### Scenario: Password hashing
- **WHEN** 用户成功注册
- **THEN** 系统将密码的 bcrypt 哈希值存储到数据库，而非原始密码

### Requirement: User account creation

系统 SHALL 在验证通过后创建用户账户，并返回成功响应。

#### Scenario: Successful registration
- **WHEN** 用户提交有效的用户名和密码
- **THEN** 系统创建用户账户，返回 201 状态码，并重定向到登录页面

#### Scenario: Registration with existing username
- **WHEN** 用户提交已存在的用户名
- **THEN** 系统返回 400 状态码和相应错误信息
