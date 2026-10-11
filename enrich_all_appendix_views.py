import os

views_dir = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/views"

# 1. InterviewsView.html
interviews_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 11 • Senior Interview Q&A</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Senior Systems Interview Q&A for Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">High-frequency architectural questions asked in senior systems and performance engineering interviews.</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 1.75rem;">
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 1.2rem;">Q1: Why does Zig pass an explicit Allocator to functions rather than using a global malloc?</h3>
      <p style="color: #475569; line-height: 1.6;"><strong>Answer:</strong> Passing allocators explicitly eliminates hidden control flow and hidden side effects. It allows callers to determine memory lifecycles based on usage patterns: an HTTP request handler can pass a fast <code>ArenaAllocator</code> that deallocates all allocations at once upon request completion, while a unit test passes <code>std.testing.allocator</code> to detect leaks. Functions that take no allocator are mathematically guaranteed never to allocate heap memory.</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 1.2rem;">Q2: How does `comptime` achieve generics without C++ template bloat or runtime type erasure?</h3>
      <p style="color: #475569; line-height: 1.6;"><strong>Answer:</strong> In Zig, types are first-class values at compile time. A generic struct is simply a regular function that accepts a <code>comptime T: type</code> parameter and returns a <code>type</code>. The compiler executes normal Zig code during compile time to construct the struct layout. There is no special template metaprogramming language to learn, compile times remain rapid, and the resulting machine code has zero runtime reflection overhead.</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 1.2rem;">Q3: How are optional pointers `?*T` represented in memory under the hood?</h3>
      <p style="color: #475569; line-height: 1.6;"><strong>Answer:</strong> Zig optimizes optional pointers with zero space overhead using pointer tagging. Because a valid pointer in modern operating systems cannot be null (address <code>0</code>), Zig represents <code>null</code> as the null pointer value <code>0x0</code>. Therefore, <code>?*T</code> occupies exactly 8 bytes on a 64-bit architecture (the same as a raw pointer), avoiding any extra boolean discriminant flag.</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 1.2rem;">Q4: What is the mechanical difference between an Array `[N]T` and a Slice `[]T`?</h3>
      <p style="color: #475569; line-height: 1.6;"><strong>Answer:</strong> An array <code>[N]T</code> has a fixed length known at compile time, and its values reside directly in place (e.g. on the stack or inline in a struct). A slice <code>[]T</code> is a 16-byte fat pointer consisting of a pointer to the first element (<code>[*]T</code>) and a runtime length (<code>usize</code>). Slices do not own memory; they represent a view over contiguous elements with runtime bounds checking in Debug and ReleaseSafe modes.</p>
    </div>
  </div>
</div>"""

# 2. LeetcodeView.html
leetcode_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 07 • Classic Algorithms</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">LeetCode in Idiomatic Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Classic algorithmic patterns solved with zero-allocation stack buffers and cache-friendly data structures.</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 2rem;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #0f172a; margin-top: 0;">1. Two Sum — O(N) Hash Table Lookup</h3>
      <p style="color: #64748b; font-size: 0.95rem;">Node.js uses <code>new Map()</code> which allocates individual bucket nodes on the V8 heap. Zig's <code>AutoHashMap</code> uses a flat Robin Hood / Swiss-table layout with contiguous memory.</p>
      <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>const std = @import("std");

fn twoSum(allocator: std.mem.Allocator, nums: []const i32, target: i32) !?[2]usize {
    var map = std.AutoHashMap(i32, usize).init(allocator);
    defer map.deinit();

    for (nums, 0..) |num, idx| {
        const complement = target - num;
        if (map.get(complement)) |prev_idx| {
            return [2]usize{ prev_idx, idx };
        }
        try map.put(num, idx);
    }
    return null;
}</code></pre>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #0f172a; margin-top: 0;">2. Valid Parentheses — Zero-Allocation Fixed Stack</h3>
      <p style="color: #64748b; font-size: 0.95rem;">Rather than allocating dynamic arrays, Zig solves parsing problems with a pre-sized stack buffer and single-pass byte matching.</p>
      <pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: 8px; overflow-x: auto;"><code>fn isValid(s: []const u8) bool {
    var stack: [256]u8 = undefined;
    var top: usize = 0;

    for (s) |char| {
        switch (char) {
            '(', '{', '[' => {
                if (top >= stack.len) return false;
                stack[top] = char;
                top += 1;
            },
            ')' => { if (top == 0 or stack[top - 1] != '(') return false; top -= 1; },
            '}' => { if (top == 0 or stack[top - 1] != '{') return false; top -= 1; },
            ']' => { if (top == 0 or stack[top - 1] != '[') return false; top -= 1; },
            else => {},
        }
    }
    return top == 0;
}</code></pre>
    </div>
  </div>
</div>"""

