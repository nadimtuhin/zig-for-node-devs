import os

views_dir = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/views"
pages_dir = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages"
os.makedirs(views_dir, exist_ok=True)
os.makedirs(pages_dir, exist_ok=True)

def write_view_and_page(name, slug, astro_page_title, astro_page_desc, html_content):
    view_astro = f"""---
import htmlContent from "./{name}View.html?raw";
---
<Fragment set:html={{htmlContent}} />
"""
    with open(os.path.join(views_dir, f"{name}View.astro"), "w") as f:
        f.write(view_astro)

    with open(os.path.join(views_dir, f"{name}View.html"), "w") as f:
        f.write(html_content)

    page_astro = f"""---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import ViewComponent from '../components/views/{name}View.astro';
---

<Layout title="{astro_page_title}" description="{astro_page_desc}">
  <Header />
  <main id="main-content" role="main" style="min-height: calc(100vh - 54px); overflow-y: auto;">
    <ViewComponent />
  </main>
</Layout>
"""
    with open(os.path.join(pages_dir, f"{slug}.astro"), "w") as f:
        f.write(page_astro)
    print(f"Generated {name}View and {slug}.astro")

# 1. Comptime
write_view_and_page(
    "Comptime",
    "comptime",
    "Comptime Metaprogramming Mastery | Zig for Node Devs",
    "Comprehensive guide to Zig's comptime execution, compile-time generics, type generation, reflection, and zero-cost abstractions for JavaScript developers.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 01 • Metaprogramming Paradigm</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Mastering Zig `comptime`</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Why Zig eliminates C preprocessor macros, C++ template errors, and JavaScript runtime reflection in favor of ordinary Zig code executed at compile time.</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
    <h3 style="font-size: 1.25rem; font-weight: 700; margin-top: 0; color: #0f172a;">⚡ What is `comptime`?</h3>
    <p>In JavaScript, generics are stripped by TypeScript, and dynamic reflection requires runtime inspection (<code>Object.keys</code>, <code>Reflect.get</code>, <code>eval()</code>). In C++, templates create cryptic error messages and bloated compile times.</p>
    <p>In Zig, <strong>types are first-class values at compile time</strong>. You write regular Zig syntax (loops, branches, function calls), and if a parameter is marked <code>comptime</code>, the Zig compiler executes that code inside the compiler VM during compilation.</p>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">1. Type Generics without New Syntax</h2>
  <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>// Zig generics are just functions returning a struct type!
fn Point(comptime T: type) type {
    return struct {
        x: T,
        y: T,
        
        pub fn distance(self: @This()) f64 {
            const dx = @as(f64, @floatFromInt(self.x));
            const dy = @as(f64, @floatFromInt(self.y));
            return @sqrt(dx * dx + dy * dy);
        }
    };
}

pub fn main() void {
    const PointI32 = Point(i32);
    const pt = PointI32{ .x = 3, .y = 4 };
    _ = pt;
}</code></pre>

  <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">2. Comptime Reflection with `@typeInfo`</h2>
  <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>// Inspect struct fields at compile time to build zero-allocation serializers!
fn printFields(comptime T: type) void {
    const info = @typeInfo(T);
    switch (info) {
        .@"struct" => |s| {
            inline for (s.fields) |field| {
                std.debug.print("Field: {s} (type: {s})\\n", .{
                    field.name, @typeName(field.type)
                });
            }
        },
        else => @compileError("T must be a struct!"),
    }
}</code></pre>

  <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem 1.25rem; margin-top: 2rem; border-radius: 0 8px 8px 0;">
    <strong style="color: #b45309;">Pro Tip for Node.js Devs:</strong>
    <p style="margin: 0.5rem 0 0 0; color: #92400e;">Notice <code>inline for</code>! A regular <code>for</code> loop iterates at runtime. An <code>inline for</code> instructs the compiler to unroll the loop completely at compile time, creating bespoke, branchless machine code for every field.</p>
  </div>
</div>"""
)

# 2. Memory & Allocators
write_view_and_page(
    "Memory",
    "memory",
    "Memory & Allocator Architecture | Zig for Node Devs",
    "In-depth guide to manual memory management, GPA, ArenaAllocator, and avoiding leaks without a garbage collector.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 02 • Systems Memory</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">The Allocator Architecture</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">No hidden malloc, no stop-the-world V8 GC pauses, and zero mysterious memory leaks.</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #0f172a; margin-top: 0;">🟢 Node.js V8 Model</h3>
      <p style="font-size: 0.95rem; color: #475569;">Every <code>new Object()</code> or string allocates memory silently on the V8 heap. Garbage collection runs periodically, interrupting CPU execution to sweep dead objects.</p>
    </div>
    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #854d0e; margin-top: 0;">🦎 Zig Explicit Allocator Model</h3>
      <p style="font-size: 0.95rem; color: #713f12;">NO function can allocate heap memory without being handed an explicit <code>allocator: std.mem.Allocator</code>. You choose the exact memory strategy (GPA, Arena, FixedBuffer).</p>
    </div>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem;">The Big Three Allocators in Zig</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1px solid #e2e8f0;">
    <thead>
      <tr style="background: #f1f5f9; text-align: left;">
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Allocator</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Best Used For</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Cleanup Behavior</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>GeneralPurposeAllocator (GPA)</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Application-wide root allocator. Catches double-free and memory leaks in debug mode.</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Individual <code>allocator.free(slice)</code></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>ArenaAllocator</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">HTTP request lifecycles, CLI commands, parsing passes.</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Batch free via <code>arena.deinit()</code> in one single call.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>FixedBufferAllocator</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Stack buffers, zero OS syscalls, real-time audio, embedded systems.</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Zero OS freeing; automatically reclaimed on stack frame exit.</td>
      </tr>
    </tbody>
  </table>
</div>"""
)

