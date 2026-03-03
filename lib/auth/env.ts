/**
 * Environment variable validation module.
 * Validates that all required environment variables are set at application startup.
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvVarConfig[] = [
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT 签名密钥，用于认证令牌的签名和验证',
  },
  {
    name: 'CRON_SECRET',
    required: true,
    description: 'Cron 任务密钥，用于 RSS worker 的身份验证',
  },
];

let validationPerformed = false;

/**
 * Validate all required environment variables.
 * Throws an error and exits the process if any required variable is missing or empty.
 *
 * This should be called once at application startup to fail fast
 * if critical configuration is missing.
 *
 * @throws Error if any required environment variable is missing or empty
 */
export function validateEnv(): void {
  // Skip validation if already performed (prevents duplicate checks in hot reload)
  if (validationPerformed) {
    return;
  }

  const missing: string[] = [];
  const empty: string[] = [];

  for (const config of REQUIRED_ENV_VARS) {
    const value = process.env[config.name];

    if (value === undefined) {
      missing.push(config.name);
    } else if (value === '') {
      empty.push(config.name);
    }
  }

  if (missing.length > 0 || empty.length > 0) {
    const errors: string[] = [];

    if (missing.length > 0) {
      errors.push(
        `缺少必需的环境变量: ${missing.join(', ')}\n请在 .env.local 文件中设置这些变量。`
      );
    }

    if (empty.length > 0) {
      errors.push(
        `以下环境变量不能为空: ${empty.join(', ')}\n请在 .env.local 文件中为这些变量设置非空值。`
      );
    }

    console.error('\n❌ 环境变量验证失败\n');
    console.error(errors.join('\n\n'));
    console.error('\n必需的环境变量:\n');
    REQUIRED_ENV_VARS.forEach((config) => {
      const status = process.env[config.name]
        ? '✓'
        : process.env[config.name] === ''
          ? '(空)'
          : '✗';
      console.error(
        `  ${status} ${config.name} - ${config.description}`
      );
    });
    console.error('\n请参考 .env.local.example 文件配置环境变量。\n');

    process.exit(1);
  }

  validationPerformed = true;
}

/**
 * Get the value of an environment variable, ensuring it's not undefined.
 * This is a type-safe accessor for environment variables that have been validated.
 *
 * @param name - Environment variable name
 * @returns The environment variable value (throws if not validated)
 */
export function getEnv(name: keyof typeof process.env): string {
  if (!validationPerformed) {
    throw new Error(
      'getEnv called before validateEnv. Call validateEnv at application startup.'
    );
  }

  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return value;
}
