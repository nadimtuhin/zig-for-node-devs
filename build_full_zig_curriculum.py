import json, os

output_data_file = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapters.ts"
output_insights_file = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapterInsights.ts"

parts = [
    ("Part 1: The Core Mental Model & Syntax Jump", [
        ("basic_vars", "01", "Variables, Mutability & Types",
         "Why `const` by default, primitive sizing (`u8`, `i32`, `usize`), no type coercion, and explicit undefined `undefined`.",
         """// JavaScript / TypeScript:
const port: number = 8080;
let userCount = 0;
userCount += 1;

let uninitializedValue: any;
console.log(port, userCount, uninitializedValue); // 8080, 1, undefined""",
         """const std = @import("std");

pub fn main() void {
    // In Zig, const is immutable, var is mutable
    const port: u16 = 8080;
    var user_count: usize = 0;
    user_count += 1;

    // Explicitly uninitialized memory requires '= undefined'
    var uninitialized_buffer: [4]u8 = undefined;
    uninitialized_buffer[0] = 'Z';

    std.debug.print("Port: {}, Users: {}, First byte: {c}\\n", .{
        port, user_count, uninitialized_buffer[0]
    });
}""",
         "In JavaScript, all numbers are 64-bit IEEE-754 floats. In Zig, integers have precise bit-widths (`u8`, `i32`, `u64`, `usize`, `isize`). Variables are `const` by default to avoid unintended state mutations.",
         "Variables declared with `= undefined` contain uninitialized memory for performance, which triggers runtime panics in Debug mode if read before write."),

        ("functions_params", "02", "Functions & Immutable Parameters",
         "All function arguments in Zig are strictly immutable `const` values. Returning values and pass-by-value semantics.",
         """// JavaScript / TypeScript:
function calculateDiscount(price: number, discount: number): number {
    // In JS, arguments can be reassigned unless frozen!
    if (discount > 100) discount = 100;
    return price * (1 - discount / 100);
}
console.log(calculateDiscount(200, 20)); // 160""",
         """const std = @import("std");

// In Zig, function parameters are ALWAYS immutable constants!
fn calculateDiscount(price: f64, discount: f64) f64 {
    // discount = 100; // COMPILATION ERROR: cannot assign to constant
    var final_discount = discount;
    if (final_discount > 100.0) {
        final_discount = 100.0;
    }
    return price * (1.0 - final_discount / 100.0);
}

pub fn main() void {
    const discounted = calculateDiscount(200.0, 20.0);
    std.debug.print("Discounted total: {d:.2}\\n", .{discounted});
}""",
         "In JS/TS, function arguments are mutable local variables by default. In Zig, function parameters are always immutable `const`. This allows the Zig compiler to optimize passing by value or invisible pointer without defensive copying.",
         "If you need to mutate an argument, declare a local `var copy = param;` or accept a pointer `*T`."),

        ("arrays_and_slices", "03", "Arrays, Slices & Memory Views",
         "Fixed-length arrays `[N]T` vs fat-pointer slices `[]T` (`ptr + len`). Eliminating bounds check bugs.",
         """// JavaScript / TypeScript:
const numbers = [10, 20, 30, 40, 50]; // Dynamic heap array
const sub = numbers.slice(1, 4);      // Allocates a brand new array!
console.log(sub); // [20, 30, 40]""",
         """const std = @import("std");

pub fn main() void {
    // Fixed array allocated on the stack
    const numbers = [_]i32{ 10, 20, 30, 40, 50 };

    // Slices in Zig are zero-cost views: a pointer + a length!
    // NO HEAP ALLOCATION HAPPENS HERE!
    const sub_slice: []const i32 = numbers[1..4];

    std.debug.print("Array len: {}, Slice len: {}\\n", .{ numbers.len, sub_slice.len });
    for (sub_slice, 0..) |val, idx| {
        std.debug.print("sub_slice[{}] = {}\\n", .{ idx, val });
    }
}""",
         "JS `Array.prototype.slice()` copies elements and allocates fresh memory on the V8 heap. In Zig, a slice `[]T` is simply a 16-byte struct `{ ptr: [*]T, len: usize }` referencing existing memory without any allocation.",
         "Slices are bounds-checked at runtime in Debug and ReleaseSafe modes. Out-of-bounds access immediately causes a safe panic."),

        ("strings_and_bytes", "04", "Strings as UTF-8 Byte Slices",
         "Why Zig has no separate `String` type. String literals are null-terminated arrays `*const [N:0]u8` coerced to `[]const u8`.",
         """// JavaScript / TypeScript:
const greeting = "Hello, Zig!"; // UTF-16 encoded string object
console.log(greeting.length);
console.log(greeting.charCodeAt(0)); // 72""",
         """const std = @import("std");

pub fn main() void {
    // In Zig, strings are UTF-8 byte arrays / slices: []const u8
    const greeting: []const u8 = "Hello, Zig! ⚡";

    std.debug.print("Message: {s}\\n", .{greeting});
    std.debug.print("Byte length: {}\\n", .{greeting.len});

    // Check individual bytes
    std.debug.print("First byte ASCII: {} ('{c}')\\n", .{ greeting[0], greeting[0] });
}""",
         "JavaScript strings are UTF-16 encoded, with dynamic allocation and hidden rope/flat tree representations inside V8. Zig strings are raw slices of UTF-8 bytes (`[]const u8`). There is zero hidden metadata or GC overhead.",
         "Always remember that `str.len` in Zig returns the number of bytes, not Unicode code points or grapheme clusters."),

        ("control_flow", "05", "Control Flow: if, while, for & labeled breaks",
         "Zig's `for` loops with multi-array iteration, `while` with continue expressions, and labeled blocks returning values.",
         """// JavaScript / TypeScript:
const items = ["a", "b", "c"];
for (let i = 0; i < items.length; i++) {
    console.log(i, items[i]);
}""",
         """const std = @import("std");

pub fn main() void {
    const letters = [_]u8{ 'A', 'B', 'C' };
    const scores = [_]u32{ 100, 200, 300 };

    // Multi-array iteration with index capture
    for (letters, scores, 0..) |char, score, index| {
        std.debug.print("[{}] Letter '{c}' => Score: {}\\n", .{ index, char, score });
    }

    // While loop with continue expression
    var count: usize = 0;
    while (count < 3) : (count += 1) {
        std.debug.print("Step {}\\n", .{count});
    }
}""",
         "Zig does not have C-style `for (int i=0; i<N; i++)`. Instead, Zig's `for` operates over slices or ranges, and `while` features an optional continue expression `: (step += 1)` to prevent infinite loop errors.",
         "Loops can capture indexes using the `0..` range syntax inside the capture bar `|val, idx|`."),

        ("blocks_as_expressions", "06", "Blocks as Expressions & Labeled Breaks",
         "Every block `{}` can return a value using `break :label value`. Eliminating immediate IIFEs and ternary nests.",
         """// JavaScript / TypeScript:
const config = (() => {
    const env = "production";
    if (env === "production") return { timeout: 5000, secure: true };
    return { timeout: 1000, secure: false };
})();
console.log(config);""",
         """const std = @import("std");

pub fn main() void {
    const is_production = true;

    // Labeled block returning a value! No IIFE or lambda overhead.
    const timeout_ms: u32 = timeout_block: {
        if (is_production) {
            break :timeout_block 5000;
        } else {
            break :timeout_block 1000;
        }
    };

    std.debug.print("Computed timeout: {}ms\\n", .{timeout_ms});
}""",
         "JavaScript developers constantly use IIFEs `(() => { ... })()` or complex nested ternaries to initialize complex `const` values. Zig lets any labeled block return a value cleanly via `break :label val`.",
         "Labeled blocks are evaluated at compile time if the conditions are comptime-known."),
    ]),

    ("Part 2: Robust Error Handling Without Exceptions", [
        ("errors_as_values", "07", "Error Sets & Return Tracing",
         "Zig has NO exceptions, NO throw/catch, and NO null errors. Error sets `error{...}` are typed integer enums with stack traces.",
         """// JavaScript / TypeScript:
function parseAge(str: string): number {
    const val = parseInt(str, 10);
    if (isNaN(val)) throw new Error("Invalid number");
    if (val < 0) throw new Error("Age cannot be negative");
    return val;
}

try {
    console.log(parseAge("-5"));
} catch (err: any) {
    console.error("Caught error:", err.message);
}""",
         """const std = @import("std");

// Define an explicit Error Set
const AgeError = error{
    InvalidFormat,
    NegativeAge,
    TooOld,
};

fn parseAge(input: []const u8) AgeError!u32 {
    const val = std.fmt.parseInt(i32, input, 10) catch {
        return AgeError.InvalidFormat;
    };
    if (val < 0) return AgeError.NegativeAge;
    if (val > 150) return AgeError.TooOld;
    return @intCast(val);
}

pub fn main() void {
    const res = parseAge("-5");
    if (res) |age| {
        std.debug.print("Age: {}\\n", .{age});
    } else |err| {
        std.debug.print("Handled error: {s}\\n", .{@errorName(err)});
    }
}""",
         "In Node.js, `throw new Error()` creates expensive stack traces, disrupts control flow, and can escape silently if not wrapped in `try/catch`. Zig treats errors as typed values (`!T`), enforced at compile time.",
         "The Zig compiler guarantees that every possible error variant must be handled or explicitly propagated."),

        ("try_and_catch", "08", "The `try` Operator & Fallback `catch`",
         "Propagating errors effortlessly with `try` (shorthand for `catch |err| return err`) vs default fallbacks with `catch value`.",
         """// JavaScript / TypeScript:
function getPort(): number {
    try {
        return parseInt(process.env.PORT || "8080", 10);
    } catch {
        return 8080;
    }
}""",
         """const std = @import("std");

fn parseConfigPort(raw: []const u8) !u16 {
    // 'try' propagates the error up the call stack immediately
    const port = try std.fmt.parseInt(u16, raw, 10);
    return port;
}

pub fn main() void {
    // 'catch' provides an inline fallback default value!
    const valid = parseConfigPort("9090") catch 8080;
    const fallback = parseConfigPort("invalid_port") catch 8080;

    std.debug.print("Valid port: {}, Fallback port: {}\\n", .{ valid, fallback });
}""",
         "In JS, `try/catch` wraps entire code blocks, obfuscating which call failed. In Zig, `try expr` concisely propagates failures up the call stack, while `expr catch fallback` supplies safe defaults on a single line.",
         "`try x` is exact syntax sugar for `x catch |err| return err`."),

        ("defer_and_errdefer", "09", "Resource Cleanup: `defer` & `errdefer`",
         "Deterministic RAII-style cleanup without garbage collection. `errdefer` executes only on error exit paths.",
         """// JavaScript / TypeScript:
let resource = null;
try {
    resource = acquireResource();
    doSomething(resource);
} catch (err) {
    rollback(resource);
    throw err;
} finally {
    if (resource) resource.cleanup();
}""",
         """const std = @import("std");

fn processTransaction(should_fail: bool) !void {
    std.debug.print("1. Transaction opened\\n", .{});
    
    // errdefer runs ONLY if the function returns an error!
    errdefer std.debug.print("--> ROLLBACK executed due to error!\\n", .{});

    // defer runs unconditionally whenever the scope exits!
    defer std.debug.print("2. Cleanup connections (always runs)\\n", .{});

    if (should_fail) {
        return error.DatabaseCorrupted;
    }
    std.debug.print("3. Commit successfully completed\\n", .{});
}

pub fn main() void {
    std.debug.print("--- Success Case ---\\n", .{});
    processTransaction(false) catch {};

    std.debug.print("\\n--- Failure Case ---\\n", .{});
    processTransaction(true) catch {};
}""",
         "In Node.js, `finally` blocks handle cleanup, but rolling back partial transactions on errors requires manual tracking variables. Zig's `defer` and `errdefer` bind cleanup directly next to the allocation site.",
         "Multiple `defer` statements execute in reverse order of declaration (LIFO stack), ensuring dependent resources unwind correctly."),

        ("inferred_error_sets", "10", "Inferred Error Sets `!T` & Anyerror",
         "How the Zig compiler infers the exact union of all possible error variants returned across functions.",
         """// JavaScript / TypeScript:
// Any async or sync JS function can throw ANY untyped exception
async function fetchUser(id: string) {
    // throws NetworkError, ValidationError, or DatabaseError
}""",
         """const std = @import("std");

fn readInt() !i32 {
    return error.DiskFull;
}

fn readFloat() !f32 {
    return error.CorruptedHeader;
}

// Return type '!void' lets the compiler infer the error union set
fn runWorkflow() !void {
    _ = try readInt();
    _ = try readFloat();
}

pub fn main() void {
    if (runWorkflow()) {
        std.debug.print("Success\\n", .{});
    } else |err| {
        std.debug.print("Captured inferred error: {s}\\n", .{@errorName(err)});
    }
}""",
         "TypeScript can use `Promise<User>` or `Result<T, E>`, but TypeScript's type system cannot check unhandled thrown exceptions. Zig's `!T` lets the compiler compute the exact closed set of errors automatically.",
         "For public libraries, declare explicit error sets (`MyError!T`) so API consumers know every potential error code."),
    ]),

    ("Part 3: Optionals, Pointers & Memory Safety", [
        ("optionals_null", "11", "Optionals `?T` vs Undefined vs Null",
         "Zig has NO implicit null pointers. Nullable types must be declared as `?T`. Safe unwrap with `orelse` and `if (opt) |val|`.",
         """// JavaScript / TypeScript:
let username: string | null = null;
if (Math.random() > 0.5) username = "alice";

// Potential runtime TypeError: Cannot read property 'toUpperCase' of null
console.log(username ? username.toUpperCase() : "ANONYMOUS");""",
         """const std = @import("std");

pub fn main() void {
    // In Zig, null can ONLY be assigned to optional types ?T
    var maybe_user: ?[]const u8 = null;
    maybe_user = "alice";

    // Method 1: 'orelse' provides an unwrapped fallback
    const resolved = maybe_user orelse "anonymous";
    std.debug.print("User via orelse: {s}\\n", .{resolved});

    // Method 2: 'if (opt) |unwrapped|' payload capturing
    if (maybe_user) |name| {
        std.debug.print("Hello, {s}!\\n", .{name});
    } else {
        std.debug.print("Guest login\\n", .{});
    }
}""",
         "JavaScript has both `null` and `undefined`, and any variable can unexpectedly become null at runtime. In Zig, regular pointers and primitives can NEVER be null. Optional types `?T` enforce explicit unwrapping.",
         "Under the hood, `?*T` is represented as a single machine pointer where `0` is `null` (zero-overhead pointer tagging)."),

        ("pointers_basics", "12", "Single Pointers `*T` vs Many Pointers `[*]T`",
         "Demystifying pointers: address-of `&x`, dereferencing `ptr.*`, and const correctness `*const T`.",
         """// JavaScript / TypeScript:
// JS hides pointers. Objects are passed by reference, numbers by value!
function incrementCounter(state: { count: number }) {
    state.count += 1;
}
const s = { count: 0 };
incrementCounter(s);
console.log(s.count); // 1""",
         """const std = @import("std");

fn increment(counter_ptr: *u32) void {
    // Dereference using '.*'
    counter_ptr.* += 1;
}

pub fn main() void {
    var count: u32 = 0;
    
    // Address-of operator '&' creates a pointer
    increment(&count);
    increment(&count);

    std.debug.print("Updated count: {}\\n", .{count});
}""",
         "JavaScript hides whether data is copied or referenced behind engine heuristics. In Zig, references are explicit: `*T` is a pointer to exactly one item, and `ptr.*` explicitly dereferences it.",
         "Zig pointers cannot be null (use `?*T`) and cannot undergo arithmetic (use slices `[]T` or many-item pointers `[*]T`)."),

        ("memory_layout_structs", "13", "Structs, Memory Layout & Packed Structs",
         "Defining typed data models. Struct methods, dot-syntax calling, and `packed struct` for exact binary hardware layouts.",
         """// JavaScript / TypeScript:
interface UserProfile {
    id: number;
    username: string;
    isActive: boolean;
}
const user: UserProfile = { id: 1, username: "nadim", isActive: true };""",
         """const std = @import("std");

const User = struct {
    id: u64,
    username: []const u8,
    is_active: bool,

    // Methods in Zig are simply functions with self: *const User or self: User
    pub fn greet(self: User) void {
        std.debug.print("User #{} ({s}) is active: {}\\n", .{
            self.id, self.username, self.is_active
        });
    }
};

pub fn main() void {
    const user = User{
        .id = 42,
        .username = "tuhin",
        .is_active = true,
    };
    user.greet();
}""",
         "V8 allocates JS objects with hidden Shape/HiddenClass pointers, property backing stores, and boxing overhead. A Zig struct has zero runtime overhead: it's pure contiguous memory laid out according to CPU alignment.",
         "Use `extern struct` for guaranteed C ABI compatibility, and `packed struct` for bit-level field packing."),

        ("tagged_unions", "14", "Tagged Unions vs TypeScript Discriminated Unions",
         "Pattern matching with `union(enum)` and `switch`. Memory efficiency where fields share overlapping storage.",
         """// JavaScript / TypeScript:
type WebEvent = 
    | { type: 'click'; x: number; y: number }
    | { type: 'keypress'; key: string }
    | { type: 'quit' };

function handle(event: WebEvent) {
    switch (event.type) {
        case 'click': console.log(event.x, event.y); break;
        case 'keypress': console.log(event.key); break;
        case 'quit': break;
    }
}""",
         """const std = @import("std");

const WebEvent = union(enum) {
    click: struct { x: i32, y: i32 },
    keypress: u8,
    quit: void,
};

fn handleEvent(event: WebEvent) void {
    switch (event) {
        .click => |pos| std.debug.print("Click at ({}, {})\\n", .{ pos.x, pos.y }),
        .keypress => |k| std.debug.print("Key pressed: '{c}'\\n", .{k}),
        .quit => std.debug.print("App quitting...\\n", .{}),
    }
}

pub fn main() void {
    const ev = WebEvent{ .click = .{ .x = 100, .y = 250 } };
    handleEvent(ev);
}""",
         "TypeScript discriminated unions use JS objects with `{ type: 'foo', ... }`, consuming heap allocations and GC cycles. Zig's `union(enum)` stores all variant fields in the same overlapping memory plus a 1-byte enum tag.",
         "The Zig compiler verifies that your `switch` handles every union variant at compile time. Missing a branch fails the build."),
    ]),

    ("Part 4: Explicit Memory Management & Allocators", [
        ("allocators_philosophy", "15", "The Allocator Philosophy: No Hidden Heap",
         "Why Zig functions that need memory take `std.mem.Allocator`. GeneralPurposeAllocator, ArenaAllocator, and FixedBufferAllocator.",
         """// JavaScript / TypeScript:
// In JS, everything implicitly allocates memory behind your back!
const map = new Map();
const arr = [1, 2, 3]; // Hidden V8 heap allocation!""",
         """const std = @import("std");

pub fn main() !void {
    // Standard General Purpose Allocator with leak detection
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Allocate a dynamic slice of integers on the heap
    const slice = try allocator.alloc(i32, 5);
    defer allocator.free(slice); // Always clean up!

    for (slice, 0..) |*item, idx| {
        item.* = @intCast(idx * 10);
    }

    std.debug.print("Allocated items: {any}\\n", .{slice});
}""",
         "In Go or Node.js, runtime memory allocation happens silently via `new` or literals, triggering periodic GC pauses. In Zig, NO function allocates heap memory without explicitly accepting an `allocator: std.mem.Allocator` parameter.",
         "`GeneralPurposeAllocator` automatically detects memory leaks in Debug and Test modes, printing line numbers of un-freed allocations!"),

        ("arena_allocator", "16", "Arena Allocator: High-Speed Batch Deallocation",
         "Group dozens of allocations together and free them all with a single `arena.deinit()`. The standard pattern for HTTP requests.",
         """// JavaScript / TypeScript:
// Handling an HTTP request creates hundreds of short-lived JSON objects
// V8 garbage collector eventually sweeps them in minor GC cycles.""",
         """const std = @import("std");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();

    // Wrap the backing allocator in an ArenaAllocator
    var arena = std.heap.ArenaAllocator.init(gpa.allocator());
    defer arena.deinit(); // Frees ALL allocations made inside the arena at once!
    const allocator = arena.allocator();

    // Allocate many strings and arrays without individual free() calls!
    const msg1 = try allocator.dupe(u8, "Hello from request scope");
    const msg2 = try allocator.dupe(u8, "Temporary parsed JSON token");
    const buffer = try allocator.alloc(u8, 1024);

    std.debug.print("Arena active: {s}, {s}, buf len: {}\\n", .{ msg1, msg2, buffer.len });
}""",
         "In Node.js backend servers, every incoming JSON payload creates hundreds of temporary strings and objects that stress the V8 garbage collector. An Arena allocator allocates quickly in large blocks and frees everything in one pointer reset.",
         "Use Arena allocators for request lifecycles, CLI commands, and temporary batch processing."),

        ("fixed_buffer_allocator", "17", "FixedBufferAllocator & Stack Memory",
         "Zero-syscall, zero-fragmentation allocation inside pre-allocated stack buffers. Ideal for embedded and high-performance microservices.",
         """// JavaScript / TypeScript:
// Buffer.allocUnsafe(1024) in Node.js
const buf = Buffer.alloc(1024);""",
         """const std = @import("std");

pub fn main() !void {
    // 1KB buffer allocated on the call stack
    var stack_buffer: [1024]u8 = undefined;
    var fba = std.heap.FixedBufferAllocator.init(&stack_buffer);
    const allocator = fba.allocator();

    // Allocates directly within the stack buffer without any OS syscalls!
    const numbers = try allocator.alloc(u32, 4);
    numbers[0] = 42;
    numbers[1] = 99;

    std.debug.print("FixedBuffer allocated values: {} {}\\n", .{ numbers[0], numbers[1] });
}""",
         "Every `malloc` or V8 heap growth invokes OS kernel syscalls (`mmap` or `brk`). `FixedBufferAllocator` carves slices from a local stack array with zero syscalls and deterministic execution time.",
         "If the buffer runs out of space, it returns `error.OutOfMemory` cleanly without crashing the operating system."),

        ("memory_leak_detection", "18", "Built-In Memory Leak Detection",
         "How Zig's testing harness and GPA catch use-after-free, double-free, and memory leaks automatically during development.",
         """// JavaScript / TypeScript:
// Node.js memory leaks (unclosed listeners, global caches) require heapdump,
// Chrome DevTools profiles, and complex post-mortems to locate.""",
         """const std = @import("std");

test "detect memory leaks automatically" {
    // std.testing.allocator fails the test if any byte is not freed!
    const allocator = std.testing.allocator;

    const data = try allocator.alloc(u8, 64);
    // Intentional memory leak if we omit: defer allocator.free(data);
    defer allocator.free(data);

    try std.testing.expect(data.len == 64);
}

pub fn main() void {
    std.debug.print("Run 'zig test main.zig' to verify leak detection!\\n", .{});
}""",
         "In Node.js, tracking down memory leaks requires taking heap snapshots with `--inspect` and diffing memory trees. In Zig, `std.testing.allocator` runs on every test and fails the build with stack traces if a single byte leaks.",
         "Always run `zig test` with `std.testing.allocator` in CI/CD pipelines to guarantee zero memory leaks."),
    ]),

    ("Part 5: Comptime — The Superpower of Zig", [
        ("comptime_intro", "19", "What is `comptime`? Type Generation Without Macros",
         "Running arbitrary Zig code at compile time. Eliminating C preprocessor macros, C++ templates, and runtime reflection.",
         """// JavaScript / TypeScript:
// TS generics disappear at runtime. Dynamic code generation requires eval()
function createPair<T>(a: T, b: T): [T, T] {
    return [a, b];
}""",
         """const std = @import("std");

// Functions that take or return types execute at compile time!
fn List(comptime T: type) type {
    return struct {
        items: [4]T,
        len: usize = 0,

        pub fn add(self: *@This(), item: T) void {
            if (self.len < 4) {
                self.items[self.len] = item;
                self.len += 1;
            }
        }
    };
}

pub fn main() void {
    // Generate an IntList struct at compile time!
    var int_list = List(i32){ .items = undefined };
    int_list.add(10);
    int_list.add(20);

    std.debug.print("List len: {}, first item: {}\\n", .{ int_list.len, int_list.items[0] });
}""",
         "In TypeScript, generic type parameters are erased during compilation, leaving no type info at runtime. In C++, templates use cryptic metaprogramming syntax. In Zig, generic types are plain functions executed at compile time.",
         "`comptime` parameters can compute lookup tables, validate SQL queries, and construct tailored struct layouts at build time with zero runtime cost."),

        ("comptime_reflection", "20", "Type Reflection with `@typeInfo` & `@typeName`",
         "Inspecting struct fields, enums, and signatures at compile time. Building zero-overhead serializers without runtime `Reflect`.",
         """// JavaScript / TypeScript:
const obj = { id: 1, name: "Node" };
// Runtime object keys inspection via V8 reflection
console.log(Object.keys(obj));""",
         """const std = @import("std");

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
        else => @compileError("Expected a struct type!"),
    }
}

const Config = struct {
    port: u16,
    hostname: []const u8,
    ssl_enabled: bool,
};

pub fn main() void {
    printFields(Config);
}""",
         "In Node.js, `Object.entries()`, `JSON.stringify()`, and decorator metadata reflect on properties at runtime, consuming CPU on every invocation. Zig's `@typeInfo` analyzes types at compile time, generating unrolled machine code.",
         "Combine `inline for` with `@typeInfo` to create hyper-fast JSON and binary serializers without any runtime reflection overhead."),

        ("compile_time_assertions", "21", "`@compileError` & Comptime Assertions",
         "Catching bugs before the binary even links. Enforcing architectural rules, struct sizes, and environment constraints.",
         """// JavaScript / TypeScript:
// In JS/TS, assertions run at runtime when the function is invoked
function validateBuffer(size: number) {
    if (size % 64 !== 0) throw new Error("Size must be multiple of 64");
}""",
         """const std = @import("std");

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
}""",
         "TypeScript can enforce types, but cannot validate value constraints like 'buffer size must be a power of two' or 'port must be between 1 and 65535'. Zig's `@compileError` stops the compiler instantly with custom error messages.",
         "This guarantees that invalid configurations fail before code is deployed or tested."),

        ("generics_in_practice", "22", "Writing Generic Data Structures (Queue, HashMap)",
         "Step-by-step implementation of a type-safe generic RingBuffer and HashMap in idiomatic Zig.",
         """// JavaScript / TypeScript:
class SimpleQueue<T> {
    private items: T[] = [];
    push(item: T) { this.items.push(item); }
    pop(): T | undefined { return this.items.shift(); }
}""",
         """const std = @import("std");

pub fn Stack(comptime T: type) type {
    return struct {
        items: std.ArrayList(T),

        pub fn init(allocator: std.mem.Allocator) @This() {
            return .{ .items = std.ArrayList(T).init(allocator) };
        }

        pub fn deinit(self: *@This()) void {
            self.items.deinit();
        }

        pub fn push(self: *@This(), value: T) !void {
            try self.items.append(value);
        }

        pub fn pop(self: *@This()) ?T {
            return self.items.popOrNull();
        }
    };
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();

    var num_stack = Stack(i32).init(gpa.allocator());
    defer num_stack.deinit();

    try num_stack.push(10);
    try num_stack.push(20);

    std.debug.print("Popped item: {?}\\n", .{num_stack.pop()});
}""",
         "TypeScript classes with generics are runtime prototypes. Zig's generic patterns instantiate concrete structs tailored to the exact type `T`, generating optimal cache-friendly assembly for integers, structs, or pointers.",
         "Generic types in Zig use PascalCase (`Stack(T)`, `ArrayList(T)`) to indicate that they return a type."),
    ]),

    ("Part 6: Standard Library & Essential Collections", [
        ("arraylist", "23", "`std.ArrayList` Dynamic Arrays",
         "The Zig equivalent to JavaScript's `Array`. Appending, popping, capacity pre-allocation (`ensureTotalCapacity`), and memory ownership.",
         """// JavaScript / TypeScript:
const list = [];
list.push("apple");
list.push("banana");
console.log(list.length, list[0]);""",
         """const std = @import("std");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // std.ArrayList requires an allocator for dynamic resizing
    var fruits = std.ArrayList([]const u8).init(allocator);
    defer fruits.deinit();

    try fruits.append("apple");
    try fruits.append("banana");

    std.debug.print("Count: {}, First: {s}\\n", .{ fruits.items.len, fruits.items[0] });
}""",
         "JavaScript arrays dynamically resize, causing V8 to reallocate and copy elements behind the scenes. In Zig, `ArrayList(T)` gives you explicit control over capacity with `.ensureTotalCapacity()`, avoiding redundant allocations.",
         "Always call `defer list.deinit()` to prevent memory leaks when the list leaves scope."),

        ("hashmap", "24", "`std.StringHashMap` & `std.AutoHashMap`",
         "Key-value dictionaries without `new Map()`. Wyhash algorithm, entry API, and key allocation caveats.",
         """// JavaScript / TypeScript:
const userRoles = new Map<string, string>();
userRoles.set("alice", "admin");
console.log(userRoles.get("alice")); // admin""",
         """const std = @import("std");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // std.StringHashMap for string keys ([]const u8)
    var roles = std.StringHashMap([]const u8).init(allocator);
    defer roles.deinit();

    try roles.put("alice", "admin");
    try roles.put("bob", "viewer");

    if (roles.get("alice")) |role| {
        std.debug.print("Alice's role: {s}\\n", .{role});
    }
}""",
         "JavaScript's `Map` uses an internal hash table managed by V8. Zig provides `AutoHashMap(K, V)` for numbers and structs, and `StringHashMap(V)` for string slices using high-performance hashing (Wyhash).",
         "Be careful with string keys: `StringHashMap` stores references to the key slices. If the key slice is deallocated, the hashmap entry becomes dangling unless you duplicate the string."),

        ("file_io", "25", "File I/O: Reading & Writing Streams",
         "Replacing `node:fs` / `fs.promises`. Working with directory handles, buffered readers, and binary file operations.",
         """// JavaScript / TypeScript:
import * as fs from 'node:fs/promises';
await fs.writeFile('sample.txt', 'Hello Node.js');
const text = await fs.readFile('sample.txt', 'utf-8');
console.log(text);""",
         """const std = @import("std");

pub fn main() !void {
    // Current working directory handle
    const cwd = std.fs.cwd();

    // Write to a file
    const file = try cwd.createFile("greeting.txt", .{});
    defer file.close();
    try file.writeAll("Hello from Zig File I/O!\\n");

    // Read back from file into a local buffer
    var read_buf: [128]u8 = undefined;
    const read_file = try cwd.openFile("greeting.txt", .{});
    defer read_file.close();
    const bytes_read = try read_file.readAll(&read_buf);

    std.debug.print("Read {s}", .{read_buf[0..bytes_read]});
}""",
         "Node.js `fs.readFile()` passes buffers through libuv worker threads and V8. Zig interacts with operating system file descriptors directly via synchronous syscalls or platform-specific event loops.",
         "Use `std.io.bufferedReader` when reading streams to minimize CPU-to-kernel context switches."),

        ("formatting_and_printing", "26", "Formatting & String Building with `std.fmt`",
         "Zig's `std.fmt.allocPrint` vs template literals. Format specifiers: `{s}`, `{}`, `{x}`, `{d:.2}`, and custom formatters.",
         """// JavaScript / TypeScript:
const name = "Alice";
const score = 98.456;
const message = `Player ${name}: score is ${score.toFixed(2)}`;
console.log(message);""",
         """const std = @import("std");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const name = "Alice";
    const score: f64 = 98.456;

    // Allocate formatted string on heap
    const formatted = try std.fmt.allocPrint(
        allocator,
        "Player {s}: score is {d:.2}",
        .{ name, score }
    );
    defer allocator.free(formatted);

    std.debug.print("Formatted output: {s}\\n", .{formatted});
}""",
         "JavaScript template literals `${...}` silently convert types to strings and concatenate on the heap. Zig's format engine is type-checked at compile time: passing an integer to a `{s}` string specifier fails compilation immediately.",
         "Use `std.fmt.bufPrint` when writing into fixed stack buffers to avoid heap allocations entirely."),
    ]),

    ("Part 7: Concurrency & Async in Zig", [
        ("threads_basics", "27", "Native OS Threads with `std.Thread`",
         "True multi-threading without the overhead of Node.js `worker_threads`. Spawning threads and joining handles.",
         """// JavaScript / TypeScript:
// In Node.js, worker_threads spawn separate V8 isolates with heavy memory footprint
import { Worker } from 'node:worker_threads';
// new Worker('./worker.js');""",
         """const std = @import("std");

fn backgroundWorker(id: usize, count: usize) void {
    std.debug.print("[Thread {}] Starting calculation...\\n", .{id});
    var sum: usize = 0;
    var i: usize = 0;
    while (i < count) : (i += 1) {
        sum += i;
    }
    std.debug.print("[Thread {}] Finished with sum: {}\\n", .{ id, sum });
}

pub fn main() !void {
    const thread1 = try std.Thread.spawn(.{}, backgroundWorker, .{ 1, 100000 });
    const thread2 = try std.Thread.spawn(.{}, backgroundWorker, .{ 2, 200000 });

    thread1.join();
    thread2.join();
    std.debug.print("All native worker threads completed.\\n", .{});
}""",
         "Node.js runs on a single main thread, using `worker_threads` that duplicate V8 engine instances (~30MB RAM each). Zig threads are native OS threads spawned with minimal stack overhead (< 100KB), sharing memory directly.",
         "Always call `.join()` or `.detach()` on spawned threads to avoid leaking OS thread handles."),

        ("atomics_and_mutexes", "28", "Mutexes & Atomic Operations (`std.Thread.Mutex`)",
         "Preventing data races when threads share state. Atomic integers vs Mutex locking vs Node.js single-thread model.",
         """// JavaScript / TypeScript:
// Node.js is single-threaded, so ++counter is atomic within a single tick.
// In multi-threaded systems, concurrent += causes race conditions!""",
         """const std = @import("std");

var counter: usize = 0;
var mutex = std.Thread.Mutex{};

fn increment() void {
    var i: usize = 0;
    while (i < 1000) : (i += 1) {
        mutex.lock();
        defer mutex.unlock(); // Guaranteed unlock on scope exit!
        counter += 1;
    }
}

pub fn main() !void {
    const t1 = try std.Thread.spawn(.{}, increment, .{});
    const t2 = try std.Thread.spawn(.{}, increment, .{});

    t1.join();
    t2.join();
    std.debug.print("Final thread-safe counter: {}\\n", .{counter});
}""",
         "JavaScript developers never have to worry about mutexes because V8 runs on a single event loop tick. In multi-threaded Zig, mutable shared state requires locking with `std.Thread.Mutex` or `std.atomic.Value`.",
         "Combine `mutex.lock()` with `defer mutex.unlock()` immediately on the next line to ensure locks are never held permanently, even if errors occur."),

        ("channel_patterns", "29", "Thread Synchronization & Channels",
         "Building Go-style CSP channels and message queues in Zig using Condition Variables and Ring Buffers.",
         """// JavaScript / TypeScript:
// MessagePort in Node.js worker_threads
// port.postMessage({ task: 'process' });""",
         """const std = @import("std");

pub fn main() !void {
    // Demonstration of thread synchronization using Semaphore / WaitGroup
    var reset_event = std.Thread.ResetEvent{};

    const worker = try std.Thread.spawn(.{}, struct {
        fn run(ev: *std.Thread.ResetEvent) void {
            std.debug.print("Worker waiting for signal...\\n", .{});
            ev.wait();
            std.debug.print("Worker received trigger!\\n", .{});
        }
    }.run, .{&reset_event});

    std.time.sleep(std.time.ns_per_ms * 10);
    reset_event.set();
    worker.join();
}""",
         "In Go, goroutines communicate via built-in channels. In Zig, synchronization primitives (`Condition`, `Semaphore`, `ResetEvent`) give you granular control over locking and wakeup signaling without runtime scheduler baggage.",
         "Zig lets you tailor queues for single-producer single-consumer (SPSC) lock-free execution for maximum throughput."),

        ("event_loops_in_zig", "30", "Event Loops & Async I/O (epoll / kqueue / io_uring)",
         "Understanding how Node.js libuv works under the hood and how Zig libraries (like `tigerbeetle`, `zap`, `httpz`) achieve millions of req/sec.",
         """// JavaScript / TypeScript:
// Node.js uses libuv event loop under the hood
const http = require('node:http');
http.createServer((req, res) => res.end('OK')).listen(3000);""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Zig builds lightning-fast servers by driving OS event rings (io_uring on Linux, kqueue on macOS, IOCP on Windows)\\n", .{});
    std.debug.print("No V8 garbage collector pauses, zero-copy buffer pools, and deterministic latency!\\n", .{});
}""",
         "Node.js libuv manages an event loop with epoll/kqueue. In Zig, frameworks like `httpz` and `zap` (or TigerBeetle's storage engine) interact with kernel completion rings directly (`io_uring`), skipping JS context switches.",
         "Zig servers consistently outperform Node.js by 10x-50x in requests per second with 99.9th percentile latencies under 1 millisecond."),
    ]),

    ("Part 8: Interoperability with C & Node.js Native Addons", [
        ("c_interop_basics", "31", "Zero-Overhead C Interoperability: `@cImport`",
         "Zig is a full C compiler! Directly include `.h` files without wrapper code, bindings generators, or CMake.",
         """// JavaScript / TypeScript:
// Calling C in Node.js requires node-gyp, C++ addon boilerplate, or node:ffi-napi""",
         """const std = @import("std");

// Zig includes a built-in Clang C frontend!
// Directly import standard C libraries or third-party C headers
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
}""",
         "In Node.js, calling C/C++ requires compiling complex N-API addons with `node-gyp` and Python. Zig is a drop-in C compiler: you can `@cImport` any C header and call functions directly with zero overhead.",
         "Zig can also compile C and C++ code directly using `zig cc` and `zig c++`."),

        ("napi_addons", "32", "Building High-Speed Node-API Addons in Zig",
         "Exporting shared libraries (`.node` / `.dylib`) that Node.js can require directly via `node:process` without `node-gyp`.",
         """// JavaScript / TypeScript:
// In Node.js:
// const addon = require('./build/Release/my_zig_addon.node');
// console.log(addon.fastHash("large input data"));""",
         """const std = @import("std");

// Export C ABI functions that Node-API or dlopen can call
export fn addNumbers(a: i32, b: i32) i32 {
    return a + b;
}

export fn fastMultiply(a: f64, b: f64) f64 {
    return a * b;
}

pub fn main() void {
    std.debug.print("Exported C ABI symbols ready for Node-API integration!\\n", .{});
}""",
         "Writing Node-API addons in C++ requires managing complex `v8::Local<Value>` handles and enduring slow `node-gyp` builds. In Zig, you can compile native `.node` addons in seconds with pure `zig build-lib`.",
         "Export functions with `export fn` and compile with `-dynamic` to create shared objects consumable by Node.js, Python, or Go."),

        ("wasm_compilation", "33", "Compiling Zig to WebAssembly (Wasm) for Node.js & Browsers",
         "Targeting `wasm32-freestanding`. Generating ultra-compact 2KB Wasm binaries executable in Node.js and browsers.",
         """// JavaScript / TypeScript:
// In Node.js or Browser:
// const wasm = await WebAssembly.instantiate(fs.readFileSync('module.wasm'));
// console.log(wasm.instance.exports.calculateTotal(10, 5));""",
         """const std = @import("std");

// Exported to WebAssembly without any OS libc dependency
export fn fibonacci(n: u32) u32 {
    if (n <= 1) return n;
    var a: u32 = 0;
    var b: u32 = 1;
    var i: u32 = 2;
    while (i <= n) : (i += 1) {
        const next = a + b;
        a = b;
        b = next;
    }
    return b;
}

pub fn main() void {
    std.debug.print("Compiled for WebAssembly targets (wasm32-freestanding)\\n", .{});
}""",
         "Compiling Rust to Wasm often requires `wasm-bindgen` and `wasm-pack`. Zig compiles directly to `wasm32-freestanding` out of the box with zero external dependencies, producing tiny, highly-optimized binaries.",
         "Run `zig build-exe main.zig -target wasm32-freestanding -O ReleaseSmall` to produce sub-kilobyte WebAssembly modules."),

        ("cross_compilation", "34", "Universal Cross-Compilation: `zig cc` as a Superpower",
         "Cross-compiling from macOS to Linux x86_64 or ARM64 with a single flag. Why Bun and Uber use Zig for C/C++ builds.",
         """// JavaScript / TypeScript:
// Cross-compiling native Node modules (e.g., sharp, sqlite3) for Docker/AWS Lambda
// typically requires setting up multi-arch Docker builders or QEMU emulators.""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Zig embeds libc headers for all major operating systems and architectures!\\n", .{});
    std.debug.print("Cross-compile for Linux with: zig build -Dtarget=x86_64-linux-musl\\n", .{});
    std.debug.print("Cross-compile for Windows with: zig build -Dtarget=x86_64-windows-gnu\\n", .{});
}""",
         "Building native code for Linux on a Mac typically requires Docker or cross-compilation toolchains that take hours to configure. Zig bundles headers and source for musl and glibc across dozens of targets.",
         "You can cross-compile a statically-linked Linux binary from your Mac in less than 2 seconds using `zig build -Dtarget=x86_64-linux-musl`."),
    ]),

    ("Part 9: Testing, Tooling & The Build System", [
        ("build_zig", "35", "The `build.zig` System: Zig as Its Own Make/Webpack",
         "Why Zig has no YAML, Makefiles, CMake, or npm scripts. Writing build pipelines and dependency graphs in pure Zig.",
         """// JavaScript / TypeScript:
// package.json:
// { "scripts": { "build": "tsc && vite build", "test": "vitest" } }""",
         """const std = @import("std");

// In build.zig:
pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "my_app",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    b.installArtifact(exe);
}

pub fn main() void {
    std.debug.print("build.zig defines full compilation graphs with type safety!\\n", .{});
}""",
         "Node.js developers juggle `package.json`, `webpack.config.js`, `tsconfig.json`, and bash scripts. Zig replaces all build tooling with `build.zig`, written in the exact same language with full type safety and IDE autocompletion.",
         "The build system caches intermediate build steps with content-addressable hashes, ensuring instantaneous rebuilds."),

        ("zig_package_manager", "36", "The Zig Package Manager (`build.zig.zon`)",
         "`build.zig.zon` vs `package.json`. Git dependencies, package hashes, and why Zig has no bloated `node_modules`.",
         """// JavaScript / TypeScript:
// package.json + 400MB node_modules folder
// "dependencies": { "express": "^4.21.0" }""",
         """const std = @import("std");

// build.zig.zon (Zig Object Notation):
// .{
//     .name = "my_project",
//     .version = "1.0.0",
//     .dependencies = .{
//         .zap = .{
//             .url = "https://github.com/zigzap/zap/archive/v0.8.0.tar.gz",
//             .hash = "1220...",
//         },
//     },
// }

pub fn main() void {
    std.debug.print("build.zig.zon stores cryptographically hashed dependencies with zero runtime bloat!\\n", .{});
}""",
         "npm relies on a centralized registry and can be vulnerable to left-pad issues, prototype pollution, or rogue scripts. Zig packages are fetched by URL and verified with SHA-256 hashes, with no build-time scripts or post-install hooks.",
         "Add dependencies using `zig fetch --save <url>` directly from your terminal."),

        ("unit_testing", "37", "Built-in Testing Framework: `zig test`",
         "Declaring tests directly alongside implementation code with `test \"...\"`. Testing allocator, assertions, and mocks.",
         """// JavaScript / TypeScript:
// requires Jest / Vitest:
// import { test, expect } from 'vitest';
// test('adds 1 + 2', () => expect(1 + 2).toBe(3));""",
         """const std = @import("std");

fn add(a: i32, b: i32) i32 {
    return a + b;
}

test "verify addition logic" {
    const result = add(1, 2);
    try std.testing.expectEqual(@as(i32, 3), result);
}

test "verify string equality" {
    const str = "hello";
    try std.testing.expectEqualStrings("hello", str);
}

pub fn main() void {
    std.debug.print("Run 'zig test main.zig' to execute the test suite!\\n", .{});
}""",
         "In Node.js, running unit tests requires installing heavy test runners (`jest`, `vitest`, `mocha`, `ts-node`). Zig has a built-in test runner that compiles and executes tests in milliseconds without any dependencies.",
         "Tests are stripped out of release binaries completely, so you can place tests directly inside the file next to the code being tested."),

        ("optimization_modes", "38", "Build Optimization Modes: Debug, ReleaseSafe, ReleaseFast, ReleaseSmall",
         "Choosing the right tradeoff between execution speed, binary size, and runtime safety checks.",
         """// JavaScript / TypeScript:
// NODE_ENV=production enables V8 JIT optimizations and strips React dev warnings.""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Zig optimization tiers:\\n", .{});
    std.debug.print("- Debug: Fast build, full debug symbols, safety checks enabled (default)\\n", .{});
    std.debug.print("- ReleaseSafe: High optimization, safety checks preserved\\n", .{});
    std.debug.print("- ReleaseFast: Maximum speed, safety checks disabled (raw performance)\\n", .{});
    std.debug.print("- ReleaseSmall: Minimal binary size, ideal for embedded and Wasm\\n", .{});
}""",
         "In Node.js, optimization is handled at runtime by V8's Turbofan JIT compiler. Zig gives you four explicit build modes. For production servers, `ReleaseSafe` gives high speed while retaining panic bounds checks.",
         "Use `zig build -Doptimize=ReleaseFast` when raw throughput is paramount."),
    ]),

    ("Part 10: Building Real-World Systems & Microservices", [
        ("http_server_fundamentals", "39", "Building a High-Performance HTTP Server",
         "Sockets, request parsing, and response framing. Comparing a native Zig HTTP server against Node.js Express.",
         """// JavaScript / TypeScript:
import express from 'express';
const app = express();
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000);""",
         """const std = @import("std");

pub fn main() !void {
    const address = try std.net.Address.parseIp4("127.0.0.1", 3000);
    var server = try address.listen(.{ .reuse_port = true });
    defer server.deinit();

    std.debug.print("Zig HTTP Server listening on http://127.0.0.1:3000\\n", .{});
    // In production, accept connections and write HTTP/1.1 response headers
}""",
         "Express adds multiple layers of middleware, object creation, and GC pressure to every HTTP request. A Zig HTTP server parses request lines directly into memory slices with zero heap allocations.",
         "Use production-grade Zig HTTP libraries like `httpz` or `zap` for router macros and connection pooling."),

        ("json_parsing_comptime", "40", "Zero-Allocation JSON Parsing with `std.json`",
         "Replacing `JSON.parse` and `zod` with type-safe comptime schema deserialization.",
         """// JavaScript / TypeScript:
const data = JSON.parse('{"id": 42, "name": "Nadim"}');
console.log(data.id, data.name);""",
         """const std = @import("std");

const UserPayload = struct {
    id: u32,
    name: []const u8,
};

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const raw_json = "{\"id\": 42, \"name\": \"Nadim\"}";

    // Parse JSON directly into a statically-typed struct!
    const parsed = try std.json.parseFromSlice(
        UserPayload,
        allocator,
        raw_json,
        .{}
    );
    defer parsed.deinit();

    std.debug.print("User: #{}, Name: {s}\\n", .{ parsed.value.id, parsed.value.name });
}""",
         "In Node.js, `JSON.parse()` creates untyped dynamic JS objects that require runtime validation libraries like `zod`. Zig's `std.json` parses JSON directly into your declared struct types with zero schema validation overhead.",
         "Excess fields can be ignored or flagged as errors depending on your parser options."),

        ("database_sqlite", "41", "Database Persistence with SQLite & C Drivers",
         "Embedding SQLite directly into your Zig microservice binary with zero external daemon dependencies.",
         """// JavaScript / TypeScript:
// import Database from 'better-sqlite3';
// const db = new Database('app.db');
// const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Because Zig is a native C compiler, embedding SQLite is as simple as adding sqlite3.c to build.zig!\\n", .{});
    std.debug.print("No node-gyp, no Python build scripts, and no separate shared library binaries!\\n", .{});
}""",
         "In Node.js, using `better-sqlite3` requires compiling native C++ code via `node-gyp`. With Zig, you can simply drop `sqlite3.c` into your project source and compile it directly alongside your Zig code in a single command.",
         "This produces a single self-contained executable with embedded database capabilities."),

        ("graceful_shutdown", "42", "Signal Handling & Graceful Shutdown",
         "Handling `SIGINT` (Ctrl+C) and `SIGTERM` gracefully. Draining active connections and flushing pending buffers.",
         """// JavaScript / TypeScript:
process.on('SIGINT', async () => {
    console.log('Closing server...');
    await server.close();
    process.exit(0);
});""",
         """const std = @import("std");

var keep_running = true;

fn handleSignal(sig: i32) callconv(.C) void {
    _ = sig;
    keep_running = false;
}

pub fn main() !void {
    std.debug.print("Signal handling in Zig allows graceful drain of server loops without abrupt exit.\\n", .{});
}""",
         "In Node.js, uncaught promises or SIGKILL can terminate processes before file buffers are flushed. Zig provides full access to POSIX signal actions (`sigaction`), allowing clean connection draining before process exit.",
         "Combine signal handlers with an atomic flag `is_shutting_down` to exit worker loops gracefully."),
    ]),

    ("Part 11: Production Deployment & Docker", [
        ("docker_scratch_containers", "43", "Ultra-Minimal Docker Containers (< 5MB Scratch)",
         "Packaging Zig microservices into zero-vulnerability `scratch` Docker containers vs 200MB+ Node.js images.",
         """# Node.js Dockerfile (typically 150MB - 300MB):
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]""",
         """# Zig Production Dockerfile (Statically linked, ~4MB image size!):
# Build stage
FROM alpine:3.20 AS builder
RUN apk add --no-cache zig
WORKDIR /build
COPY . .
RUN zig build -Doptimize=ReleaseSafe -Dtarget=x86_64-linux-musl

# Runtime stage: 100% empty scratch image!
FROM scratch
COPY --from=builder /build/zig-out/bin/my_app /app
EXPOSE 8080
ENTRYPOINT ["/app"]""",
         "Node.js containers require Linux userland, Python/build tools for npm packages, V8, and hundreds of files in `node_modules`. A statically-linked Zig binary requires literally NOTHING: it runs inside Docker's empty `scratch` image.",
         "Scratch images have virtually ZERO attack surface and zero CVE vulnerability scan alerts."),

        ("ci_cd_github_actions", "44", "CI/CD Workflows with GitHub Actions & Cache",
         "Automating `zig build`, `zig test`, and cross-platform binary releases across macOS, Linux, and Windows.",
         """// GitHub Actions YAML workflow:
// - name: Setup Zig
//   uses: mlugg/setup-zig@v1
//   with:
//     version: 0.13.0
// - run: zig build test""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Automate testing and multi-platform compilation with mlugg/setup-zig in GitHub Actions!\\n", .{});
}""",
         "Zig's fast compilation and lack of `node_modules` makes CI/CD pipelines run in seconds rather than minutes.",
         "Cache the `~/.cache/zig` directory in GitHub Actions to make subsequent builds instantaneous."),

        ("observability_metrics", "45", "Observability: Prometheus Metrics & Tracing",
         "Exposing Prometheus metrics endpoints (`/metrics`) and counting events with atomic counters.",
         """// JavaScript / TypeScript:
import client from 'prom-client';
const counter = new client.Counter({ name: 'http_requests_total', help: 'Total requests' });
counter.inc();""",
         """const std = @import("std");

const Metrics = struct {
    requests_total: std.atomic.Value(usize) = std.atomic.Value(usize).init(0),
    errors_total: std.atomic.Value(usize) = std.atomic.Value(usize).init(0),

    pub fn recordRequest(self: *Metrics) void {
        _ = self.requests_total.fetchAdd(1, .monotonic);
    }
};

pub fn main() void {
    var metrics = Metrics{};
    metrics.recordRequest();
    std.debug.print("Metrics recorded: requests={}\\n", .{metrics.requests_total.load(.monotonic)});
}""",
         "Observability in Node.js often requires heavy APM agents (`dd-trace`, `newrelic`) that intercept V8 async hooks. In Zig, lightweight atomic counters track metrics with single-digit nanosecond overhead.",
         "Expose standard text-based Prometheus metrics with simple `std.fmt` format strings."),
    ]),

    ("Part 12: Rosetta Stone & Classic Algorithms", [
        ("two_sum", "46", "LeetCode: Two Sum in Zig",
         "Solving Two Sum using `std.AutoHashMap` with zero allocations on failure and O(N) runtime.",
         """// JavaScript / TypeScript:
function twoSum(nums: number[], target: number): [number, number] | null {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff)!, i];
        map.set(nums[i], i);
    }
    return null;
}""",
         """const std = @import("std");

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
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();

    const numbers = [_]i32{ 2, 7, 11, 15 };
    if (try twoSum(gpa.allocator(), &numbers, 9)) |res| {
        std.debug.print("TwoSum indices: [{}, {}]\\n", .{ res[0], res[1] });
    }
}""",
         "In JS, `Map` operations allocate entries on the heap. In Zig, `AutoHashMap(i32, usize)` stores keys and values in flat contiguous buffers, achieving superior cache locality and faster lookups.",
         "Always pass an allocator to algorithms that require dynamic lookup tables."),

        ("valid_parentheses", "47", "LeetCode: Valid Parentheses with Fixed Stack",
         "Stack-based parsing using a zero-allocation fixed stack array.",
         """// JavaScript / TypeScript:
function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (!map[char]) stack.push(char);
        else if (stack.pop() !== map[char]) return false;
    }
    return stack.length === 0;
}""",
         """const std = @import("std");

fn isValidParentheses(input: []const u8) bool {
    var stack_buf: [256]u8 = undefined;
    var top: usize = 0;

    for (input) |char| {
        switch (char) {
            '(', '{', '[' => {
                if (top >= stack_buf.len) return false;
                stack_buf[top] = char;
                top += 1;
            },
            ')' => {
                if (top == 0 or stack_buf[top - 1] != '(') return false;
                top -= 1;
            },
            '}' => {
                if (top == 0 or stack_buf[top - 1] != '{') return false;
                top -= 1;
            },
            ']' => {
                if (top == 0 or stack_buf[top - 1] != '[') return false;
                top -= 1;
            },
            else => {},
        }
    }
    return top == 0;
}

pub fn main() void {
    const is_valid = isValidParentheses("{[()]}");
    std.debug.print("Is valid: {}\\n", .{is_valid});
}""",
         "Solving this in Node.js allocates dynamic arrays and string characters. In Zig, we solve it using an in-place stack buffer with zero heap allocations and sub-microsecond execution time.",
         "Using `switch` matches byte values cleanly with compiler jump tables."),

        ("reverse_linked_list", "48", "LeetCode: Reverse Linked List with Pointers",
         "Mastering pointer manipulation in Zig by reversing an in-place singly linked list.",
         """// JavaScript / TypeScript:
class ListNode {
    val: number;
    next: ListNode | null = null;
    constructor(val: number) { this.val = val; }
}""",
         """const std = @import("std");

const Node = struct {
    val: i32,
    next: ?*Node = null,
};

fn reverseList(head: ?*Node) ?*Node {
    var prev: ?*Node = null;
    var current = head;

    while (current) |curr| {
        const next_node = curr.next;
        curr.next = prev;
        prev = curr;
        current = next_node;
    }
    return prev;
}

pub fn main() void {
    var n3 = Node{ .val = 3 };
    var n2 = Node{ .val = 2, .next = &n3 };
    var n1 = Node{ .val = 1, .next = &n2 };

    const reversed = reverseList(&n1);
    std.debug.print("Reversed head val: {?}\\n", .{if (reversed) |r| r.val else null});
}""",
         "Linked lists in JS allocate separate GC objects for every node. In Zig, nodes are structs linked via optional pointers `?*Node` without any garbage collection overhead.",
         "Notice how `while (current) |curr|` unwraps the optional pointer cleanly without manual null checks."),

        ("binary_search", "49", "LeetCode: Binary Search & Slice Windows",
         "Sub-slice indexing and integer overflow-safe midpoint calculation.",
         """// JavaScript / TypeScript:
function search(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}""",
         """const std = @import("std");

fn binarySearch(nums: []const i32, target: i32) ?usize {
    if (nums.len == 0) return null;
    var left: usize = 0;
    var right: usize = nums.len;

    while (left < right) {
        // Safe midpoint calculation avoiding integer overflow
        const mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return null;
}

pub fn main() void {
    const list = [_]i32{ 1, 3, 5, 7, 9, 11, 15 };
    const idx = binarySearch(&list, 9);
    std.debug.print("Found index: {?}\\n", .{idx});
}""",
         "In JS, `(left + right) / 2` produces floating-point numbers requiring `Math.floor()`. In Zig, integer division `/` truncates naturally, and `left + (right - left) / 2` avoids integer overflow bugs.",
         "Returning an optional `?usize` is idiomatic Zig for functions that might fail to find an element."),
    ]),

    ("Part 13: Advanced Systems & Production Mastery", [
        ("simd_vectorization", "50", "Hardware SIMD Vectorization (`@Vector`)",
         "Parallel CPU processing on multiple values simultaneously using Zig's first-class `@Vector` primitive.",
         """// JavaScript / TypeScript:
// Node.js processes numbers sequentially in V8 loops
function addVectors(a: number[], b: number[]): number[] {
    return a.map((val, i) => val + b[i]);
}""",
         """const std = @import("std");

pub fn main() void {
    // 4-wide 32-bit float SIMD vector
    const Vec4 = @Vector(4, f32);

    const a: Vec4 = .{ 1.0, 2.0, 3.0, 4.0 };
    const b: Vec4 = .{ 10.0, 20.0, 30.0, 40.0 };

    // CPU executes this addition in a SINGLE instruction (e.g. ADDPS)!
    const sum = a + b;

    std.debug.print("SIMD vector sum: {d:.1} {d:.1} {d:.1} {d:.1}\\n", .{
        sum[0], sum[1], sum[2], sum[3]
    });
}""",
         "JavaScript engines cannot guarantee that loops will be vectorized by JIT compilers. Zig features native `@Vector(len, T)` primitives that compile directly to AVX2, AVX-512, or ARM NEON CPU instructions.",
         "Use SIMD vectors for audio processing, image filters, cryptography, and game mathematics."),

        ("custom_allocator_implementation", "51", "Writing a Custom Allocator from Scratch",
         "Implementing the `std.mem.Allocator` vtable interface to create specialized memory arenas.",
         """// JavaScript / TypeScript:
// In V8, memory allocation algorithms are locked inside the C++ runtime.
// Developers cannot customize how V8 allocates objects.""",
         """const std = @import("std");

const BumpAllocator = struct {
    buffer: []u8,
    offset: usize = 0,

    pub fn allocator(self: *BumpAllocator) std.mem.Allocator {
        return .{
            .ptr = self,
            .vtable = &.{
                .alloc = allocFn,
                .resize = resizeFn,
                .free = freeFn,
            },
        };
    }

    fn allocFn(ctx: *anyopaque, len: usize, ptr_align: u8, ret_addr: usize) ?[*]u8 {
        _ = ptr_align; _ = ret_addr;
        const self: *BumpAllocator = @ptrCast(@alignCast(ctx));
        if (self.offset + len > self.buffer.len) return null;
        const res = self.buffer[self.offset..].ptr;
        self.offset += len;
        return res;
    }

    fn resizeFn(ctx: *anyopaque, buf: []u8, buf_align: u8, new_len: usize, ret_addr: usize) bool {
        _ = ctx; _ = buf; _ = buf_align; _ = new_len; _ = ret_addr;
        return false;
    }

    fn freeFn(ctx: *anyopaque, buf: []u8, buf_align: u8, ret_addr: usize) void {
        _ = ctx; _ = buf; _ = buf_align; _ = ret_addr;
        // Bump allocators free everything at once!
    }
};

pub fn main() void {
    std.debug.print("Custom allocators allow tailor-made memory strategies for games and high-frequency trading!\\n", .{});
}""",
         "In Go or Node.js, the runtime forces a single monolithic allocator. In Zig, any data structure can implement `std.mem.Allocator`'s simple vtable interface (`alloc`, `resize`, `free`).",
         "This lets you build bump allocators, slab allocators, or memory-mapped pools tailored to your specific application workload."),

        ("zero_cost_abstractions", "52", "Zero-Cost Abstractions: Inline & Assembly",
         "Controlling generated assembly. `inline fn`, `asm volatile`, and examining compiled instructions.",
         """// JavaScript / TypeScript:
// JS engines decide inline heuristics unpredictably based on call frequency.""",
         """const std = @import("std");

// Force compiler to inline function at all call sites
inline fn fastAdd(a: u32, b: u32) u32 {
    return a + b;
}

pub fn main() void {
    const result = fastAdd(10, 25);
    std.debug.print("Fast inline calculation: {}\\n", .{result});
}""",
         "In Node.js, V8 JIT inlines functions dynamically, but can de-optimize when hidden classes change. In Zig, `inline fn` guarantees inlining at compile time, eliminating function call overhead entirely.",
         "Combine with `zig build-exe -femit-asm` to inspect the generated machine instructions directly."),

        ("production_debugging_gdb_lldb", "53", "Debugging with LLDB & Core Dumps",
         "Setting breakpoints, inspecting registers, and reading core dumps when native binaries crash.",
         """// JavaScript / TypeScript:
// In Node.js:
// node --inspect-brk server.js (Chrome DevTools debugger)""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Compile with debug symbols using 'zig build' (Debug mode)\\n", .{});
    std.debug.print("Debug with LLDB:\\n", .{});
    std.debug.print("  lldb ./zig-out/bin/my_app\\n", .{});
    std.debug.print("  (lldb) breakpoint set --name main\\n", .{});
    std.debug.print("  (lldb) run\\n", .{});
    std.debug.print("  (lldb) frame variable\\n", .{});
}""",
         "Debugging native compiled binaries uses industry-standard LLDB or GDB instead of browser devtools. Because Zig preserves full DWARF debug symbols in Debug and ReleaseSafe modes, variable names and types are preserved.",
         "You can step through Zig source code line-by-line right inside VSCode or terminal LLDB."),

        ("bun_and_tigerbeetle_case_studies", "54", "Case Studies: Why Bun & TigerBeetle Chose Zig",
         "Architectural review of Jarred Sumner's Bun JavaScript runtime and TigerBeetle financial database.",
         """// JavaScript / TypeScript:
// Bun is written in Zig! It replaces Node.js, npm, and Jest with 3x-10x performance.""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Why Bun chose Zig over Rust and C++:\\n", .{});
    std.debug.print("1. Seamless C/C++ interop for JavaScriptCore bindings\\n", .{});
    std.debug.print("2. Comptime metaprogramming without macro maintenance headaches\\n", .{});
    std.debug.print("3. Fast compilation times enabling rapid iteration\\n", .{});
    std.debug.print("4. Granular control over every byte of memory allocation\\n", .{});
}""",
         "Bun (the modern JS runtime) is written primarily in Zig. Jarred Sumner cited Zig's seamless C/C++ interop (essential for interfacing with WebKit's JavaScriptCore) and lack of hidden control flow as the primary reasons for choosing Zig over Rust.",
         "TigerBeetle uses Zig to guarantee deterministic simulation testing and zero runtime allocations after startup."),

        ("senior_interview_questions", "55", "Senior Systems Engineering Interview Q&A",
         "Top interview questions: Allocator lifecycles, undefined memory safety, comptime execution limits, and C ABI compatibility.",
         """// Questions senior engineering candidates face when interviewing for systems roles:""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("Key Zig Interview Concepts:\\n", .{});
    std.debug.print("- What is the difference between GeneralPurposeAllocator and ArenaAllocator?\\n", .{});
    std.debug.print("- How does 'comptime' achieve type generics without runtime RTTI?\\n", .{});
    std.debug.print("- Why does Zig have no hidden control flow or operator overloading?\\n", .{});
    std.debug.print("- How does Zig's error handling eliminate the overhead of C++ exceptions?\\n", .{});
}""",
         "Interviewing for systems engineering roles requires knowing how memory is physically structured in cache lines, why GC pauses occur, and how to write deterministic software.",
         "Study the mental models in this guide to explain the exact mechanical sympathy between code and hardware."),

        ("zen_of_zig", "56", "The Zen of Zig & Production Playbook",
         "The 18 principles of the Zen of Zig. What Zig deliberately left out (operator overloading, hidden control flow) and why.",
         """// JavaScript:
// JS has type coercion ('1' + 1 === '11'), prototype mutation, and hidden getters/setters.""",
         """const std = @import("std");

pub fn main() void {
    std.debug.print("--- The Zen of Zig ---\\n", .{});
    std.debug.print("1. Communicate intent precisely.\\n", .{});
    std.debug.print("2. Edge cases matter.\\n", .{});
    std.debug.print("3. Favor reading code over writing code.\\n", .{});
    std.debug.print("4. Only one obvious way to do things.\\n", .{});
    std.debug.print("5. Runtime crashes are better than runtime bugs.\\n", .{});
    std.debug.print("6. Compile errors are better than runtime crashes.\\n", .{});
    std.debug.print("7. Incremental improvement.\\n", .{});
    std.debug.print("8. Avoid local maximums.\\n", .{});
    std.debug.print("9. Reduce the amount one must remember.\\n", .{});
    std.debug.print("10. Focus on code rather than style.\\n", .{});
    std.debug.print("11. Resource allocation may fail; resource deallocation must succeed.\\n", .{});
    std.debug.print("12. Memory is a resource.\\n", .{});
    std.debug.print("13. Together we serve the users.\\n", .{});
}""",
         "Zig has NO operator overloading, NO hidden control flow (a function call looks like `f()`, never an overloaded operator), and NO hidden memory allocation. What you see is what executes.",
         "This makes Zig code trivial to audit for security, performance, and correctness."),
    ]),
]

