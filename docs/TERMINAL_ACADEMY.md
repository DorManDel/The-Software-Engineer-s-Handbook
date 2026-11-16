# Terminal Academy — learning design and safety boundaries

**Version:** prototype v0.1, 2026-11-16. **Runtime:** browser-only, no system APIs.

## Teaching promise

Terminal Academy is a progressive course in shell fluency, initially Linux, PowerShell and WSL integration, then process management, environment variables, permissions, compilation, debugging and systems-programming concepts.

## Current simulation (implemented)

- Linux subset: `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `whoami`, `clear`, `help`, `exit`.
- PowerShell subset: `Get-Location`, `Get-ChildItem`, `Set-Location`, `New-Item`, `Get-Content`, `Write-Output`, related basic aliases, `Get-Help`, `Clear-Host`, `wsl` (modeled), and `wsl --list --verbose`.
- Switch between PowerShell and Linux learning modes; modeled `wsl` transitions. Sample distribution name/state are **fictional** and clearly labeled.
- A virtual filesystem in program memory (Linux case-sensitive, Windows path matching case-insensitive). No data is saved to disks or sent to a server.
- Challenges check the resulting virtual filesystem and navigated directory. Hint and command fill buttons are optional; user still executes.
- Pipes, redirection, code execution, and process-related commands are intentionally excluded. A command parser accepting arbitrary shell syntax is **not** a secure sandbox.

## Future modules (not implemented)

| Stage | Topics | Learning mode |
|---|---|---|
| 0 | Navigation and basic file operations | In-browser simulated filesystem |
| 1 | Permissions and process lifecycle, `fork`, `execve`, `waitpid` | Deterministic state diagrams and quizzes |
| 2 | File descriptors, open/read/write/close, robust I/O | Interactive syscall trace |
| 3 | `gcc`, linker, Makefiles, gdb basics | Guided source examples, evaluated in separate isolated execution service if introduced |
| 4 | Local WSL Companion | Explicit opt-in locally installed helper, least privilege, isolated workdir, confirm each command, timeouts, output limits, networking restrictions, no host-wide deletion; threat model before building |
| 5 | PowerShell automation vs POSIX shell | Side-by-side exercises and portability tests |

**Never pass untrusted commands through `eval`, `exec`, shell interpolation, or unrestricted child processes, including in a container merely assumed safe.** An eventual real executor requires isolation and enforceable resource boundaries, egress policy, authorization, test fixtures and independent security review.

## References

- Microsoft Learn WSL command documentation: https://learn.microsoft.com/en-us/windows/wsl/basic-commands
- Microsoft Learn WSL interop: https://learn.microsoft.com/en-us/windows/wsl/interop
- PowerShell official docs: https://learn.microsoft.com/en-us/powershell/
- Bash Reference Manual: https://www.gnu.org/software/bash/manual/

## Acceptance checks

- [x] Unit tests: navigation, filesystem creation, paths, aliases, WSL transition, unsupported code execution.
- [x] Terminal output uses DOM text nodes; untrusted input is never interpolated into HTML.
- [x] Clearly states simulated environment; does not infer the actual user's installed WSL state.
- [ ] Physical desktop and Galaxy browser testing, accessibility audit and branch PR review.
- [ ] Public deployment permission and signed-off learning content.