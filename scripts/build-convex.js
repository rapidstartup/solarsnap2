import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Run Convex codegen in non-interactive mode with proper paths
execSync('npx convex dev --once', {
  stdio: 'inherit',
  env: {
    ...process.env,
    CONVEX_DEPLOYMENT_URL: process.env.VITE_CONVEX_URL,
    NODE_ENV: 'development'
  },
  cwd: projectRoot
});