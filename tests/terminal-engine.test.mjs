import test from 'node:test';
import assert from 'node:assert/strict';
import {initialTerminalState,executeCommand,challengeProgress,promptFor} from '../src/terminal-engine.mjs';
const run=(s,cmd)=>executeCommand(s,cmd);

test('Ubuntu navigation and challenge completion are filesystem based',()=>{
  let s=initialTerminalState();
  assert.equal(run(s,'pwd').output,'/home/student');
  s=run(s,'cd projects').state;
  s=run(s,'mkdir codex').state;
  s=run(s,'touch codex/README.md').state;
  assert.ok(challengeProgress(s,'linux-files').every(x=>x.done));
  assert.match(run(s,'ls codex').output,/README.md/);
});

test('simulator rejects arbitrary execution',()=>{
  const s=initialTerminalState();
  assert.match(run(s,'sudo rm -rf /').output,/not supported/);
  assert.match(run(s,'cat /etc/passwd').output,/not found/i);
  assert.match(run(s,'ls | grep foo').output,/not implemented/);
  assert.equal(Object.keys(s.fs.linux).length,Object.keys(initialTerminalState().fs.linux).length);
});

test('PowerShell aliases, paths, case-insensitivity and filesystem tasks',()=>{
  let s=initialTerminalState();s.mode='powershell';
  assert.match(promptFor(s),/^PS C:\\/);
  s=run(s,'Set-Location projects').state;
  s=run(s,'New-Item -ItemType Directory -Path Handbook').state;
  s=run(s,'New-Item -ItemType File -Path Handbook\\notes.txt').state;
  assert.ok(challengeProgress(s,'powershell-files').every(x=>x.done));
  assert.match(run(s,'get-childitem handbook').output,/notes.txt/);
});

test('WSL interop does not claim real machine state',()=>{
  let s=initialTerminalState();s.mode='powershell';
  assert.match(run(s,'wsl -l -v').output,/SIMULATED/);
  s=run(s,'wsl').state;
  assert.equal(s.mode,'linux');
  assert.equal(s.wslStarted,true);
  assert.equal(challengeProgress(s,'wsl-interop')[1].done,false);
  s=run(s,'pwd').state;
  assert.ok(challengeProgress(s,'wsl-interop').every(x=>x.done));
  s=run(s,'exit').state;
  assert.equal(s.mode,'powershell');
  assert.match(run(s,'wsl -l -v').output,/Running/);
});

test('null / missing paths and unsupported shell combinations fail safely',()=>{
  let s=initialTerminalState();
  assert.match(run(s,'cd missing').output,/not found/i);
  assert.match(run(s,'cat notes').output,/Is a directory/);
  assert.match(run(s,'mkdir /missing/subfolder').output,/Parent folder/);
  assert.match(run(s,'echo "text').output,/Unclosed/);
  assert.equal(run(s,'cd ..').state.cwd.linux,'/home');
});