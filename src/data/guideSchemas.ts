import type { ArticleMeta, FaqEntry } from '../lib/structuredData';

export interface GuideSchema {
  description: string;
  article: ArticleMeta;
  faq: FaqEntry[];
}

const PUBLISHED = '2026-10-11';

export const guideSchemas = {
  roadmap: {
    description: 'Step-by-step Zig roadmap for JavaScript and Node.js developers: syntax, errors as values, allocators, comptime, C interop, and production deployment.',
    article: { datePublished: PUBLISHED, keywords: ['Zig roadmap', 'learn Zig', 'Zig for Node.js developers', 'Zig learning path'] },
    faq: [
      { question: 'What order should a Node.js developer learn Zig in?', answer: 'Start with syntax and slices, then errors as values, optionals and pointers, then allocators. Move on to comptime, C interop and build.zig, and finish with HTTP services, Docker images and systems interview prep.' },
      { question: 'How long does it take a JavaScript developer to become productive in Zig?', answer: 'Most of the syntax maps in a few days. The real shift is owning memory: passing allocators explicitly, freeing with defer, and reasoning about slice lifetimes. Expect a few weeks of practice before that feels natural.' },
    ],
  },
  memory: {
    description: 'Manual memory management in Zig for JavaScript developers: std.mem.Allocator, DebugAllocator, ArenaAllocator, and leak-free code without a GC.',
    article: { datePublished: PUBLISHED, keywords: ['Zig allocator', 'manual memory management', 'ArenaAllocator', 'DebugAllocator', 'Zig vs garbage collection'] },
    faq: [
      { question: 'How does Zig manage memory without a garbage collector?', answer: 'Every function that allocates takes a std.mem.Allocator parameter, and the caller frees the memory, usually with defer. Nothing allocates behind your back, so memory cost is visible in every function signature.' },
      { question: 'Which Zig allocator should I use for an HTTP request?', answer: 'Use an ArenaAllocator per request. Allocate freely while handling it, then free everything in one call when the response is sent. Use DebugAllocator (formerly GeneralPurposeAllocator) in debug builds to catch leaks and double frees.' },
    ],
  },
  comptime: {
    description: 'Zig comptime explained for TypeScript developers: compile-time execution, generics as functions returning types, @typeInfo reflection, zero-cost abstractions.',
    article: { datePublished: PUBLISHED, keywords: ['Zig comptime', 'Zig generics', 'compile-time metaprogramming', '@typeInfo', 'TypeScript vs Zig generics'] },
    faq: [
      { question: 'What is comptime in Zig?', answer: 'comptime marks code that runs inside the compiler. Ordinary Zig functions can execute at build time, compute constants, inspect types and generate new types, with no separate macro or template language.' },
      { question: 'How do Zig generics compare to TypeScript generics?', answer: 'TypeScript generics are erased at runtime and only exist for the type checker. In Zig a generic is a function that takes a type as a comptime parameter, often returning a new type, so each instantiation is specialised machine code.' },
    ],
  },
  buildSystem: {
    description: 'build.zig and build.zig.zon explained for npm users: build steps, content-addressed dependencies, cross-compilation targets, and why Zig needs no node_modules.',
    article: { datePublished: PUBLISHED, keywords: ['build.zig', 'build.zig.zon', 'Zig package manager', 'Zig vs npm', 'Zig cross-compilation'] },
    faq: [
      { question: 'What is the Zig equivalent of package.json?', answer: 'build.zig.zon lists the package name, version and dependencies, each pinned by URL and content hash. build.zig is Zig code that defines build steps, roughly what npm scripts and a bundler config do together.' },
      { question: 'Does Zig have a node_modules folder?', answer: 'No. Dependencies are fetched once into a global cache keyed by content hash and shared across projects. The hash in build.zig.zon guarantees every machine builds against identical source.' },
    ],
  },
  cInterop: {
    description: 'Use Zig as a C compiler and import C headers with @cImport. Build native Node-API addons and Bun FFI libraries without node-gyp or Python toolchains.',
    article: { datePublished: PUBLISHED, keywords: ['Zig C interop', '@cImport', 'Node-API addon', 'node-gyp alternative', 'Bun FFI Zig'] },
    faq: [
      { question: 'Can Zig replace node-gyp for native Node.js addons?', answer: 'Yes. Zig ships its own C compiler and libc headers, so you can import node_api.h (from the node-api-headers package or your Node.js include path) with @cImport, export functions with the C ABI and build a .node shared library for any target without Python or a system toolchain.' },
      { question: 'How do I call a C library from Zig?', answer: 'Wrap the header in @cImport(@cInclude("header.h")) and call the functions directly. Zig translates the C declarations into Zig types at compile time, so there is no binding layer to write.' },
    ],
  },
  docker: {
    description: 'Ship Zig services in under 5MB Docker images: multi-stage builds, static musl binaries on scratch, and zero-CVE containers compared with typical Node.js images.',
    article: { datePublished: PUBLISHED, keywords: ['Zig Docker', 'scratch image', 'static binary', 'musl', 'small Docker images'] },
    faq: [
      { question: 'Why are Zig Docker images so much smaller than Node.js images?', answer: 'Zig compiles to a single static binary with no runtime, so the final stage can be FROM scratch with just that file. A Node.js image has to carry the V8 runtime, npm packages and usually a full OS base layer.' },
      { question: 'How do I build a static Zig binary for a scratch container?', answer: 'Target musl, for example zig build -Dtarget=x86_64-linux-musl -Doptimize=ReleaseSmall, in a builder stage, then copy the binary into a FROM scratch stage. The result has no shell, no libc dependency and no OS packages to patch.' },
    ],
  },
  microservice: {
    description: 'Production Zig HTTP microservice blueprint for Express.js developers: routing, connection pools, per-request arenas, graceful shutdown, and fast APIs.',
    article: { datePublished: PUBLISHED, keywords: ['Zig HTTP server', 'Zig microservice', 'Express.js vs Zig', 'httpz', 'Zig web framework'] },
    faq: [
      { question: 'What is the Zig equivalent of Express.js?', answer: 'There is no single standard framework. std.http covers the basics, and community libraries such as httpz and zap add routing and middleware with an API that will feel familiar to Express users.' },
      { question: 'How do Zig servers handle memory per request?', answer: 'A common pattern is one ArenaAllocator per request. Handlers allocate from the arena and the whole arena is freed when the response is written, so no per-object frees and no GC pauses.' },
    ],
  },
  philosophy: {
    description: 'The philosophy of Zig for JavaScript developers: zig zen principles, no hidden control flow, no operator overloading, and why explicit code stays maintainable.',
    article: { datePublished: PUBLISHED, keywords: ['Zig philosophy', 'zig zen', 'no hidden control flow', 'Zig design principles'] },
    faq: [
      { question: 'Why does Zig have no operator overloading?', answer: 'Zig forbids hidden control flow. If a + b could call a function, reading the code would not tell you whether it allocates, fails or runs slow. In Zig, a function call always looks like a function call.' },
      { question: 'What does "no hidden control flow" mean in Zig?', answer: 'There are no exceptions, getters, destructors or implicit allocations. Every jump, error and allocation is visible in the source through explicit keywords such as try, defer and allocator parameters.' },
    ],
  },
  pitfalls: {
    description: 'The top 8 Zig pitfalls for JavaScript developers: dangling slices to stack memory, reading undefined memory, missing defer frees, and discarded error unions.',
    article: { datePublished: PUBLISHED, keywords: ['Zig pitfalls', 'Zig footguns', 'dangling pointer', 'undefined memory', 'Zig common mistakes'] },
    faq: [
      { question: 'Why does returning a slice of a local array break in Zig?', answer: 'A local array lives on the stack frame of the function. Once the function returns, that frame is reused, so the slice points at garbage. Allocate the buffer with an allocator or have the caller pass one in.' },
      { question: 'Is it safe to read a variable initialised with undefined in Zig?', answer: 'No. undefined means the memory has no meaningful value yet. Debug builds fill it with 0xaa bytes to make bugs obvious, but reading it before assignment is always a bug.' },
    ],
  },
  troubleshooting: {
    description: 'Debug Zig like a systems engineer: find memory leaks with DebugAllocator, set LLDB and GDB breakpoints, read stack traces, and analyse core dumps.',
    article: { datePublished: PUBLISHED, keywords: ['Zig debugging', 'Zig memory leak', 'LLDB Zig', 'GDB Zig', 'Zig stack trace'] },
    faq: [
      { question: 'How do I find memory leaks in Zig?', answer: 'Use std.heap.DebugAllocator (named GeneralPurposeAllocator before Zig 0.14) and check the result of deinit() at the end of main. In debug builds it reports every leaked allocation along with the stack trace of where it was made.' },
      { question: 'Can I debug Zig with LLDB or GDB?', answer: 'Yes. Debug builds emit standard DWARF symbols, so LLDB and GDB can set breakpoints by file and line, step through code and inspect variables just like with C.' },
    ],
  },
  interviews: {
    description: 'Senior Zig and systems interview questions with answers: explicit allocators, comptime generics, optional pointer layout, and arrays vs slices in memory.',
    article: { datePublished: PUBLISHED, keywords: ['Zig interview questions', 'systems programming interview', 'Zig allocator', 'Zig comptime'] },
    faq: [
      { question: 'Why does Zig pass an explicit Allocator instead of using a global malloc?', answer: 'Explicit allocators make allocation visible in function signatures, let callers choose a strategy such as an arena or a fixed buffer, and make leaks testable with a checking allocator.' },
      { question: 'How is an optional pointer ?*T represented in memory?', answer: 'Ordinary Zig pointers can never be zero (only allowzero pointers can), so ?*T uses address zero to mean null. An optional pointer is the same size as a plain pointer, with no extra tag byte.' },
    ],
  },
  cheatsheet: {
    description: 'JavaScript to Zig cheatsheet: side-by-side syntax for variables, arrays, maps, strings, error handling, and memory allocation for Node.js developers.',
    article: { datePublished: PUBLISHED, keywords: ['Zig cheatsheet', 'JavaScript to Zig', 'TypeScript vs Zig syntax', 'Zig Rosetta Stone'] },
    faq: [
      { question: 'What is the Zig equivalent of a JavaScript Map?', answer: 'std.StringHashMap or std.AutoHashMap. Both take an allocator at init and must be released with deinit(), usually deferred right after creation.' },
      { question: 'How does try/catch in JavaScript map to Zig?', answer: 'Zig functions return error unions such as !T. try propagates an error to the caller, catch handles it inline, and errdefer runs cleanup only when an error leaves the scope.' },
    ],
  },
  leetcode: {
    description: 'Classic LeetCode problems solved in idiomatic Zig: Two Sum, Valid Parentheses, Reverse Linked List, Binary Search, and Kadane with zero-allocation patterns.',
    article: { datePublished: PUBLISHED, keywords: ['LeetCode Zig', 'Zig algorithms', 'Two Sum Zig', 'Zig data structures'] },
    faq: [
      { question: 'Is Zig a good language for LeetCode practice?', answer: 'It is a good way to learn memory layout, since every hash map and stack needs an explicit allocator. Fewer judges support Zig, so many people practise locally with zig test.' },
      { question: 'How do I solve Two Sum in Zig?', answer: 'Use std.AutoHashMap(i32, usize) to map each value to its index. For every number, look up target minus the number, and return both indices on a hit. That is O(N) time and the map is freed with deinit().' },
    ],
  },
} satisfies Record<string, GuideSchema>;
