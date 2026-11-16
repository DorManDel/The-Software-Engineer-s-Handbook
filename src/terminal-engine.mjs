/**
 * Terminal Academy: deterministic, in-memory command simulator.
 * This is NOT a shell, WSL, a PowerShell interpreter or a secure code sandbox.
 * No arbitrary processes, networks or real files are accessed.
 */

const HOME = { linux: '/home/student', powershell: 'C:\\Users\\Student' };

const templates = {
  linux: {
    '/': 'dir', '/home': 'dir', '/home/student': 'dir',
    '/home/student/projects': 'dir', '/home/student/projects/shell': 'dir',
    '/home/student/notes': 'dir',
    '/home/student/notes/tips.txt': 'file:Use pwd, ls and cd to explore this simulated Ubuntu workspace.',
    '/mnt': 'dir', '/mnt/c': 'dir', '/mnt/c/Users': 'dir',
    '/mnt/c/Users/Student': 'dir',
  },
  powershell: {
    'C:\\': 'dir', 'C:\\Users': 'dir', 'C:\\Users\\Student': 'dir',
    'C:\\Users\\Student\\Projects': 'dir',
    'C:\\Users\\Student\\Documents': 'dir',
    'C:\\Users\\Student\\Documents\\welcome.txt': 'file:This is a simulated Windows file.',
  },
};

const cloneFs = (value) => Object.assign(Object.create(null), value);

export function initialTerminalState() {
  return {
    mode: 'linux',
    cwd: {...HOME},
    fs: {linux: cloneFs(templates.linux), powershell: cloneFs(templates.powershell)},
    wslStarted: false,
    wslHomeObserved: false,
    history: [],
  };
}

function normalizedKey(fs, path, mode) {
  if (mode === 'linux') return Object.hasOwn(fs, path) ? path : null;
  const key = Object.keys(fs).find(k => k.toLowerCase() === path.toLowerCase());
  return key ?? null;
}

function tokenize(line) {
  const found = [];
  let current = '', quote = null, started = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {quote = null; continue;}
      current += ch; started = true; continue;
    }
    if (ch === '"' || ch === "'") {quote = ch; started = true; continue;}
    if (/\s/.test(ch)) {
      if (started) {found.push(current); current = ''; started = false;}
    } else {current += ch; started = true;}
  }
  if (quote) return {error:'Unclosed quotation mark. Try closing the quote.'};
  if (started) found.push(current);
  return {args: found};
}

function pathFor(state, mode, raw = '.') {
  const slash = mode === 'linux' ? '/' : '\\';
  const fs = state.fs[mode];
  const source = raw || '.';
  let full;
  if (mode === 'linux') {
    full = source === '~' || source.startsWith('~/') ? HOME.linux + source.slice(1) : source.startsWith('/') ? source : state.cwd.linux + '/' + source;
  } else {
    const s = source.replaceAll('/', '\\');
    full = s === '~' ? HOME.powershell : /^[A-Za-z]:\\/.test(s) ? s : state.cwd.powershell + '\\' + s;
  }
  const windows = mode === 'powershell';
  const drive = windows ? full.slice(0, 3) : '';
  if (windows && !/^[A-Za-z]:\\/.test(full)) return {error:'Only simulated absolute drive paths are supported.'};
  const items = (windows ? full.slice(3) : full).split(slash);
  const parts = [];
  for (const x of items) {
    if (!x || x === '.') continue;
    if (x === '..') parts.pop();
    else parts.push(x);
  }
  const canonical = windows ? drive + parts.join('\\') : '/' + parts.join('/');
  const match = normalizedKey(fs, canonical, mode);
  return {path: match ?? canonical, exists: Boolean(match)};
}

function parentOf(mode, path) {
  const slash = mode === 'linux' ? '/' : '\\';
  const ix = path.lastIndexOf(slash);
  return mode === 'linux' ? path.slice(0, ix) || '/' : (ix <= 2 ? path.slice(0,3) : path.slice(0,ix));
}

function leafOf(mode, path) {
  return path.slice(path.lastIndexOf(mode === 'linux' ? '/' : '\\') + 1);
}

function childrenOf(state, mode, target) {
  return Object.keys(state.fs[mode]).filter(k => parentOf(mode, k).toLowerCase() === target.toLowerCase() && k !== target);
}

function success(state, output, shouldClear = false) {return {state, output, clear: shouldClear};}
function fail(state, msg) {return {state, output: `Error: ${msg}`};}

export function promptFor(state) {
  return state.mode === 'linux' ? `student@ubuntu:${state.cwd.linux}$` : `PS ${state.cwd.powershell}>`;
}