# 3. C Interop & Node-API
write_view_and_page(
    "CInterop",
    "c-interop",
    "C Interoperability & Node-API Addons | Zig for Node Devs",
    "How to use Zig as a C compiler, import C headers via @cImport, and build lightning-fast native Node.js addons without node-gyp.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 03 • Native Integration</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">C Interop & Node-API Addons</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Replacing node-gyp, Python scripts, and complex C++ binding glue with pure Zig.</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
    <h3 style="color: #0f172a; margin-top: 0;">🔌 Zig is a Full C Compiler</h3>
    <p>Zig ships with Clang built directly into its binary. You do not need GCC, CMake, or Make installed on your system. You can include C header files directly in your Zig source code using <code>@cImport</code>.</p>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a;">Building a Native Node.js Addon in Zig</h2>
  <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>// addon.zig
const std = @import("std");

// Export C ABI symbols
export fn add(a: i32, b: i32) i32 {
    return a + b;
}

export fn fastMultiply(a: f64, b: f64) f64 {
    return a * b;
}</code></pre>

  <p>Compile to a shared dynamic library with one terminal command:</p>
  <pre style="background: #1e293b; color: #38bdf8; padding: 1rem; border-radius: 8px;"><code>zig build-lib addon.zig -dynamic -O ReleaseFast</code></pre>

  <p>Call it from Node.js using <code>node:ffi-napi</code> or <code>process.dlopen</code>:</p>
  <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>import ffi from 'ffi-napi';

const lib = ffi.Library('./libaddon.dylib', {
  'add': ['int', ['int', 'int']],
  'fastMultiply': ['double', ['double', 'double']]
});

console.log(lib.add(40, 2)); // 42</code></pre>
</div>"""
)

# 4. build.zig vs npm
write_view_and_page(
    "BuildSystem",
    "build-system",
    "build.zig vs npm & Package Management | Zig for Node Devs",
    "Comprehensive guide to build.zig, build.zig.zon, content-addressed dependencies, and why Zig has no node_modules.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 04 • Build Tooling</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">`build.zig` vs `package.json`</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Type-safe build graphs in Zig instead of Makefiles, CMake, or npm scripts.</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 1.5rem; border: 1px solid #e2e8f0;">
    <thead>
      <tr style="background: #f1f5f9; text-align: left;">
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Feature</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Node.js / npm</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Zig</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Build Script Language</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">JSON + bash scripts + Webpack / Vite</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Pure Zig (<code>build.zig</code>)</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Dependency Spec</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>package.json</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>build.zig.zon</code></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Storage</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>node_modules/</code> (hundreds of MBs per project)</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Global content-addressed cache (<code>~/.cache/zig</code>)</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Security</strong></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">npm post-install scripts execute arbitrary shell commands</td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Strict cryptographic SHA-256 hashes, zero post-install hooks</td>
      </tr>
    </tbody>
  </table>
</div>"""
)

