import json, os

chapters_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapters.ts"
insights_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapterInsights.ts"
views_dir = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/views"
pages_dir = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages"

# 1. READ EXISTING CHAPTERS
with open(chapters_path, "r") as f:
    raw = f.read()

prefix = "export const chaptersData: Record<string, Chapter> = "
json_str = raw[raw.find(prefix) + len(prefix):].rstrip(";\n")
chapters = json.loads(json_str)

# 2. FIX CHAPTER 40 (JSON syntax quote escaping)
chapters["json_parsing_comptime"]["code"] = """const std = @import("std");

const UserPayload = struct {
    id: u32,
    name: []const u8,
};

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Valid escaped JSON string in Zig
    const raw_json = "{\\"id\\": 42, \\"name\\": \\"Nadim\\"}";

    // Parse JSON directly into a statically-typed struct!
    const parsed = try std.json.parseFromSlice(
        UserPayload,
        allocator,
        raw_json,
        .{}
    );
    defer parsed.deinit();

    std.debug.print("User: #{}, Name: {s}\\n", .{ parsed.value.id, parsed.value.name });
}"""

# 3. FIX CHAPTER 21 (Operator spacing around **)
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

# 4. FIX CHAPTER 43 (Valid Zig Program for Scratch Container)
chapters["docker_scratch_containers"]["code"] = """const std = @import("std");

// Minimal static microservice entrypoint designed for Docker 'scratch'
// Statically compiled via: zig build -Doptimize=ReleaseSmall -Dtarget=x86_64-linux-musl
pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("🚀 Zig microservice active inside 4MB scratch container!\\n", .{});
    try stdout.print("Listening on 0.0.0.0:8080 (zero glibc dependency, zero CVEs)\\n", .{});
}"""
chapters["docker_scratch_containers"]["nodeCode"] = """# Traditional Node.js Dockerfile (200MB - 350MB):
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]"""

# 5. REMOVE LEFTOVER GO/RUST MENTIONS IN CHAPTERS
chapters["allocators_philosophy"]["why"] = "In Node.js, runtime memory allocation happens silently via object literals or 'new', triggering non-deterministic V8 garbage collection pauses. In Zig, NO function allocates heap memory without explicitly accepting an 'allocator: std.mem.Allocator' parameter."

chapters["channel_patterns"]["title"] = "Thread Synchronization & Message Queues"
chapters["channel_patterns"]["desc"] = "Building message queues and thread notification channels in Zig to replace Node.js worker_threads MessagePort."
chapters["channel_patterns"]["why"] = "In Node.js worker_threads, communication occurs via serialized JSON posts over MessagePort. In Zig, synchronization primitives (Condition, Semaphore, ResetEvent) give you sub-microsecond signaling without V8 IPC serialization baggage."

chapters["wasm_compilation"]["why"] = "Compiling to WebAssembly in other ecosystems often requires third-party toolchains and glue code. Zig compiles directly to 'wasm32-freestanding' out of the box with zero external dependencies, producing tiny, highly-optimized binaries for Node.js or browsers."

chapters["custom_allocator_implementation"]["why"] = "In Node.js, the V8 runtime locks developers into a monolithic generational garbage collector. In Zig, any data structure can implement std.mem.Allocator's simple vtable interface (alloc, resize, free) to create custom bump or arena allocators."

# 6. WRITE UPDATED chapters.ts & public/chapters-data.js
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

print("Updated chapters.ts and public/chapters-data.js successfully!")