chapters_dict = {}
insights_dict = {}

for part_title, lessons in parts:
    for slug, num, title, desc, node_code, zig_code, mental_model, footgun in lessons:
        chapters_dict[slug] = {
            "num": num,
            "title": title,
            "part": part_title,
            "desc": desc,
            "nodeCode": node_code,
            "code": zig_code,
            "why": mental_model,
        }
        insights_dict[slug] = {
            "mentalModel": mental_model,
            "footgun": footgun,
        }

# Write chapters.ts
with open(output_data_file, "w") as f:
    f.write("""export interface Chapter {
  num: string;
  title: string;
  part: string;
  desc: string;
  nodeCode: string;
  code: string;
  why: string;
}

export const chaptersData: Record<string, Chapter> = """ + json.dumps(chapters_dict, indent=2) + ";\n")

# Write chapterInsights.ts
with open(output_insights_file, "w") as f:
    f.write("""export interface ChapterInsight {
  mentalModel: string;
  footgun: string;
}

export const chapterInsights: Record<string, ChapterInsight> = """ + json.dumps(insights_dict, indent=2) + ";\n")

# Also write to public/ for client-side bundle if needed
with open("/Users/nadimtuhin/opensource/zig-for-node-devs/public/chapters-data.js", "w") as f:
    f.write("window.chaptersData = " + json.dumps(chapters_dict, indent=2) + ";\n")

with open("/Users/nadimtuhin/opensource/zig-for-node-devs/public/chapter-insights.js", "w") as f:
    f.write("window.chapterInsights = " + json.dumps(insights_dict, indent=2) + ";\n")

print(f"Successfully generated 56 Zig curriculum chapters across {len(parts)} parts!")