# 3. PhilosophyView.html
philosophy_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 08 • Philosophy & Principles</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">The Zen of Zig</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Created by Andrew Kelley, Zig is engineered around mechanical sympathy, predictability, and readability.</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
    <h3 style="color: #0f172a; margin-top: 0;">What Zig Deliberately Left Out (and WHY)</h3>
    <ul style="color: #475569; line-height: 1.7; padding-left: 1.25rem;">
      <li><strong>NO Operator Overloading:</strong> In C++ or Python, <code>a + b</code> might invoke an arbitrary 500-line method or network call. In Zig, <code>+</code> is always simple hardware integer or float addition.</li>
      <li><strong>NO Hidden Control Flow:</strong> There are no exceptions, no <code>setjmp/longjmp</code>, and no hidden property getters. A function call looks like <code>f()</code>, and an error return looks like <code>try</code> or <code>catch</code>.</li>
      <li><strong>NO Hidden Memory Allocation:</strong> If a function does not take an allocator parameter, it cannot allocate heap memory. Period.</li>
      <li><strong>NO Preprocessor Macros:</strong> C preprocessor macros make code difficult to debug. Zig replaces all macro use cases with type-safe <code>comptime</code>.</li>
    </ul>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a;">The 18 Tenets of `zig zen`</h2>
  <div style="background: #0f172a; color: #f8fafc; padding: 1.5rem; border-radius: 12px; font-family: var(--font-mono, monospace); line-height: 1.8;">
    1. Communicate intent precisely.<br/>
    2. Edge cases matter.<br/>
    3. Favor reading code over writing code.<br/>
    4. Only one obvious way to do things.<br/>
    5. Runtime crashes are better than runtime bugs.<br/>
    6. Compile errors are better than runtime crashes.<br/>
    7. Incremental improvement.<br/>
    8. Avoid local maximums.<br/>
    9. Reduce the amount one must remember.<br/>
    10. Focus on code rather than style.<br/>
    11. Resource allocation may fail; resource deallocation must succeed.<br/>
    12. Memory is a resource.<br/>
    13. Together we serve the users.
  </div>
</div>"""

# 4. PitfallsView.html
pitfalls_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fee2e2; color: #b91c1c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 09 • Guardrails</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Top 8 Known Pitfalls & Footguns</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Where JavaScript and Node.js intuition leads to bugs in systems programming.</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    <div style="background: #ffffff; border-left: 4px solid #ef4444; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #991b1b; margin-top: 0;">1. Returning a Slice of a Local Stack Array</h3>
      <p style="color: #475569;">In Node.js, returning an array from a function safely retains it in heap memory via garbage collection. In Zig, returning <code>&stack_buf</code> results in a dangling pointer once the stack frame unwinds. Always allocate slices from a caller-passed allocator when returning dynamically sized data.</p>
    </div>

    <div style="background: #ffffff; border-left: 4px solid #ef4444; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #991b1b; margin-top: 0;">2. Reading `undefined` Memory</h3>
      <p style="color: #475569;">In JS, <code>undefined</code> is a concrete value of type undefined. In Zig, <code>var x: i32 = undefined;</code> means the variable contains whatever garbage bytes were previously at that memory location. Reading it before writing is illegal and triggers panics in Debug mode.</p>
    </div>

    <div style="background: #ffffff; border-left: 4px solid #ef4444; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #991b1b; margin-top: 0;">3. Forgetting `defer allocator.free(slice)`</h3>
      <p style="color: #475569;">Because there is no garbage collector, every heap allocation through an allocator that is not an Arena will leak if not paired with a corresponding <code>free</code> or <code>deinit</code>. Use <code>std.testing.allocator</code> to automatically detect memory leaks during testing.</p>
    </div>

    <div style="background: #ffffff; border-left: 4px solid #ef4444; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <h3 style="color: #991b1b; margin-top: 0;">4. Modifying Function Parameters Directly</h3>
      <p style="color: #475569;">All function parameters in Zig are strictly immutable <code>const</code> values. Writing <code>param = new_value;</code> fails at compile time. Make an explicit local copy <code>var local = param;</code> or pass a mutable pointer <code>*T</code>.</p>
    </div>
  </div>
</div>"""

