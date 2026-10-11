import json

chapters_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapters.ts"
insights_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapterInsights.ts"

with open(chapters_path, "r") as f:
    raw = f.read()

prefix = "export const chaptersData: Record<string, Chapter> = "
json_str = raw[raw.find(prefix) + len(prefix):].rstrip(";\n")
chapters = json.loads(json_str)

# 1. Polish Chapter 01 type coercion wording
chapters["basic_vars"]["desc"] = "Why const by default, primitive sizing (u8, i32, usize), safe widening vs no lossy truncation, and explicit undefined."
chapters["basic_vars"]["why"] = "In JavaScript, all numbers are 64-bit IEEE-754 floats, causing precision loss bugs. In Zig, integers have precise bit-widths (u8, i32, u64, usize). Zig allows safe lossless widening (u8 -> u32), but strictly rejects implicit lossy truncation or float-to-int conversion."

# 2. Polish Chapter 03 slice size explanation
chapters["arrays_and_slices"]["why"] = "JS Array.prototype.slice() copies elements and allocates fresh memory on the V8 heap. In Zig, a slice []T is a fat-pointer struct containing a pointer and a length (16 bytes on 64-bit systems: ptr + len) referencing existing memory without any allocation."

# 3. Add -lc note to Chapter 31
chapters["c_interop_basics"]["code"] = """const std = @import("std");

// Zig includes a built-in Clang C frontend!
// Directly import standard C libraries or third-party C headers
// (Compile locally via: zig run main.zig -lc)
const c = @cImport({
    @cInclude("stdlib.h");
    @cInclude("string.h");
});

pub fn main() void {
    const message = "Hello from C stdlib!";
    const length = c.strlen(message);
    std.debug.print("C strlen: {}\\n", .{length});

    // Call C abs()
    const diff = c.abs(-42);
    std.debug.print("C abs: {}\\n", .{diff});
}"""

# 4. Clean spacing in Chapter 21
chapters["compile_time_assertions"]["code"] = """const std = @import("std");

fn createRingBuffer(comptime capacity: usize) type {
    // Validate capacity at COMPILE TIME!
    if (capacity == 0) {
        @compileError("RingBuffer capacity cannot be zero!");
    }
    if ((capacity & (capacity - 1)) != 0) {
        @compileError("RingBuffer capacity must be a power of 2 for fast bitwise indexing!");
    }

    return struct {
        data: [capacity]u8,
    };
}

pub fn main() void {
    const Buffer16 = createRingBuffer(16);
    const buf = Buffer16{ .data = [_]u8{0} ** 16 };
    std.debug.print("Ring buffer created with capacity: {}\\n", .{buf.data.len});
}"""

# Write chapters.ts & public/chapters-data.js
with open(chapters_path, "w") as f:
    f.write("""export interface Chapter {
  num: string;
  title: string;
  part: string;
  desc: string;
  nodeCode: string;
  code: string;
  why: string;
}

export const chaptersData: Record<string, Chapter> = """ + json.dumps(chapters, indent=2) + ";\n")

with open("/Users/nadimtuhin/opensource/zig-for-node-devs/public/chapters-data.js", "w") as f:
    f.write("window.chaptersData = " + json.dumps(chapters, indent=2) + ";\n")

print("Updated chapters.ts and public/chapters-data.js with polished explanations!")
