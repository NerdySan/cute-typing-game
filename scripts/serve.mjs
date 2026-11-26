import { spawnSync } from 'node:child_process';

const python = process.platform === 'win32' ? 'python' : 'python3';
const result = spawnSync(python, ['-m', 'http.server', '8080'], { stdio: 'inherit' });

if (result.error) {
  console.error(`無法啟動 ${python}：${result.error.message}`);
}
process.exitCode = result.status ?? 1;