# 5. TroubleshootingView.html
troubleshooting_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 10 • Diagnostics & Debugging</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">Diagnostics & Debugging Playbook</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Diagnose compile-time errors, inspect memory leaks, and debug native binaries with LLDB.</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 2rem;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #0f172a; margin-top: 0;">1. Detecting Memory Leaks with GPA</h3>
      <p style="color: #475569;">In Debug and Test modes, <code>GeneralPurposeAllocator</code> outputs stack traces for any allocation that was not freed prior to program exit.</p>
      <pre style="background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px;"><code>var gpa = std.heap.GeneralPurposeAllocator(.{}){};
defer {
    const check = gpa.deinit();
    if (check == .leak) @panic("Memory leak detected!");
}</code></pre>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
      <h3 style="color: #0f172a; margin-top: 0;">2. Native Breakpoints with LLDB / GDB</h3>
      <p style="color: #475569;">Zig binaries compile with rich DWARF debug information by default in Debug mode. Step through your code directly in terminal:</p>
      <pre style="background: #1e293b; color: #38bdf8; padding: 1rem; border-radius: 8px;"><code># Build with debug symbols
zig build

# Launch debugger
lldb ./zig-out/bin/my_app
(lldb) breakpoint set --file main.zig --line 25
(lldb) run
(lldb) frame variable</code></pre>
    </div>
  </div>
</div>"""

# 6. CheatsheetView.html
cheatsheet_html = """<div class="appendix-container" style="max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1e293b; font-family: var(--font-ui, sans-serif);">
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <span style="background: #fef3c7; color: #b45309; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">Appendix 12 • Quick Reference</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a;">JavaScript to Zig Rosetta Stone Cheatsheet</h1>
    <p style="font-size: 1.1rem; color: #64748b; max-width: 650px; margin: 0 auto;">Direct mapping between familiar JavaScript / TypeScript patterns and their idiomatic Zig equivalents.</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1px solid #e2e8f0;">
    <thead>
      <tr style="background: #f1f5f9; text-align: left;">
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">JavaScript / TypeScript</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Zig Equivalent</th>
        <th style="padding: 0.75rem; border: 1px solid #e2e8f0;">Key Difference</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>const x = 10;</code> / <code>let y = 20;</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>const x: i32 = 10;</code> / <code>var y: i32 = 20;</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Explicit integer bit widths (<code>u8</code>, <code>i32</code>, <code>usize</code>).</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>throw new Error("msg")</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>return error.InvalidInput;</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Errors are typed enum values, not exceptions.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>try { ... } catch (e) { ... }</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>val catch |err| fallback;</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Inline fallback expression without stack disruption.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>val ?? defaultValue</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>maybe_val orelse defaultValue</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Unwraps optional <code>?T</code> safely.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>new Map()</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>std.StringHashMap(V).init(allocator)</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Explicit allocator, continuous cache locality.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>list.push(item)</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>try array_list.append(item);</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">May return <code>error.OutOfMemory</code>.</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>finally { cleanup(); }</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><code>defer cleanup();</code></td>
        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Declared directly next to resource acquisition.</td>
      </tr>
    </tbody>
  </table>
</div>"""

files_to_write = {
    "InterviewsView.html": interviews_html,
    "LeetcodeView.html": leetcode_html,
    "PhilosophyView.html": philosophy_html,
    "PitfallsView.html": pitfalls_html,
    "TroubleshootingView.html": troubleshooting_html,
    "CheatsheetView.html": cheatsheet_html,
}

for fname, content in files_to_write.items():
    with open(os.path.join(views_dir, fname), "w") as f:
        f.write(content)
    print(f"Enriched {fname}!")

print("All 6 stub views enriched successfully!")