/** Apply one command to a fresh copy of a virtual terminal state. */
export function executeCommand(previous, input) {
  const line = String(input).trim().slice(0, 500);
  const state = structuredClone(previous);
  if (!line) return success(state, '');
  const tokens = tokenize(line);
  if (tokens.error) return fail(state, tokens.error);
  const [command, ...args] = tokens.args;
  const mode = state.mode, fs = state.fs[mode];
  state.history.push({mode, command:line});
  if (state.history.length > 100) state.history.shift();

  // Do not imply that this is a full Bash/PowerShell evaluator.
  if (/[|;&<>`$]/.test(line)) {
    return fail(state,'Pipes, redirection, variables and command chaining are not implemented in this lesson simulator.');
  }

  const read = (value) => pathFor(state, mode, value);
  const listing = (target) => {
    const p = read(target);
    if (!p.exists) return fail(state, `Path not found: ${target}`);
    if (fs[p.path].startsWith('file:')) return success(state, leafOf(mode, p.path));
    const entries = childrenOf(state, mode, p.path);
    if (!entries.length) return success(state,'(empty directory)');
    return success(state,entries.map(e=>`${fs[e]==='dir'?'[DIR] ':'      '}${leafOf(mode,e)}`).join('\n'));
  };
  const navigate = (target) => {
    const p=read(target || (mode==='linux'?'~':'~'));
    if (!p.exists) return fail(state,`Path not found: ${target}`);
    if (fs[p.path] !== 'dir') return fail(state, `Not a directory: ${target}`);
    state.cwd[mode]=p.path;
    if (mode==='linux' && state.wslStarted && p.path===HOME.linux) state.wslHomeObserved=true;
    return success(state,'');
  };
  const make = (target, type) => {
    if (!target) return fail(state,'Specify a name or path.');
    const p = read(target);
    if (p.exists) return fail(state, `Already exists: ${target}`);
    const parent = parentOf(mode,p.path);
    const parentKey=normalizedKey(fs,parent,mode);
    if (!parentKey || fs[parentKey] !== 'dir') return fail(state,`Parent folder does not exist: ${parent}`);
    fs[p.path]=type;
    return success(state,`Created ${type==='dir'?'directory':'file'}: ${p.path}`);
  };
  const cat = target => {
    if (!target) return fail(state,'Specify a file to read.');
    const p=read(target);
    if (!p.exists) return fail(state,`Path not found: ${target}`);
    if(fs[p.path] === 'dir') return fail(state,`Is a directory: ${target}`);
    return success(state,fs[p.path].slice(5));
  };
  const helpLinux = 'Supported (simulated) commands: pwd, ls [-a] [path], cd [path], mkdir <path>, touch <path>, cat <file>, echo <text>, whoami, clear, help, exit (back to PowerShell).';
  const helpPS = 'Supported (simulated) commands: Get-Location / pwd, Get-ChildItem / ls / dir, Set-Location / cd, New-Item -ItemType Directory|File -Path <path>, mkdir <path>, Get-Content / cat, Write-Output / echo, whoami, Get-Help, Clear-Host, wsl --list --verbose, wsl (enter modeled Ubuntu).';

  if (mode==='linux') {
    switch(command){
      case 'help': return success(state,helpLinux);
      case 'pwd': if(state.wslStarted && state.cwd.linux===HOME.linux)state.wslHomeObserved=true;return success(state,state.cwd.linux);
      case 'ls': return listing(args.find(a=>!a.startsWith('-'))||'.');
      case 'cd': return navigate(args[0]||'~');
      case 'mkdir': return make(args[0],'dir');
      case 'touch': return make(args[0],'file:');
      case 'cat': return cat(args[0]);
      case 'echo': return success(state,args.join(' '));
      case 'whoami': return success(state,'student');
      case 'clear': return success(state,'',true);
      case 'exit': state.mode='powershell';return success(state,'Returned to simulated PowerShell.');
      default: return fail(state,`'${command}' is not supported here. Type help.`);
    }
  }
  const cmd = command.toLowerCase();
  if (['get-help','help'].includes(cmd)) return success(state,helpPS);
  if (['get-location','pwd'].includes(cmd)) return success(state,state.cwd.powershell);
  if (['get-childitem','ls','dir'].includes(cmd)) return listing(args.find(a=>!a.startsWith('-'))||'.');
  if (['set-location','cd','sl'].includes(cmd)) return navigate(args[0]||'~');
  if (cmd==='mkdir') return make(args[0],'dir');
  if (cmd==='new-item' || cmd==='ni') {
    let type='File',target;
    for(let i=0;i<args.length;i++){
      if (/^-itemtype$/i.test(args[i]))type=args[++i];
      else if (/^-path$/i.test(args[i]))target=args[++i];
      else if(!args[i].startsWith('-')&&!target)target=args[i];
    }
    if(!/^(file|directory)$/i.test(type||''))return fail(state,'Use -ItemType File or Directory.');
    return make(target,type.toLowerCase()==='directory'?'dir':'file:');
  }
  if (['get-content','cat','gc'].includes(cmd)) return cat(args[0]);
  if (['write-output','echo'].includes(cmd)) return success(state,args.join(' '));
  if (cmd==='whoami') return success(state,'workstation\\student');
  if (['clear-host','cls','clear'].includes(cmd)) return success(state,'',true);
  if (cmd==='wsl.exe'||cmd==='wsl') {
    const flags=args.map(x=>x.toLowerCase());
    if ((flags.includes('--list') && flags.includes('--verbose')) || (flags.includes('-l')&&flags.includes('-v'))) {
      return success(state,`  NAME       STATE       VERSION\n* Ubuntu     ${state.wslStarted?'Running':'Stopped'}     2\n\n(SIMULATED sample, not the user's machine)`);
    }
    if (!args.length || args[0]==='~') {
      state.wslStarted=true;state.mode='linux';
      if (args[0]==='~')state.cwd.linux=HOME.linux;
      return success(state,'Entered simulated Ubuntu (WSL2). Use exit to return to PowerShell.');
    }
    return fail(state,'Only wsl, wsl ~ and wsl -l -v are supported in this simulator.');
  }
  return fail(state,`'${command}' is not supported here. Type Get-Help.`);
}

export function challengeProgress(state, id) {
  const has = (mode,p,kind) => {
    const key=normalizedKey(state.fs[mode],p,mode);
    return key && (kind==='dir' ? state.fs[mode][key]==='dir' : state.fs[mode][key]?.startsWith('file:'));
  };
  switch(id){
    case 'linux-files': return [
      {label:'Go to the Linux projects directory',done:state.cwd.linux==='/home/student/projects' || state.cwd.linux.startsWith('/home/student/projects/')},
      {label:'Create a codex directory there',done:!!has('linux','/home/student/projects/codex','dir')},
      {label:'Create README.md inside codex',done:!!has('linux','/home/student/projects/codex/README.md','file')},
    ];
    case 'powershell-files':return [
      {label:'Navigate to the Windows Projects folder',done:state.cwd.powershell.toLowerCase().includes('\\projects')},
      {label:'Create a Handbook directory',done:!!has('powershell','C:\\Users\\Student\\Projects\\Handbook','dir')},
      {label:'Create a notes.txt file inside Handbook',done:!!has('powershell','C:\\Users\\Student\\Projects\\Handbook\\notes.txt','file')},
    ];
    case 'wsl-interop':return [
      {label:'Launch Ubuntu from PowerShell using wsl',done:state.wslStarted},
      {label:'Verify the Linux home directory with pwd or cd ~',done:state.wslHomeObserved},
    ];
    default: return [];
  }
}

export const terminalChallenges = {
  'linux-files':{
    name:'Linux: explore and organize',mode:'linux',
    brief:'Navigate to /home/student/projects, create a folder named codex, and create README.md inside it.',
    hint:'cd projects → mkdir codex → touch codex/README.md',
    examples:['pwd','ls','cd projects','mkdir codex','touch codex/README.md','ls codex']
  },
  'powershell-files':{
    name:'PowerShell: organize your workspace',mode:'powershell',
    brief:'Go to C:\\Users\\Student\\Projects, create Handbook, and place notes.txt inside it.',
    hint:'Set-Location Projects → New-Item -ItemType Directory -Path Handbook → New-Item -ItemType File -Path Handbook\\notes.txt',
    examples:['Get-Location','Get-ChildItem','Set-Location Projects','New-Item -ItemType Directory -Path Handbook','New-Item -ItemType File -Path Handbook\\notes.txt','Get-ChildItem Handbook']
  },
  'wsl-interop':{
    name:'PowerShell → WSL bridge',mode:'powershell',
    brief:'From the simulated PowerShell host, check the WSL distribution, launch Ubuntu, and navigate to your Linux home.',
    hint:'wsl --list --verbose → wsl → cd ~',
    examples:['wsl --list --verbose','wsl','pwd','cd ~','exit']
  }
};