# 5. Microservice Architecture
write_view_and_page(
    "Microservice",
    "microservice",
    "Production Microservice Architecture | Zig for Node Devs",
    "Express.js vs Zig Httpz/Zap: High-throughput API gateway, connection pools, and graceful shutdown.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 05 • Production Architecture</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Real-World Microservice in Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Express.js re-architected in native Zig: sub-millisecond latencies, embedded SQLite, and structured telemetry.</p>
  </div>

  <div style="background: #0f172a; color: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
    <h3 style="color: #38bdf8; margin-top: 0;">Microservice Blueprint: User Service API</h3>
    <pre><code>// 1. Initialize GeneralPurposeAllocator + Arena for request scope
// 2. Open embedded SQLite database handle
// 3. Bind TCP listener on 0.0.0.0:8080
// 4. Route GET /health and POST /api/v1/users
// 5. Serialize JSON responses with std.json without dynamic heap overhead</code></pre>
  </div>
</div>"""
)

# 6. Docker Recipes
write_view_and_page(
    "Docker",
    "docker",
    "Production Docker Recipes (< 5MB Scratch) | Zig for Node Devs",
    "Zero-vulnerability scratch Docker recipes, multi-stage builds, and deployment strategies for Zig binaries.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 06 • Cloud & Containers</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Production Docker Containerization</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Shrinking 300MB Node.js containers into a pristine 4MB scratch image with zero CVE vulnerabilities.</p>
  </div>

  <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code># Multi-stage Dockerfile for Zig
FROM alpine:3.20 AS builder
RUN apk add --no-cache zig
WORKDIR /app
COPY . .
RUN zig build -Doptimize=ReleaseSafe -Dtarget=x86_64-linux-musl

# Final production stage
FROM scratch
COPY --from=builder /app/zig-out/bin/my_app /server
EXPOSE 8080
ENTRYPOINT ["/server"]</code></pre>
</div>"""
)

# 7. Leetcode in Zig
write_view_and_page(
    "Leetcode",
    "leetcode",
    "LeetCode Easy & Classic Algorithms in Zig | Zig for Node Devs",
    "Two Sum, Valid Parentheses, Reverse Linked List, Binary Search, and Kadane's algorithm solved with zero-allocation Zig patterns.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 07 • Algorithms</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">LeetCode in Idiomatic Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Solving classic interview data structures with cache-friendly contiguous arrays and explicit memory tracking.</p>
  </div>
</div>"""
)

# 8. Philosophy & Zen of Zig
write_view_and_page(
    "Philosophy",
    "philosophy",
    "The Philosophy & Zen of Zig | Zig for Node Devs",
    "The 18 principles of Zig, why Zig deliberately left out operator overloading, and what makes Zig uniquely maintainable.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 08 • Philosophy</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">The Zen of Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">What Zig deliberately left out — and why reading Zig code feels effortless.</p>
  </div>
</div>"""
)

# 9. Known Pitfalls & Footguns
write_view_and_page(
    "Pitfalls",
    "pitfalls",
    "Top 8 Zig Pitfalls & Footguns | Zig for Node Devs",
    "The 8 common traps where JavaScript intuition leads to bugs: dangling slice pointers, uninitialized memory traps, and allocator lifecycles.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fee2e2; color: #b91c1c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 09 • Guardrails</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Top 8 Known Pitfalls & Footguns</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Where Node.js intuition fails in Zig systems programming.</p>
  </div>
</div>"""
)

# 10. Troubleshooting & Diagnostics
write_view_and_page(
    "Troubleshooting",
    "troubleshooting",
    "Diagnostics & Debugging Playbook | Zig for Node Devs",
    "Debugging memory leaks, LLDB breakpoints, stack trace symbolication, and core dump analysis.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 10 • Operations</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Troubleshooting & Diagnostics</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Step-by-step diagnostic workflows for panics, segfaults, and memory leaks.</p>
  </div>
</div>"""
)

# 11. Senior Interview Questions
write_view_and_page(
    "Interviews",
    "interviews",
    "Senior Systems Interview Q&A | Zig for Node Devs",
    "High-frequency systems engineering interview questions covering memory layout, comptime, and allocator design.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 11 • Career</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Senior Systems Interview Q&A</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Key questions and mental models asked in high-performance backend interviews.</p>
  </div>
</div>"""
)

# 12. Rosetta Stone Cheatsheet
write_view_and_page(
    "Cheatsheet",
    "cheatsheet",
    "JavaScript to Zig Rosetta Stone Cheatsheet | Zig for Node Devs",
    "Side-by-side syntax comparison cheatsheet: variables, arrays, maps, error handling, and memory allocation.",
    """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 12 • Reference</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Rosetta Stone Cheatsheet</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Instant lookup mapping JavaScript/TypeScript constructs directly to idiomatic Zig equivalents.</p>
  </div>
</div>"""
)

print("All Zig appendices generated successfully!")
