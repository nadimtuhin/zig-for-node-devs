export interface ChapterInsight {
  mentalModel: string;
  footgun: string;
}

export const chapterInsights: Record<string, ChapterInsight> = {
  "basic_vars": {
    "mentalModel": "In JavaScript, every `number` is a 64-bit IEEE-754 float (`BigInt` aside). In Zig, integers have exact bit-widths (`u8`, `i32`, `u64`, `usize`, `isize`), and the compiler rejects a `var` that is never mutated.",
    "footgun": "Variables declared with `= undefined` hold garbage; in Debug and ReleaseSafe, Zig fills them with `0xaa` bytes so accidental uninitialized reads stand out. ReleaseFast and ReleaseSmall skip the fill."
  },
  "functions_params": {
    "mentalModel": "In JS/TS, function arguments are mutable local variables by default. In Zig, function parameters are always immutable `const`. This allows the Zig compiler to optimize passing by value or invisible pointer without defensive copying.",
    "footgun": "If you need to mutate an argument, declare a local `var copy = param;` or accept a pointer `*T`."
  },
  "arrays_and_slices": {
    "mentalModel": "JS `Array.prototype.slice()` copies elements into a new array. In Zig, a slice `[]T` is a pointer plus a length (16 bytes on 64-bit targets) referencing existing memory without any allocation.",
    "footgun": "Slices are bounds-checked at runtime in Debug and ReleaseSafe modes. Out-of-bounds access immediately causes a safe panic."
  },
  "strings_and_bytes": {
    "mentalModel": "JavaScript strings are UTF-16 encoded, with dynamic allocation and hidden rope/flat tree representations inside V8. Zig strings are raw slices of UTF-8 bytes (`[]const u8`). There is zero hidden metadata or GC overhead.",
    "footgun": "Always remember that `str.len` in Zig returns the number of bytes, not Unicode code points or grapheme clusters."
  },
  "control_flow": {
    "mentalModel": "Zig has no C-style `for (int i=0; i<N; i++)`. `for` iterates slices, arrays, or ranges, and `while` takes an optional continue expression `: (i += 1)` that runs after every iteration, including after `continue`.",
    "footgun": "Loops capture indexes by passing the range `0..` into the `for` header alongside the slice: `for (slice, 0..) |val, idx|`."
  },
  "blocks_as_expressions": {
    "mentalModel": "JavaScript developers constantly use IIFEs `(() => { ... })()` or complex nested ternaries to initialize complex `const` values. Zig lets any labeled block return a value cleanly via `break :label val`.",
    "footgun": "A labeled block must `break :label value` on every path; falling off the end yields `void`, so `const x: u32 = blk: { if (c) break :blk 1; };` fails to compile."
  },
  "errors_as_values": {
    "mentalModel": "In Node.js, `throw new Error()` captures a stack trace, jumps out of normal control flow, and no type says which functions can throw. Zig treats errors as typed values (`!T`), enforced at compile time.",
    "footgun": "The Zig compiler guarantees that every possible error variant must be handled or explicitly propagated."
  },
  "try_and_catch": {
    "mentalModel": "In JS, `try/catch` wraps entire code blocks, obfuscating which call failed. In Zig, `try expr` concisely propagates failures up the call stack, while `expr catch fallback` supplies safe defaults on a single line.",
    "footgun": "`try x` is exact syntax sugar for `x catch |err| return err`."
  },
  "defer_and_errdefer": {
    "mentalModel": "In Node.js, `finally` blocks handle cleanup, but rolling back partial transactions on errors requires manual tracking variables. Zig's `defer` and `errdefer` bind cleanup directly next to the allocation site.",
    "footgun": "Multiple `defer` statements execute in reverse order of declaration (LIFO stack), ensuring dependent resources unwind correctly."
  },
  "inferred_error_sets": {
    "mentalModel": "TypeScript can use `Promise<User>` or `Result<T, E>`, but TypeScript's type system cannot check unhandled thrown exceptions. Zig's `!T` lets the compiler compute the exact closed set of errors automatically.",
    "footgun": "For public libraries, declare explicit error sets (`MyError!T`) so API consumers know every potential error code."
  },
  "optionals_null": {
    "mentalModel": "JavaScript has both `null` and `undefined`, and any variable can unexpectedly become null at runtime. In Zig, regular pointers and primitives can NEVER be null. Optional types `?T` enforce explicit unwrapping.",
    "footgun": "Under the hood, `?*T` is one machine pointer where address `0` means `null`, so no extra tag byte. Non-pointer optionals like `?u32` do carry an extra flag."
  },
  "pointers_basics": {
    "mentalModel": "In JavaScript, primitives are copied and objects are shared by reference, and you can't choose otherwise. In Zig, references are explicit: `*T` points to exactly one item, and `ptr.*` dereferences it.",
    "footgun": "Zig pointers cannot be null (use `?*T`) and cannot undergo arithmetic (use slices `[]T` or many-item pointers `[*]T`)."
  },
  "memory_layout_structs": {
    "mentalModel": "V8 allocates JS objects with hidden Shape/HiddenClass pointers, property backing stores, and boxing overhead. A Zig struct is plain memory with no header, but the compiler may reorder fields and add alignment padding.",
    "footgun": "Use `extern struct` for guaranteed C ABI compatibility, and `packed struct` for bit-level field packing."
  },
  "tagged_unions": {
    "mentalModel": "TypeScript discriminated unions are JS objects like `{ type: 'foo', ... }` on the GC heap. Zig's `union(enum)` overlaps all payloads in one memory slot plus an enum tag sized to the variant count (1 byte for up to 256 variants).",
    "footgun": "The Zig compiler verifies that your `switch` handles every union variant at compile time. Missing a branch fails the build."
  },
  "allocators_philosophy": {
    "mentalModel": "In Go or Node.js, allocation happens silently via `new` or literals, triggering periodic GC pauses. In Zig, the std convention is that functions which heap-allocate take an explicit `allocator: std.mem.Allocator` parameter (a convention, not a language rule).",
    "footgun": "`GeneralPurposeAllocator` (renamed `DebugAllocator` in 0.14, old name aliased) reports leaks when you call `deinit()`, with allocation stack traces in Debug mode by default."
  },
  "arena_allocator": {
    "mentalModel": "In Node.js servers, every JSON payload creates many temporary strings and objects that stress the V8 GC. An Arena allocator bumps a pointer inside large blocks from a child allocator and frees all blocks together in `deinit()` or `reset()`.",
    "footgun": "Use Arena allocators for request lifecycles, CLI commands, and temporary batch processing."
  },
  "fixed_buffer_allocator": {
    "mentalModel": "`malloc` and V8 occasionally need fresh pages from the kernel (`mmap`/`brk`), so allocation cost varies. `FixedBufferAllocator` bumps a pointer through a `[]u8` you provide (often a stack array), never calls the OS, and has predictable cost.",
    "footgun": "If the buffer runs out of space, it returns `error.OutOfMemory` cleanly without crashing the operating system."
  },
  "memory_leak_detection": {
    "mentalModel": "In Node.js, finding leaks means diffing heap snapshots from `--inspect`. In Zig, the test runner gives each test a fresh `std.testing.allocator` and fails the test, with stack traces, if memory allocated through it is not freed.",
    "footgun": "Pass `std.testing.allocator` into the code under test and run `zig build test` in CI; it catches leaks on every path your tests exercise."
  },
  "comptime_intro": {
    "mentalModel": "In TypeScript, generic type parameters are erased during compilation, leaving no type info at runtime. In C++, templates use cryptic metaprogramming syntax. In Zig, generic types are plain functions executed at compile time.",
    "footgun": "`comptime` parameters can compute lookup tables, validate SQL queries, and construct tailored struct layouts at build time with zero runtime cost."
  },
  "comptime_reflection": {
    "mentalModel": "In Node.js, `Object.entries()` and `JSON.stringify()` inspect properties at runtime on every call. Zig's `@typeInfo` returns type metadata at compile time; with `inline for`, the compiler emits code specialized per field.",
    "footgun": "Combine `inline for` with `@typeInfo` to create hyper-fast JSON and binary serializers without any runtime reflection overhead."
  },
  "compile_time_assertions": {
    "mentalModel": "TypeScript can enforce types, but cannot validate value constraints like 'buffer size must be a power of two' or 'port must be between 1 and 65535'. Zig's `@compileError` stops the compiler instantly with custom error messages.",
    "footgun": "Zig analyzes lazily: a `@compileError` only fires if the code containing it is referenced, so place checks where every build reaches them."
  },
  "generics_in_practice": {
    "mentalModel": "TypeScript classes with generics are runtime prototypes. Zig's generic patterns instantiate concrete structs tailored to the exact type `T`, generating optimal cache-friendly assembly for integers, structs, or pointers.",
    "footgun": "Generic types in Zig use PascalCase (`Stack(T)`, `ArrayList(T)`) to indicate that they return a type."
  },
  "arraylist": {
    "mentalModel": "JavaScript arrays dynamically resize, causing V8 to reallocate and copy elements behind the scenes. In Zig, `ArrayList(T)` gives you explicit control over capacity with `.ensureTotalCapacity()`, avoiding redundant allocations.",
    "footgun": "Always call `defer list.deinit()` to prevent memory leaks when the list leaves scope."
  },
  "hashmap": {
    "mentalModel": "JavaScript's `Map` uses an internal hash table managed by V8. Zig provides `AutoHashMap(K, V)` for numbers and structs, and `StringHashMap(V)` for string slices using high-performance hashing (Wyhash).",
    "footgun": "Be careful with string keys: `StringHashMap` stores references to the key slices. If the key slice is deallocated, the hashmap entry becomes dangling unless you duplicate the string."
  },
  "file_io": {
    "mentalModel": "Node.js `fs.readFile()` runs on libuv's thread pool and hands buffers to V8. Zig's `std.fs` (0.13/0.14) is synchronous: it calls the OS directly (via libc on macOS), with no built-in event loop.",
    "footgun": "Wrap readers in `std.io.bufferedReader` to batch many small reads into fewer syscalls."
  },
  "formatting_and_printing": {
    "mentalModel": "JavaScript template literals `${...}` silently convert types to strings and concatenate on the heap. Zig's format engine is type-checked at compile time: passing an integer to a `{s}` string specifier fails compilation immediately.",
    "footgun": "Use `std.fmt.bufPrint` when writing into fixed stack buffers to avoid heap allocations entirely."
  },
  "threads_basics": {
    "mentalModel": "Node.js runs JS on one main thread; each `worker_threads` Worker gets its own V8 isolate and Node environment (~10MB RSS each, measured on Node 24). Zig threads are native OS threads sharing memory directly; `std.Thread.spawn` reserves a 16 MiB stack by default (`stack_size`).",
    "footgun": "Always call `.join()` or `.detach()` on spawned threads to avoid leaking OS thread handles."
  },
  "atomics_and_mutexes": {
    "mentalModel": "JS callbacks run one at a time on the main thread, so plain JS objects never need mutexes (shared memory needs `SharedArrayBuffer` + `Atomics`). In multi-threaded Zig, shared mutable state needs `std.Thread.Mutex` or `std.atomic.Value`.",
    "footgun": "Combine `mutex.lock()` with `defer mutex.unlock()` immediately on the next line to ensure locks are never held permanently, even if errors occur."
  },
  "channel_patterns": {
    "mentalModel": "In Go, goroutines communicate via built-in channels. In Zig, synchronization primitives (`Condition`, `Semaphore`, `Mutex`) give you granular control over locking and wakeup signaling without runtime scheduler baggage.",
    "footgun": "Zig lets you tailor queues for single-producer single-consumer (SPSC) lock-free execution for maximum throughput."
  },
  "event_loops_in_zig": {
    "mentalModel": "Node.js uses libuv over epoll/kqueue. Zig's std has no event loop in 0.13/0.14, so you choose: `httpz` and `zap` (facil.io) use epoll/kqueue, while TigerBeetle drives `io_uring` on Linux directly.",
    "footgun": "Don't assume a fixed speedup: Zig removes GC pauses and JIT warmup, but throughput and tail latency depend on your I/O model and workload. Benchmark both on your real traffic."
  },
  "c_interop_basics": {
    "mentalModel": "In Node.js, calling C/C++ means building N-API addons with `node-gyp` and Python. Zig ships a C compiler: `@cImport` translates most C headers so you call functions directly; bitfield structs and complex macros may not translate.",
    "footgun": "Zig can also compile C and C++ code directly using `zig cc` and `zig c++`."
  },
  "napi_addons": {
    "mentalModel": "Writing Node-API addons in C++ requires managing complex `v8::Local<Value>` handles and enduring slow `node-gyp` builds. In Zig, you can compile native `.node` addons in seconds with pure `zig build-lib`.",
    "footgun": "`export fn` plus `-dynamic` gives a C ABI shared library for `dlopen`/FFI; `require()` also needs an N-API init (`napi_register_module_v1`) or it throws \"Module did not self-register\"."
  },
  "wasm_compilation": {
    "mentalModel": "Compiling Rust to Wasm often requires `wasm-bindgen` and `wasm-pack`. Zig compiles directly to `wasm32-freestanding` out of the box with zero external dependencies, producing tiny, highly-optimized binaries.",
    "footgun": "Run `zig build-exe main.zig -target wasm32-freestanding -fno-entry -rdynamic -O ReleaseSmall`; without `-fno-entry` the linker fails looking for `_start`. The two exports in this chapter compile to about 150 bytes."
  },
  "cross_compilation": {
    "mentalModel": "Building native code for Linux on a Mac typically requires Docker or cross-compilation toolchains that take hours to configure. Zig bundles headers and source for musl and glibc across dozens of targets.",
    "footgun": "Cross-compile with `zig build-exe main.zig -target x86_64-linux-musl` (or `zig build -Dtarget=...` if `build.zig` uses `standardTargetOptions`). The first `-lc` build compiles musl (~20s), then it is cached."
  },
  "build_zig": {
    "mentalModel": "Node.js developers juggle `package.json`, `webpack.config.js`, `tsconfig.json`, and bash scripts. Zig replaces all build tooling with `build.zig`, written in the exact same language with full type safety and IDE autocompletion.",
    "footgun": "The build system caches each step by content hash, so unchanged steps are skipped; changed code still recompiles (incremental compilation is experimental)."
  },
  "zig_package_manager": {
    "mentalModel": "npm resolves names through a central registry and runs `postinstall` scripts on install. Zig packages are fetched by URL and pinned by a content hash, but each dependency's `build.zig` is Zig code that runs during your build, so audit it.",
    "footgun": "Add dependencies using `zig fetch --save <url>` directly from your terminal."
  },
  "unit_testing": {
    "mentalModel": "In Node.js, unit tests need a runner like `jest`, `vitest`, or `mocha`. Zig has a built-in test runner (`zig test`, `zig build test`) with no dependencies; a small file compiles and runs in seconds.",
    "footgun": "Test blocks are only compiled by `zig test`; normal builds ignore them in every mode, so tests can live right next to the code they test."
  },
  "optimization_modes": {
    "mentalModel": "In Node.js, optimization is handled at runtime by V8's Turbofan JIT compiler. Zig gives you four explicit build modes. For production servers, `ReleaseSafe` gives high speed while retaining panic bounds checks.",
    "footgun": "Use `zig build -Doptimize=ReleaseFast` when raw throughput is paramount."
  },
  "http_server_fundamentals": {
    "mentalModel": "Express adds middleware layers, object creation, and GC pressure to every request. Zig's `std.http.Server` parses the request head into slices of a read buffer you provide, with no heap allocation for parsing.",
    "footgun": "Libraries like `httpz` and `zap` add routing, worker thread pools, and middleware on top of raw sockets."
  },
  "json_parsing_comptime": {
    "mentalModel": "In Node.js, `JSON.parse()` returns untyped objects that need runtime validators like `zod`. Zig's `std.json.parseFromSlice` parses into your struct type, checking it while parsing and returning errors like `error.MissingField`.",
    "footgun": "Excess fields can be ignored or flagged as errors depending on your parser options."
  },
  "database_sqlite": {
    "mentalModel": "In Node.js, using `better-sqlite3` requires compiling native C++ code via `node-gyp`. With Zig, you can simply drop `sqlite3.c` into your project source and compile it directly alongside your Zig code in a single command.",
    "footgun": "This produces a single self-contained executable with embedded database capabilities."
  },
  "graceful_shutdown": {
    "mentalModel": "In Node.js, `process.on('SIGTERM')` runs your JS handler via libuv, but `process.exit()` can drop unflushed writes. Zig exposes raw `std.posix.sigaction`, so handlers should only set a flag. No process can catch `SIGKILL`.",
    "footgun": "Combine signal handlers with an atomic flag `is_shutting_down` to exit worker loops gracefully."
  },
  "docker_scratch_containers": {
    "mentalModel": "Node.js containers require Linux userland, Python/build tools for npm packages, V8, and hundreds of files in `node_modules`. A statically-linked Zig binary requires literally NOTHING: it runs inside Docker's empty `scratch` image.",
    "footgun": "Scratch images drop the OS userland, so scanners find little to flag, but they also can't see libraries compiled into your binary. Add CA certs if you make TLS calls."
  },
  "ci_cd_github_actions": {
    "mentalModel": "Zig's fast compilation and lack of `node_modules` makes CI/CD pipelines run in seconds rather than minutes.",
    "footgun": "Cache `~/.cache/zig` (Zig's global cache on Linux and macOS) in GitHub Actions so compiler_rt, libc, and unchanged artifacts are not rebuilt."
  },
  "observability_metrics": {
    "mentalModel": "Observability in Node.js often requires heavy APM agents (`dd-trace`, `newrelic`) that hook into async resources. In Zig, atomic counters track metrics with a few nanoseconds of overhead when uncontended; many cores hammering one counter cost more.",
    "footgun": "Expose standard text-based Prometheus metrics with simple `std.fmt` format strings."
  },
  "two_sum": {
    "mentalModel": "A JS `Map` stores tagged JS values and may hold heap objects as keys. Zig's `AutoHashMap(i32, usize)` stores raw `i32` keys and `usize` values unboxed in one allocation from the allocator you pass.",
    "footgun": "Always pass an allocator to algorithms that require dynamic lookup tables."
  },
  "valid_parentheses": {
    "mentalModel": "Solving this in Node.js typically pushes one-character strings onto a growable array. In Zig, a fixed 256-byte stack buffer holds the open brackets, so there is no heap allocation (input nested deeper than 256 is rejected).",
    "footgun": "A `switch` on `u8` values compares raw bytes; the compiler picks a jump table or a chain of comparisons, and either way no per-character string is created."
  },
  "reverse_linked_list": {
    "mentalModel": "Linked lists in JS allocate separate GC objects for every node. In Zig, nodes are structs linked via optional pointers `?*Node` without any garbage collection overhead.",
    "footgun": "Notice how `while (current) |curr|` unwraps the optional pointer cleanly without manual null checks."
  },
  "binary_search": {
    "mentalModel": "In JS, `(left + right) / 2` gives a float needing `Math.floor()`. In Zig, `/` on unsigned ints like `usize` truncates (signed ints need `@divTrunc`/`@divFloor`), and `left + (right - left) / 2` avoids overflow.",
    "footgun": "Returning an optional `?usize` is idiomatic Zig for functions that might fail to find an element."
  },
  "simd_vectorization": {
    "mentalModel": "JavaScript engines cannot guarantee that loops will be vectorized by JIT compilers. Zig's `@Vector(len, T)` types lower to SIMD instructions (SSE/AVX, ARM NEON) when the target CPU supports them, and to scalar code otherwise.",
    "footgun": "Use SIMD vectors for audio processing, image filters, cryptography, and game mathematics."
  },
  "custom_allocator_implementation": {
    "mentalModel": "In Go or Node.js, the runtime owns the allocator. In Zig, any data structure can implement `std.mem.Allocator`'s vtable: `alloc`, `resize`, `free` in 0.13, plus `remap` from 0.14.",
    "footgun": "This lets you build bump allocators, slab allocators, or memory-mapped pools tailored to your specific application workload."
  },
  "zero_cost_abstractions": {
    "mentalModel": "In Node.js, V8 JIT inlines functions dynamically, but can de-optimize when hidden classes change. In Zig, `inline fn` guarantees inlining at compile time, eliminating function call overhead entirely.",
    "footgun": "Combine with `zig build-exe -femit-asm` to inspect the generated machine instructions directly."
  },
  "production_debugging_gdb_lldb": {
    "mentalModel": "Debugging native binaries uses LLDB or GDB instead of browser devtools. Zig emits DWARF debug info by default in Debug, ReleaseSafe, and ReleaseFast (ReleaseSmall strips it); in optimized modes some variables show as optimized out.",
    "footgun": "You can step through Zig source code line-by-line right inside VSCode or terminal LLDB."
  },
  "bun_and_tigerbeetle_case_studies": {
    "mentalModel": "Bun (the JS runtime) is written largely in Zig alongside C++ bindings to WebKit's JavaScriptCore; Zig's C interop and lack of hidden control flow fit that design.",
    "footgun": "TigerBeetle uses Zig to guarantee deterministic simulation testing and zero runtime allocations after startup."
  },
  "senior_interview_questions": {
    "mentalModel": "Interviewing for systems engineering roles requires knowing how memory is physically structured in cache lines, why GC pauses occur, and how to write deterministic software.",
    "footgun": "Study the mental models in this guide to explain the exact mechanical sympathy between code and hardware."
  },
  "zen_of_zig": {
    "mentalModel": "Zig has NO operator overloading, NO hidden control flow (a function call looks like `f()`, never an overloaded operator), and NO hidden memory allocation. What you see is what executes.",
    "footgun": "This makes Zig code trivial to audit for security, performance, and correctness."
  }
};
