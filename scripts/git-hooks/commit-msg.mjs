import fs from 'node:fs';
import path from 'node:path';

const msgPath = path.resolve(process.cwd(), '.git/COMMIT_EDITMSG');
const msg = fs.readFileSync(msgPath, 'utf-8').trim();
const commitRE = /^Merge.+|(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|types)(?:\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.error(
    `\n  Error: proper commit message format is required for automated changelog generation.
  - Use 'npm run commit' to interactively generate a commit message.
  - See .github/COMMIT_CONVENTION.md for more details.
    `
  );
  process.exit(1);
}
