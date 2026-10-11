# 🦎 Zig for Node.js Developers Masterclass Studio

> An interactive, visual learning platform and live playground tailored specifically for JavaScript and TypeScript engineers making the leap to Zig. Powered by **Astro 5** & TypeScript.

[![Zig Version](https://img.shields.io/badge/Zig-0.13+-f7a41d?style=flat&logo=zig)](https://ziglang.org)
[![Astro Version](https://img.shields.io/badge/Astro-5.0+-FF5D01?style=flat&logo=astro)](https://astro.build)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat&logo=vercel)](https://zig-for-node-devs.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Interactive Studio

> **Try it live in your browser right now:**  
> 👉 [**https://zig-for-node-devs.vercel.app**](https://zig-for-node-devs.vercel.app)

---

## 🌟 Overview

Transitioning from dynamic, garbage-collected, single-threaded V8 JavaScript to manual memory management, statically typed, bare-metal Zig can feel intimidating. **Zig for Node.js Developers Studio** bridges that gap by directly mapping every systems concept to its Node.js equivalent — with side-by-side code comparisons, architectural diagrams, interview questions, known footguns, production Docker recipes, LeetCode solutions, and an interactive in-browser compiler.

Built with **Astro 5** for lightning-fast zero-JS static generation, modular components, and seamless developer ergonomics.

---

## 🚀 Key Features

- **💻 Interactive 3-Column Studio:**
  - **Column 1:** Chapter Navigation across 56 interactive lessons with live instant search (`⌘+K`).
  - **Column 2:** Lesson Briefing with explicit Node.js vs Zig comparisons, "The Zig Mental Model", and pro-tips/footguns.
  - **Column 3:** Live CodeMirror Zig Editor connected to the Compiler Explorer (Godbolt) compilation API with a real-time output terminal (`⌘+⏎`).
- **⚡ Comptime Metaprogramming:** Deep breakdown of why Zig eliminates C preprocessor macros, C++ templates, and JavaScript runtime reflection in favor of ordinary Zig code executed at compile time.
- **🧠 The Allocator Philosophy:** Full breakdown of why Zig has no hidden heap allocations, exploring `GeneralPurposeAllocator`, `ArenaAllocator`, and `FixedBufferAllocator` to eliminate GC pauses.
- **🔌 Zero-Overhead C & Node-API Interop:** Use Zig as a drop-in C compiler with `@cImport`, and compile high-speed native Node.js addons (`.node` / `.dylib`) in seconds without `node-gyp`.
- **📦 `build.zig` vs `package.json`:** Type-safe build graphs in pure Zig, `build.zig.zon` with cryptographic SHA-256 package verification, and why Zig has no 500MB `node_modules`.
- **📂 Real-World Microservice Architecture:** Express.js re-architected in native Zig with sub-millisecond latencies, embedded SQLite, and structured telemetry.
- **🐳 Production Docker Recipes:** Ready-to-deploy multi-stage Dockerfiles producing ultra-minimal (< 5MB) static binaries in Docker `scratch` containers with zero CVE vulnerabilities.
- **🧪 Built-In Testing & Memory Leak Verification:** Write tests directly in source files with `test "..."` and leverage `std.testing.allocator` to catch memory leaks in CI/CD.
- **🎯 Senior Systems Interview Q&A:** High-frequency interview questions covering memory layout, undefined memory safety, comptime execution limits, and C ABI compatibility.
- **🧘 The Zen of Zig:** The 18 guiding principles of Zig, and why Zig deliberately left out operator overloading and hidden control flow.
- **📖 Rosetta Stone Cheatsheet:** Quick lookup table mapping JavaScript/TypeScript constructs directly to idiomatic Zig.

---

## 📂 Curriculum Roadmap (56 Lessons)

1. **Part 1: The Core Mental Model & Syntax Jump** (Chapters 01–06)
2. **Part 2: Robust Error Handling Without Exceptions** (Chapters 07–10)
3. **Part 3: Optionals, Pointers & Memory Safety** (Chapters 11–14)
4. **Part 4: Explicit Memory Management & Allocators** (Chapters 15–18)
5. **Part 5: Comptime — The Superpower of Zig** (Chapters 19–22)
6. **Part 6: Standard Library & Essential Collections** (Chapters 23–26)
7. **Part 7: Concurrency & Async in Zig** (Chapters 27–30)
8. **Part 8: Interoperability with C & Node.js Native Addons** (Chapters 31–34)
9. **Part 9: Testing, Tooling & The Build System** (Chapters 35–38)
10. **Part 10: Building Real-World Systems & Microservices** (Chapters 39–42)
11. **Part 11: Production Deployment & Docker** (Chapters 43–45)
12. **Part 12: Rosetta Stone & Classic Algorithms** (Chapters 46–49)
13. **Part 13: Advanced Systems & Production Mastery** (Chapters 50–56)

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/nadimtuhin/zig-for-node-devs.git
cd zig-for-node-devs

# Install dependencies
pnpm install

# Start local development server
pnpm dev
# Open http://localhost:4321

# Build for production
pnpm build
```

---

## 📜 License

MIT © [Nadim Tuhin](https://github.com/nadimtuhin)
