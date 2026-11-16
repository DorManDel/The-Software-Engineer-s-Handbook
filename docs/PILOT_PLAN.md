# Pilot chapter plan — C Memory & Pointers

## Why this first
Year 1 Programming 1 explicitly covers pointers; the inspected Systems Programming EX1 README requires dynamic buffers, `malloc/free`, and robust I/O. This creates a verified introductory-to-applied learning path.

## Proposed lesson sequence
1. Variables, types, values and symbolic addresses.
2. `&` and `*`: address-of, pointer declaration, dereference and mutation.
3. Arrays, pointer arithmetic, pointer-to-pointer, and function parameters.
4. Pointer validity, lifetime, null, dangling pointers and undefined behavior.
5. Dynamic allocation (`malloc`, `calloc`, `realloc`, `free`), ownership and cleanup.
6. Practical mini-project: explain the EX1 copy buffer without publishing unauthorized solutions.
7. Advanced bridges: structs, linked lists, process virtual memory, buffer overflow.

## Interactions
A side-by-side code trace and memory animation; step/undo/reset; slider for values; stack/heap/readonly data visualization with explicitly simplified models; a comparison of correct and incorrect pointer usage. Screen reader alternative is mandatory. Save state only on the user's device for the pilot.

## Testable acceptance criteria
- One beginner can explain `&x`, `ptr`, `*ptr` in their own words.
- Examples compile in C17 with `-Wall -Wextra -Wpedantic -Werror`.
- UI distinguishes simulation from real process addresses.
- Quizzes have validated solutions and contextual hints.
- Keyboard and touch work; reduced-motion respected; no layout overflow at mobile widths.
- Each lesson claim can open evidence; citations and permission flags are respected.

## Explicit out of scope
General-purpose online C code execution, multi-user accounts, live AI grading, complete course import, or public publication of lecture PDFs. All remain separate projects/features with approval gates.