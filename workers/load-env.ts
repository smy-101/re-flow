import { existsSync } from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const cwd = process.cwd();

// Preserve shell-provided env vars as highest precedence.
const initialEnv = new Map<string, string>();
for (const [key, value] of Object.entries(process.env)) {
	if (value !== undefined) {
		initialEnv.set(key, value);
	}
}

// Load low -> high precedence to match Next.js semantics.
const envFiles: string[] = [
	'.env',
	`.env.${NODE_ENV}`,
	...(NODE_ENV === 'test' ? [] : ['.env.local']),
	`.env.${NODE_ENV}.local`,
];

for (const file of envFiles) {
	const fullPath = path.join(cwd, file);
	if (existsSync(fullPath)) {
		dotenvConfig({ path: fullPath, override: true, quiet: true });
	}
}

for (const [key, value] of initialEnv.entries()) {
	process.env[key] = value;
}
