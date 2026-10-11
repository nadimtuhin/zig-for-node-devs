window.chaptersData = {
  "basic_vars": {
    "num": "01",
    "title": "Variables, Mutability & Types",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "Why `const` by default, primitive sizing (`u8`, `i32`, `usize`), no type coercion, and explicit undefined `undefined`.",
    "nodeCode": "// JavaScript / TypeScript:\nconst port: number = 8080;\nlet userCount = 0;\nuserCount += 1;\n\nlet uninitializedValue: any;\nconsole.log(port, userCount, uninitializedValue); // 8080, 1, undefined",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    // In Zig, const is immutable, var is mutable\n    const port: u16 = 8080;\n    var user_count: usize = 0;\n    user_count += 1;\n\n    // Explicitly uninitialized memory requires '= undefined'\n    var uninitialized_buffer: [4]u8 = undefined;\n    uninitialized_buffer[0] = 'Z';\n\n    std.debug.print(\"Port: {}, Users: {}, First byte: {c}\\n\", .{\n        port, user_count, uninitialized_buffer[0]\n    });\n}",
    "why": "In JavaScript, all numbers are 64-bit IEEE-754 floats. In Zig, integers have precise bit-widths (`u8`, `i32`, `u64`, `usize`, `isize`). Variables are `const` by default to avoid unintended state mutations."
  },
  "functions_params": {
    "num": "02",
    "title": "Functions & Immutable Parameters",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "All function arguments in Zig are strictly immutable `const` values. Returning values and pass-by-value semantics.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction calculateDiscount(price: number, discount: number): number {\n    // In JS, arguments can be reassigned unless frozen!\n    if (discount > 100) discount = 100;\n    return price * (1 - discount / 100);\n}\nconsole.log(calculateDiscount(200, 20)); // 160",
    "code": "const std = @import(\"std\");\n\n// In Zig, function parameters are ALWAYS immutable constants!\nfn calculateDiscount(price: f64, discount: f64) f64 {\n    // discount = 100; // COMPILATION ERROR: cannot assign to constant\n    var final_discount = discount;\n    if (final_discount > 100.0) {\n        final_discount = 100.0;\n    }\n    return price * (1.0 - final_discount / 100.0);\n}\n\npub fn main() void {\n    const discounted = calculateDiscount(200.0, 20.0);\n    std.debug.print(\"Discounted total: {d:.2}\\n\", .{discounted});\n}",
    "why": "In JS/TS, function arguments are mutable local variables by default. In Zig, function parameters are always immutable `const`. This allows the Zig compiler to optimize passing by value or invisible pointer without defensive copying."
  },
  "arrays_and_slices": {
    "num": "03",
    "title": "Arrays, Slices & Memory Views",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "Fixed-length arrays `[N]T` vs fat-pointer slices `[]T` (`ptr + len`). Eliminating bounds check bugs.",
    "nodeCode": "// JavaScript / TypeScript:\nconst numbers = [10, 20, 30, 40, 50]; // Dynamic heap array\nconst sub = numbers.slice(1, 4);      // Allocates a brand new array!\nconsole.log(sub); // [20, 30, 40]",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    // Fixed array allocated on the stack\n    const numbers = [_]i32{ 10, 20, 30, 40, 50 };\n\n    // Slices in Zig are zero-cost views: a pointer + a length!\n    // NO HEAP ALLOCATION HAPPENS HERE!\n    const sub_slice: []const i32 = numbers[1..4];\n\n    std.debug.print(\"Array len: {}, Slice len: {}\\n\", .{ numbers.len, sub_slice.len });\n    for (sub_slice, 0..) |val, idx| {\n        std.debug.print(\"sub_slice[{}] = {}\\n\", .{ idx, val });\n    }\n}",
    "why": "JS `Array.prototype.slice()` copies elements and allocates fresh memory on the V8 heap. In Zig, a slice `[]T` is simply a 16-byte struct `{ ptr: [*]T, len: usize }` referencing existing memory without any allocation."
  },
  "strings_and_bytes": {
    "num": "04",
    "title": "Strings as UTF-8 Byte Slices",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "Why Zig has no separate `String` type. String literals are null-terminated arrays `*const [N:0]u8` coerced to `[]const u8`.",
    "nodeCode": "// JavaScript / TypeScript:\nconst greeting = \"Hello, Zig!\"; // UTF-16 encoded string object\nconsole.log(greeting.length);\nconsole.log(greeting.charCodeAt(0)); // 72",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    // In Zig, strings are UTF-8 byte arrays / slices: []const u8\n    const greeting: []const u8 = \"Hello, Zig! \u26a1\";\n\n    std.debug.print(\"Message: {s}\\n\", .{greeting});\n    std.debug.print(\"Byte length: {}\\n\", .{greeting.len});\n\n    // Check individual bytes\n    std.debug.print(\"First byte ASCII: {} ('{c}')\\n\", .{ greeting[0], greeting[0] });\n}",
    "why": "JavaScript strings are UTF-16 encoded, with dynamic allocation and hidden rope/flat tree representations inside V8. Zig strings are raw slices of UTF-8 bytes (`[]const u8`). There is zero hidden metadata or GC overhead."
  },
  "control_flow": {
    "num": "05",
    "title": "Control Flow: if, while, for & labeled breaks",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "Zig's `for` loops with multi-array iteration, `while` with continue expressions, and labeled blocks returning values.",
    "nodeCode": "// JavaScript / TypeScript:\nconst items = [\"a\", \"b\", \"c\"];\nfor (let i = 0; i < items.length; i++) {\n    console.log(i, items[i]);\n}",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    const letters = [_]u8{ 'A', 'B', 'C' };\n    const scores = [_]u32{ 100, 200, 300 };\n\n    // Multi-array iteration with index capture\n    for (letters, scores, 0..) |char, score, index| {\n        std.debug.print(\"[{}] Letter '{c}' => Score: {}\\n\", .{ index, char, score });\n    }\n\n    // While loop with continue expression\n    var count: usize = 0;\n    while (count < 3) : (count += 1) {\n        std.debug.print(\"Step {}\\n\", .{count});\n    }\n}",
    "why": "Zig does not have C-style `for (int i=0; i<N; i++)`. Instead, Zig's `for` operates over slices or ranges, and `while` features an optional continue expression `: (step += 1)` to prevent infinite loop errors."
  },
  "blocks_as_expressions": {
    "num": "06",
    "title": "Blocks as Expressions & Labeled Breaks",
    "part": "Part 1: The Core Mental Model & Syntax Jump",
    "desc": "Every block `{}` can return a value using `break :label value`. Eliminating immediate IIFEs and ternary nests.",
    "nodeCode": "// JavaScript / TypeScript:\nconst config = (() => {\n    const env = \"production\";\n    if (env === \"production\") return { timeout: 5000, secure: true };\n    return { timeout: 1000, secure: false };\n})();\nconsole.log(config);",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    const is_production = true;\n\n    // Labeled block returning a value! No IIFE or lambda overhead.\n    const timeout_ms: u32 = timeout_block: {\n        if (is_production) {\n            break :timeout_block 5000;\n        } else {\n            break :timeout_block 1000;\n        }\n    };\n\n    std.debug.print(\"Computed timeout: {}ms\\n\", .{timeout_ms});\n}",
    "why": "JavaScript developers constantly use IIFEs `(() => { ... })()` or complex nested ternaries to initialize complex `const` values. Zig lets any labeled block return a value cleanly via `break :label val`."
  },
  "errors_as_values": {
    "num": "07",
    "title": "Error Sets & Return Tracing",
    "part": "Part 2: Robust Error Handling Without Exceptions",
    "desc": "Zig has NO exceptions, NO throw/catch, and NO null errors. Error sets `error{...}` are typed integer enums with stack traces.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction parseAge(str: string): number {\n    const val = parseInt(str, 10);\n    if (isNaN(val)) throw new Error(\"Invalid number\");\n    if (val < 0) throw new Error(\"Age cannot be negative\");\n    return val;\n}\n\ntry {\n    console.log(parseAge(\"-5\"));\n} catch (err: any) {\n    console.error(\"Caught error:\", err.message);\n}",
    "code": "const std = @import(\"std\");\n\n// Define an explicit Error Set\nconst AgeError = error{\n    InvalidFormat,\n    NegativeAge,\n    TooOld,\n};\n\nfn parseAge(input: []const u8) AgeError!u32 {\n    const val = std.fmt.parseInt(i32, input, 10) catch {\n        return AgeError.InvalidFormat;\n    };\n    if (val < 0) return AgeError.NegativeAge;\n    if (val > 150) return AgeError.TooOld;\n    return @intCast(val);\n}\n\npub fn main() void {\n    const res = parseAge(\"-5\");\n    if (res) |age| {\n        std.debug.print(\"Age: {}\\n\", .{age});\n    } else |err| {\n        std.debug.print(\"Handled error: {s}\\n\", .{@errorName(err)});\n    }\n}",
    "why": "In Node.js, `throw new Error()` creates expensive stack traces, disrupts control flow, and can escape silently if not wrapped in `try/catch`. Zig treats errors as typed values (`!T`), enforced at compile time."
  },
  "try_and_catch": {
    "num": "08",
    "title": "The `try` Operator & Fallback `catch`",
    "part": "Part 2: Robust Error Handling Without Exceptions",
    "desc": "Propagating errors effortlessly with `try` (shorthand for `catch |err| return err`) vs default fallbacks with `catch value`.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction getPort(): number {\n    try {\n        return parseInt(process.env.PORT || \"8080\", 10);\n    } catch {\n        return 8080;\n    }\n}",
    "code": "const std = @import(\"std\");\n\nfn parseConfigPort(raw: []const u8) !u16 {\n    // 'try' propagates the error up the call stack immediately\n    const port = try std.fmt.parseInt(u16, raw, 10);\n    return port;\n}\n\npub fn main() void {\n    // 'catch' provides an inline fallback default value!\n    const valid = parseConfigPort(\"9090\") catch 8080;\n    const fallback = parseConfigPort(\"invalid_port\") catch 8080;\n\n    std.debug.print(\"Valid port: {}, Fallback port: {}\\n\", .{ valid, fallback });\n}",
    "why": "In JS, `try/catch` wraps entire code blocks, obfuscating which call failed. In Zig, `try expr` concisely propagates failures up the call stack, while `expr catch fallback` supplies safe defaults on a single line."
  },
  "defer_and_errdefer": {
    "num": "09",
    "title": "Resource Cleanup: `defer` & `errdefer`",
    "part": "Part 2: Robust Error Handling Without Exceptions",
    "desc": "Deterministic RAII-style cleanup without garbage collection. `errdefer` executes only on error exit paths.",
    "nodeCode": "// JavaScript / TypeScript:\nlet resource = null;\ntry {\n    resource = acquireResource();\n    doSomething(resource);\n} catch (err) {\n    rollback(resource);\n    throw err;\n} finally {\n    if (resource) resource.cleanup();\n}",
    "code": "const std = @import(\"std\");\n\nfn processTransaction(should_fail: bool) !void {\n    std.debug.print(\"1. Transaction opened\\n\", .{});\n    \n    // errdefer runs ONLY if the function returns an error!\n    errdefer std.debug.print(\"--> ROLLBACK executed due to error!\\n\", .{});\n\n    // defer runs unconditionally whenever the scope exits!\n    defer std.debug.print(\"2. Cleanup connections (always runs)\\n\", .{});\n\n    if (should_fail) {\n        return error.DatabaseCorrupted;\n    }\n    std.debug.print(\"3. Commit successfully completed\\n\", .{});\n}\n\npub fn main() void {\n    std.debug.print(\"--- Success Case ---\\n\", .{});\n    processTransaction(false) catch {};\n\n    std.debug.print(\"\\n--- Failure Case ---\\n\", .{});\n    processTransaction(true) catch {};\n}",
    "why": "In Node.js, `finally` blocks handle cleanup, but rolling back partial transactions on errors requires manual tracking variables. Zig's `defer` and `errdefer` bind cleanup directly next to the allocation site."
  },
  "inferred_error_sets": {
    "num": "10",
    "title": "Inferred Error Sets `!T` & Anyerror",
    "part": "Part 2: Robust Error Handling Without Exceptions",
    "desc": "How the Zig compiler infers the exact union of all possible error variants returned across functions.",
    "nodeCode": "// JavaScript / TypeScript:\n// Any async or sync JS function can throw ANY untyped exception\nasync function fetchUser(id: string) {\n    // throws NetworkError, ValidationError, or DatabaseError\n}",
    "code": "const std = @import(\"std\");\n\nfn readInt() !i32 {\n    return error.DiskFull;\n}\n\nfn readFloat() !f32 {\n    return error.CorruptedHeader;\n}\n\n// Return type '!void' lets the compiler infer the error union set\nfn runWorkflow() !void {\n    _ = try readInt();\n    _ = try readFloat();\n}\n\npub fn main() void {\n    if (runWorkflow()) {\n        std.debug.print(\"Success\\n\", .{});\n    } else |err| {\n        std.debug.print(\"Captured inferred error: {s}\\n\", .{@errorName(err)});\n    }\n}",
    "why": "TypeScript can use `Promise<User>` or `Result<T, E>`, but TypeScript's type system cannot check unhandled thrown exceptions. Zig's `!T` lets the compiler compute the exact closed set of errors automatically."
  },
  "optionals_null": {
    "num": "11",
    "title": "Optionals `?T` vs Undefined vs Null",
    "part": "Part 3: Optionals, Pointers & Memory Safety",
    "desc": "Zig has NO implicit null pointers. Nullable types must be declared as `?T`. Safe unwrap with `orelse` and `if (opt) |val|`.",
    "nodeCode": "// JavaScript / TypeScript:\nlet username: string | null = null;\nif (Math.random() > 0.5) username = \"alice\";\n\n// Potential runtime TypeError: Cannot read property 'toUpperCase' of null\nconsole.log(username ? username.toUpperCase() : \"ANONYMOUS\");",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    // In Zig, null can ONLY be assigned to optional types ?T\n    var maybe_user: ?[]const u8 = null;\n    maybe_user = \"alice\";\n\n    // Method 1: 'orelse' provides an unwrapped fallback\n    const resolved = maybe_user orelse \"anonymous\";\n    std.debug.print(\"User via orelse: {s}\\n\", .{resolved});\n\n    // Method 2: 'if (opt) |unwrapped|' payload capturing\n    if (maybe_user) |name| {\n        std.debug.print(\"Hello, {s}!\\n\", .{name});\n    } else {\n        std.debug.print(\"Guest login\\n\", .{});\n    }\n}",
    "why": "JavaScript has both `null` and `undefined`, and any variable can unexpectedly become null at runtime. In Zig, regular pointers and primitives can NEVER be null. Optional types `?T` enforce explicit unwrapping."
  },
  "pointers_basics": {
    "num": "12",
    "title": "Single Pointers `*T` vs Many Pointers `[*]T`",
    "part": "Part 3: Optionals, Pointers & Memory Safety",
    "desc": "Demystifying pointers: address-of `&x`, dereferencing `ptr.*`, and const correctness `*const T`.",
    "nodeCode": "// JavaScript / TypeScript:\n// JS hides pointers. Objects are passed by reference, numbers by value!\nfunction incrementCounter(state: { count: number }) {\n    state.count += 1;\n}\nconst s = { count: 0 };\nincrementCounter(s);\nconsole.log(s.count); // 1",
    "code": "const std = @import(\"std\");\n\nfn increment(counter_ptr: *u32) void {\n    // Dereference using '.*'\n    counter_ptr.* += 1;\n}\n\npub fn main() void {\n    var count: u32 = 0;\n    \n    // Address-of operator '&' creates a pointer\n    increment(&count);\n    increment(&count);\n\n    std.debug.print(\"Updated count: {}\\n\", .{count});\n}",
    "why": "JavaScript hides whether data is copied or referenced behind engine heuristics. In Zig, references are explicit: `*T` is a pointer to exactly one item, and `ptr.*` explicitly dereferences it."
  },
  "memory_layout_structs": {
    "num": "13",
    "title": "Structs, Memory Layout & Packed Structs",
    "part": "Part 3: Optionals, Pointers & Memory Safety",
    "desc": "Defining typed data models. Struct methods, dot-syntax calling, and `packed struct` for exact binary hardware layouts.",
    "nodeCode": "// JavaScript / TypeScript:\ninterface UserProfile {\n    id: number;\n    username: string;\n    isActive: boolean;\n}\nconst user: UserProfile = { id: 1, username: \"nadim\", isActive: true };",
    "code": "const std = @import(\"std\");\n\nconst User = struct {\n    id: u64,\n    username: []const u8,\n    is_active: bool,\n\n    // Methods in Zig are simply functions with self: *const User or self: User\n    pub fn greet(self: User) void {\n        std.debug.print(\"User #{} ({s}) is active: {}\\n\", .{\n            self.id, self.username, self.is_active\n        });\n    }\n};\n\npub fn main() void {\n    const user = User{\n        .id = 42,\n        .username = \"tuhin\",\n        .is_active = true,\n    };\n    user.greet();\n}",
    "why": "V8 allocates JS objects with hidden Shape/HiddenClass pointers, property backing stores, and boxing overhead. A Zig struct has zero runtime overhead: it's pure contiguous memory laid out according to CPU alignment."
  },
  "tagged_unions": {
    "num": "14",
    "title": "Tagged Unions vs TypeScript Discriminated Unions",
    "part": "Part 3: Optionals, Pointers & Memory Safety",
    "desc": "Pattern matching with `union(enum)` and `switch`. Memory efficiency where fields share overlapping storage.",
    "nodeCode": "// JavaScript / TypeScript:\ntype WebEvent = \n    | { type: 'click'; x: number; y: number }\n    | { type: 'keypress'; key: string }\n    | { type: 'quit' };\n\nfunction handle(event: WebEvent) {\n    switch (event.type) {\n        case 'click': console.log(event.x, event.y); break;\n        case 'keypress': console.log(event.key); break;\n        case 'quit': break;\n    }\n}",
    "code": "const std = @import(\"std\");\n\nconst WebEvent = union(enum) {\n    click: struct { x: i32, y: i32 },\n    keypress: u8,\n    quit: void,\n};\n\nfn handleEvent(event: WebEvent) void {\n    switch (event) {\n        .click => |pos| std.debug.print(\"Click at ({}, {})\\n\", .{ pos.x, pos.y }),\n        .keypress => |k| std.debug.print(\"Key pressed: '{c}'\\n\", .{k}),\n        .quit => std.debug.print(\"App quitting...\\n\", .{}),\n    }\n}\n\npub fn main() void {\n    const ev = WebEvent{ .click = .{ .x = 100, .y = 250 } };\n    handleEvent(ev);\n}",
    "why": "TypeScript discriminated unions use JS objects with `{ type: 'foo', ... }`, consuming heap allocations and GC cycles. Zig's `union(enum)` stores all variant fields in the same overlapping memory plus a 1-byte enum tag."
  },
  "allocators_philosophy": {
    "num": "15",
    "title": "The Allocator Philosophy: No Hidden Heap",
    "part": "Part 4: Explicit Memory Management & Allocators",
    "desc": "Why Zig functions that need memory take `std.mem.Allocator`. GeneralPurposeAllocator, ArenaAllocator, and FixedBufferAllocator.",
    "nodeCode": "// JavaScript / TypeScript:\n// In JS, everything implicitly allocates memory behind your back!\nconst map = new Map();\nconst arr = [1, 2, 3]; // Hidden V8 heap allocation!",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    // Standard General Purpose Allocator with leak detection\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n    const allocator = gpa.allocator();\n\n    // Allocate a dynamic slice of integers on the heap\n    const slice = try allocator.alloc(i32, 5);\n    defer allocator.free(slice); // Always clean up!\n\n    for (slice, 0..) |*item, idx| {\n        item.* = @intCast(idx * 10);\n    }\n\n    std.debug.print(\"Allocated items: {any}\\n\", .{slice});\n}",
    "why": "In Go or Node.js, runtime memory allocation happens silently via `new` or literals, triggering periodic GC pauses. In Zig, NO function allocates heap memory without explicitly accepting an `allocator: std.mem.Allocator` parameter."
  },
  "arena_allocator": {
    "num": "16",
    "title": "Arena Allocator: High-Speed Batch Deallocation",
    "part": "Part 4: Explicit Memory Management & Allocators",
    "desc": "Group dozens of allocations together and free them all with a single `arena.deinit()`. The standard pattern for HTTP requests.",
    "nodeCode": "// JavaScript / TypeScript:\n// Handling an HTTP request creates hundreds of short-lived JSON objects\n// V8 garbage collector eventually sweeps them in minor GC cycles.",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n\n    // Wrap the backing allocator in an ArenaAllocator\n    var arena = std.heap.ArenaAllocator.init(gpa.allocator());\n    defer arena.deinit(); // Frees ALL allocations made inside the arena at once!\n    const allocator = arena.allocator();\n\n    // Allocate many strings and arrays without individual free() calls!\n    const msg1 = try allocator.dupe(u8, \"Hello from request scope\");\n    const msg2 = try allocator.dupe(u8, \"Temporary parsed JSON token\");\n    const buffer = try allocator.alloc(u8, 1024);\n\n    std.debug.print(\"Arena active: {s}, {s}, buf len: {}\\n\", .{ msg1, msg2, buffer.len });\n}",
    "why": "In Node.js backend servers, every incoming JSON payload creates hundreds of temporary strings and objects that stress the V8 garbage collector. An Arena allocator allocates quickly in large blocks and frees everything in one pointer reset."
  },
  "fixed_buffer_allocator": {
    "num": "17",
    "title": "FixedBufferAllocator & Stack Memory",
    "part": "Part 4: Explicit Memory Management & Allocators",
    "desc": "Zero-syscall, zero-fragmentation allocation inside pre-allocated stack buffers. Ideal for embedded and high-performance microservices.",
    "nodeCode": "// JavaScript / TypeScript:\n// Buffer.allocUnsafe(1024) in Node.js\nconst buf = Buffer.alloc(1024);",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    // 1KB buffer allocated on the call stack\n    var stack_buffer: [1024]u8 = undefined;\n    var fba = std.heap.FixedBufferAllocator.init(&stack_buffer);\n    const allocator = fba.allocator();\n\n    // Allocates directly within the stack buffer without any OS syscalls!\n    const numbers = try allocator.alloc(u32, 4);\n    numbers[0] = 42;\n    numbers[1] = 99;\n\n    std.debug.print(\"FixedBuffer allocated values: {} {}\\n\", .{ numbers[0], numbers[1] });\n}",
    "why": "Every `malloc` or V8 heap growth invokes OS kernel syscalls (`mmap` or `brk`). `FixedBufferAllocator` carves slices from a local stack array with zero syscalls and deterministic execution time."
  },
  "memory_leak_detection": {
    "num": "18",
    "title": "Built-In Memory Leak Detection",
    "part": "Part 4: Explicit Memory Management & Allocators",
    "desc": "How Zig's testing harness and GPA catch use-after-free, double-free, and memory leaks automatically during development.",
    "nodeCode": "// JavaScript / TypeScript:\n// Node.js memory leaks (unclosed listeners, global caches) require heapdump,\n// Chrome DevTools profiles, and complex post-mortems to locate.",
    "code": "const std = @import(\"std\");\n\ntest \"detect memory leaks automatically\" {\n    // std.testing.allocator fails the test if any byte is not freed!\n    const allocator = std.testing.allocator;\n\n    const data = try allocator.alloc(u8, 64);\n    // Intentional memory leak if we omit: defer allocator.free(data);\n    defer allocator.free(data);\n\n    try std.testing.expect(data.len == 64);\n}\n\npub fn main() void {\n    std.debug.print(\"Run 'zig test main.zig' to verify leak detection!\\n\", .{});\n}",
    "why": "In Node.js, tracking down memory leaks requires taking heap snapshots with `--inspect` and diffing memory trees. In Zig, `std.testing.allocator` runs on every test and fails the build with stack traces if a single byte leaks."
  },
  "comptime_intro": {
    "num": "19",
    "title": "What is `comptime`? Type Generation Without Macros",
    "part": "Part 5: Comptime \u2014 The Superpower of Zig",
    "desc": "Running arbitrary Zig code at compile time. Eliminating C preprocessor macros, C++ templates, and runtime reflection.",
    "nodeCode": "// JavaScript / TypeScript:\n// TS generics disappear at runtime. Dynamic code generation requires eval()\nfunction createPair<T>(a: T, b: T): [T, T] {\n    return [a, b];\n}",
    "code": "const std = @import(\"std\");\n\n// Functions that take or return types execute at compile time!\nfn List(comptime T: type) type {\n    return struct {\n        items: [4]T,\n        len: usize = 0,\n\n        pub fn add(self: *@This(), item: T) void {\n            if (self.len < 4) {\n                self.items[self.len] = item;\n                self.len += 1;\n            }\n        }\n    };\n}\n\npub fn main() void {\n    // Generate an IntList struct at compile time!\n    var int_list = List(i32){ .items = undefined };\n    int_list.add(10);\n    int_list.add(20);\n\n    std.debug.print(\"List len: {}, first item: {}\\n\", .{ int_list.len, int_list.items[0] });\n}",
    "why": "In TypeScript, generic type parameters are erased during compilation, leaving no type info at runtime. In C++, templates use cryptic metaprogramming syntax. In Zig, generic types are plain functions executed at compile time."
  },
  "comptime_reflection": {
    "num": "20",
    "title": "Type Reflection with `@typeInfo` & `@typeName`",
    "part": "Part 5: Comptime \u2014 The Superpower of Zig",
    "desc": "Inspecting struct fields, enums, and signatures at compile time. Building zero-overhead serializers without runtime `Reflect`.",
    "nodeCode": "// JavaScript / TypeScript:\nconst obj = { id: 1, name: \"Node\" };\n// Runtime object keys inspection via V8 reflection\nconsole.log(Object.keys(obj));",
    "code": "const std = @import(\"std\");\n\nfn printFields(comptime T: type) void {\n    const info = @typeInfo(T);\n    switch (info) {\n        .@\"struct\" => |s| {\n            inline for (s.fields) |field| {\n                std.debug.print(\"Field: {s} (type: {s})\\n\", .{\n                    field.name, @typeName(field.type)\n                });\n            }\n        },\n        else => @compileError(\"Expected a struct type!\"),\n    }\n}\n\nconst Config = struct {\n    port: u16,\n    hostname: []const u8,\n    ssl_enabled: bool,\n};\n\npub fn main() void {\n    printFields(Config);\n}",
    "why": "In Node.js, `Object.entries()`, `JSON.stringify()`, and decorator metadata reflect on properties at runtime, consuming CPU on every invocation. Zig's `@typeInfo` analyzes types at compile time, generating unrolled machine code."
  },
  "compile_time_assertions": {
    "num": "21",
    "title": "`@compileError` & Comptime Assertions",
    "part": "Part 5: Comptime \u2014 The Superpower of Zig",
    "desc": "Catching bugs before the binary even links. Enforcing architectural rules, struct sizes, and environment constraints.",
    "nodeCode": "// JavaScript / TypeScript:\n// In JS/TS, assertions run at runtime when the function is invoked\nfunction validateBuffer(size: number) {\n    if (size % 64 !== 0) throw new Error(\"Size must be multiple of 64\");\n}",
    "code": "const std = @import(\"std\");\n\nfn createRingBuffer(comptime capacity: usize) type {\n    // Validate capacity at COMPILE TIME!\n    if (capacity == 0) {\n        @compileError(\"RingBuffer capacity cannot be zero!\");\n    }\n    if ((capacity & (capacity - 1)) != 0) {\n        @compileError(\"RingBuffer capacity must be a power of 2 for fast bitwise indexing!\");\n    }\n\n    return struct {\n        data: [capacity]u8,\n    };\n}\n\npub fn main() void {\n    const Buffer16 = createRingBuffer(16);\n    const buf = Buffer16{ .data = [_]u8{0} ** 16 };\n    std.debug.print(\"Ring buffer created with capacity: {}\\n\", .{buf.data.len});\n}",
    "why": "TypeScript can enforce types, but cannot validate value constraints like 'buffer size must be a power of two' or 'port must be between 1 and 65535'. Zig's `@compileError` stops the compiler instantly with custom error messages."
  },
  "generics_in_practice": {
    "num": "22",
    "title": "Writing Generic Data Structures (Queue, HashMap)",
    "part": "Part 5: Comptime \u2014 The Superpower of Zig",
    "desc": "Step-by-step implementation of a type-safe generic RingBuffer and HashMap in idiomatic Zig.",
    "nodeCode": "// JavaScript / TypeScript:\nclass SimpleQueue<T> {\n    private items: T[] = [];\n    push(item: T) { this.items.push(item); }\n    pop(): T | undefined { return this.items.shift(); }\n}",
    "code": "const std = @import(\"std\");\n\npub fn Stack(comptime T: type) type {\n    return struct {\n        items: std.ArrayList(T),\n\n        pub fn init(allocator: std.mem.Allocator) @This() {\n            return .{ .items = std.ArrayList(T).init(allocator) };\n        }\n\n        pub fn deinit(self: *@This()) void {\n            self.items.deinit();\n        }\n\n        pub fn push(self: *@This(), value: T) !void {\n            try self.items.append(value);\n        }\n\n        pub fn pop(self: *@This()) ?T {\n            return self.items.popOrNull();\n        }\n    };\n}\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n\n    var num_stack = Stack(i32).init(gpa.allocator());\n    defer num_stack.deinit();\n\n    try num_stack.push(10);\n    try num_stack.push(20);\n\n    std.debug.print(\"Popped item: {?}\\n\", .{num_stack.pop()});\n}",
    "why": "TypeScript classes with generics are runtime prototypes. Zig's generic patterns instantiate concrete structs tailored to the exact type `T`, generating optimal cache-friendly assembly for integers, structs, or pointers."
  },
  "arraylist": {
    "num": "23",
    "title": "`std.ArrayList` Dynamic Arrays",
    "part": "Part 6: Standard Library & Essential Collections",
    "desc": "The Zig equivalent to JavaScript's `Array`. Appending, popping, capacity pre-allocation (`ensureTotalCapacity`), and memory ownership.",
    "nodeCode": "// JavaScript / TypeScript:\nconst list = [];\nlist.push(\"apple\");\nlist.push(\"banana\");\nconsole.log(list.length, list[0]);",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n    const allocator = gpa.allocator();\n\n    // std.ArrayList requires an allocator for dynamic resizing\n    var fruits = std.ArrayList([]const u8).init(allocator);\n    defer fruits.deinit();\n\n    try fruits.append(\"apple\");\n    try fruits.append(\"banana\");\n\n    std.debug.print(\"Count: {}, First: {s}\\n\", .{ fruits.items.len, fruits.items[0] });\n}",
    "why": "JavaScript arrays dynamically resize, causing V8 to reallocate and copy elements behind the scenes. In Zig, `ArrayList(T)` gives you explicit control over capacity with `.ensureTotalCapacity()`, avoiding redundant allocations."
  },
  "hashmap": {
    "num": "24",
    "title": "`std.StringHashMap` & `std.AutoHashMap`",
    "part": "Part 6: Standard Library & Essential Collections",
    "desc": "Key-value dictionaries without `new Map()`. Wyhash algorithm, entry API, and key allocation caveats.",
    "nodeCode": "// JavaScript / TypeScript:\nconst userRoles = new Map<string, string>();\nuserRoles.set(\"alice\", \"admin\");\nconsole.log(userRoles.get(\"alice\")); // admin",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n    const allocator = gpa.allocator();\n\n    // std.StringHashMap for string keys ([]const u8)\n    var roles = std.StringHashMap([]const u8).init(allocator);\n    defer roles.deinit();\n\n    try roles.put(\"alice\", \"admin\");\n    try roles.put(\"bob\", \"viewer\");\n\n    if (roles.get(\"alice\")) |role| {\n        std.debug.print(\"Alice's role: {s}\\n\", .{role});\n    }\n}",
    "why": "JavaScript's `Map` uses an internal hash table managed by V8. Zig provides `AutoHashMap(K, V)` for numbers and structs, and `StringHashMap(V)` for string slices using high-performance hashing (Wyhash)."
  },
  "file_io": {
    "num": "25",
    "title": "File I/O: Reading & Writing Streams",
    "part": "Part 6: Standard Library & Essential Collections",
    "desc": "Replacing `node:fs` / `fs.promises`. Working with directory handles, buffered readers, and binary file operations.",
    "nodeCode": "// JavaScript / TypeScript:\nimport * as fs from 'node:fs/promises';\nawait fs.writeFile('sample.txt', 'Hello Node.js');\nconst text = await fs.readFile('sample.txt', 'utf-8');\nconsole.log(text);",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    // Current working directory handle\n    const cwd = std.fs.cwd();\n\n    // Write to a file\n    const file = try cwd.createFile(\"greeting.txt\", .{});\n    defer file.close();\n    try file.writeAll(\"Hello from Zig File I/O!\\n\");\n\n    // Read back from file into a local buffer\n    var read_buf: [128]u8 = undefined;\n    const read_file = try cwd.openFile(\"greeting.txt\", .{});\n    defer read_file.close();\n    const bytes_read = try read_file.readAll(&read_buf);\n\n    std.debug.print(\"Read {s}\", .{read_buf[0..bytes_read]});\n}",
    "why": "Node.js `fs.readFile()` passes buffers through libuv worker threads and V8. Zig interacts with operating system file descriptors directly via synchronous syscalls or platform-specific event loops."
  },
  "formatting_and_printing": {
    "num": "26",
    "title": "Formatting & String Building with `std.fmt`",
    "part": "Part 6: Standard Library & Essential Collections",
    "desc": "Zig's `std.fmt.allocPrint` vs template literals. Format specifiers: `{s}`, `{}`, `{x}`, `{d:.2}`, and custom formatters.",
    "nodeCode": "// JavaScript / TypeScript:\nconst name = \"Alice\";\nconst score = 98.456;\nconst message = `Player ${name}: score is ${score.toFixed(2)}`;\nconsole.log(message);",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n    const allocator = gpa.allocator();\n\n    const name = \"Alice\";\n    const score: f64 = 98.456;\n\n    // Allocate formatted string on heap\n    const formatted = try std.fmt.allocPrint(\n        allocator,\n        \"Player {s}: score is {d:.2}\",\n        .{ name, score }\n    );\n    defer allocator.free(formatted);\n\n    std.debug.print(\"Formatted output: {s}\\n\", .{formatted});\n}",
    "why": "JavaScript template literals `${...}` silently convert types to strings and concatenate on the heap. Zig's format engine is type-checked at compile time: passing an integer to a `{s}` string specifier fails compilation immediately."
  },
  "threads_basics": {
    "num": "27",
    "title": "Native OS Threads with `std.Thread`",
    "part": "Part 7: Concurrency & Async in Zig",
    "desc": "True multi-threading without the overhead of Node.js `worker_threads`. Spawning threads and joining handles.",
    "nodeCode": "// JavaScript / TypeScript:\n// In Node.js, worker_threads spawn separate V8 isolates with heavy memory footprint\nimport { Worker } from 'node:worker_threads';\n// new Worker('./worker.js');",
    "code": "const std = @import(\"std\");\n\nfn backgroundWorker(id: usize, count: usize) void {\n    std.debug.print(\"[Thread {}] Starting calculation...\\n\", .{id});\n    var sum: usize = 0;\n    var i: usize = 0;\n    while (i < count) : (i += 1) {\n        sum += i;\n    }\n    std.debug.print(\"[Thread {}] Finished with sum: {}\\n\", .{ id, sum });\n}\n\npub fn main() !void {\n    const thread1 = try std.Thread.spawn(.{}, backgroundWorker, .{ 1, 100000 });\n    const thread2 = try std.Thread.spawn(.{}, backgroundWorker, .{ 2, 200000 });\n\n    thread1.join();\n    thread2.join();\n    std.debug.print(\"All native worker threads completed.\\n\", .{});\n}",
    "why": "Node.js runs on a single main thread, using `worker_threads` that duplicate V8 engine instances (~30MB RAM each). Zig threads are native OS threads spawned with minimal stack overhead (< 100KB), sharing memory directly."
  },
  "atomics_and_mutexes": {
    "num": "28",
    "title": "Mutexes & Atomic Operations (`std.Thread.Mutex`)",
    "part": "Part 7: Concurrency & Async in Zig",
    "desc": "Preventing data races when threads share state. Atomic integers vs Mutex locking vs Node.js single-thread model.",
    "nodeCode": "// JavaScript / TypeScript:\n// Node.js is single-threaded, so ++counter is atomic within a single tick.\n// In multi-threaded systems, concurrent += causes race conditions!",
    "code": "const std = @import(\"std\");\n\nvar counter: usize = 0;\nvar mutex = std.Thread.Mutex{};\n\nfn increment() void {\n    var i: usize = 0;\n    while (i < 1000) : (i += 1) {\n        mutex.lock();\n        defer mutex.unlock(); // Guaranteed unlock on scope exit!\n        counter += 1;\n    }\n}\n\npub fn main() !void {\n    const t1 = try std.Thread.spawn(.{}, increment, .{});\n    const t2 = try std.Thread.spawn(.{}, increment, .{});\n\n    t1.join();\n    t2.join();\n    std.debug.print(\"Final thread-safe counter: {}\\n\", .{counter});\n}",
    "why": "JavaScript developers never have to worry about mutexes because V8 runs on a single event loop tick. In multi-threaded Zig, mutable shared state requires locking with `std.Thread.Mutex` or `std.atomic.Value`."
  },
  "channel_patterns": {
    "num": "29",
    "title": "Thread Synchronization & Channels",
    "part": "Part 7: Concurrency & Async in Zig",
    "desc": "Building Go-style CSP channels and message queues in Zig using Condition Variables and Ring Buffers.",
    "nodeCode": "// JavaScript / TypeScript:\n// MessagePort in Node.js worker_threads\n// port.postMessage({ task: 'process' });",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    // Demonstration of thread synchronization using Semaphore / WaitGroup\n    var reset_event = std.Thread.ResetEvent{};\n\n    const worker = try std.Thread.spawn(.{}, struct {\n        fn run(ev: *std.Thread.ResetEvent) void {\n            std.debug.print(\"Worker waiting for signal...\\n\", .{});\n            ev.wait();\n            std.debug.print(\"Worker received trigger!\\n\", .{});\n        }\n    }.run, .{&reset_event});\n\n    std.time.sleep(std.time.ns_per_ms * 10);\n    reset_event.set();\n    worker.join();\n}",
    "why": "In Go, goroutines communicate via built-in channels. In Zig, synchronization primitives (`Condition`, `Semaphore`, `ResetEvent`) give you granular control over locking and wakeup signaling without runtime scheduler baggage."
  },
  "event_loops_in_zig": {
    "num": "30",
    "title": "Event Loops & Async I/O (epoll / kqueue / io_uring)",
    "part": "Part 7: Concurrency & Async in Zig",
    "desc": "Understanding how Node.js libuv works under the hood and how Zig libraries (like `tigerbeetle`, `zap`, `httpz`) achieve millions of req/sec.",
    "nodeCode": "// JavaScript / TypeScript:\n// Node.js uses libuv event loop under the hood\nconst http = require('node:http');\nhttp.createServer((req, res) => res.end('OK')).listen(3000);",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Zig builds lightning-fast servers by driving OS event rings (io_uring on Linux, kqueue on macOS, IOCP on Windows)\\n\", .{});\n    std.debug.print(\"No V8 garbage collector pauses, zero-copy buffer pools, and deterministic latency!\\n\", .{});\n}",
    "why": "Node.js libuv manages an event loop with epoll/kqueue. In Zig, frameworks like `httpz` and `zap` (or TigerBeetle's storage engine) interact with kernel completion rings directly (`io_uring`), skipping JS context switches."
  },
  "c_interop_basics": {
    "num": "31",
    "title": "Zero-Overhead C Interoperability: `@cImport`",
    "part": "Part 8: Interoperability with C & Node.js Native Addons",
    "desc": "Zig is a full C compiler! Directly include `.h` files without wrapper code, bindings generators, or CMake.",
    "nodeCode": "// JavaScript / TypeScript:\n// Calling C in Node.js requires node-gyp, C++ addon boilerplate, or node:ffi-napi",
    "code": "const std = @import(\"std\");\n\n// Zig includes a built-in Clang C frontend!\n// Directly import standard C libraries or third-party C headers\nconst c = @cImport({\n    @cInclude(\"stdlib.h\");\n    @cInclude(\"string.h\");\n});\n\npub fn main() void {\n    const message = \"Hello from C stdlib!\";\n    const length = c.strlen(message);\n    std.debug.print(\"C strlen: {}\\n\", .{length});\n\n    // Call C abs()\n    const diff = c.abs(-42);\n    std.debug.print(\"C abs: {}\\n\", .{diff});\n}",
    "why": "In Node.js, calling C/C++ requires compiling complex N-API addons with `node-gyp` and Python. Zig is a drop-in C compiler: you can `@cImport` any C header and call functions directly with zero overhead."
  },
  "napi_addons": {
    "num": "32",
    "title": "Building High-Speed Node-API Addons in Zig",
    "part": "Part 8: Interoperability with C & Node.js Native Addons",
    "desc": "Exporting shared libraries (`.node` / `.dylib`) that Node.js can require directly via `node:process` without `node-gyp`.",
    "nodeCode": "// JavaScript / TypeScript:\n// In Node.js:\n// const addon = require('./build/Release/my_zig_addon.node');\n// console.log(addon.fastHash(\"large input data\"));",
    "code": "const std = @import(\"std\");\n\n// Export C ABI functions that Node-API or dlopen can call\nexport fn addNumbers(a: i32, b: i32) i32 {\n    return a + b;\n}\n\nexport fn fastMultiply(a: f64, b: f64) f64 {\n    return a * b;\n}\n\npub fn main() void {\n    std.debug.print(\"Exported C ABI symbols ready for Node-API integration!\\n\", .{});\n}",
    "why": "Writing Node-API addons in C++ requires managing complex `v8::Local<Value>` handles and enduring slow `node-gyp` builds. In Zig, you can compile native `.node` addons in seconds with pure `zig build-lib`."
  },
  "wasm_compilation": {
    "num": "33",
    "title": "Compiling Zig to WebAssembly (Wasm) for Node.js & Browsers",
    "part": "Part 8: Interoperability with C & Node.js Native Addons",
    "desc": "Targeting `wasm32-freestanding`. Generating ultra-compact 2KB Wasm binaries executable in Node.js and browsers.",
    "nodeCode": "// JavaScript / TypeScript:\n// In Node.js or Browser:\n// const wasm = await WebAssembly.instantiate(fs.readFileSync('module.wasm'));\n// console.log(wasm.instance.exports.calculateTotal(10, 5));",
    "code": "const std = @import(\"std\");\n\n// Exported to WebAssembly without any OS libc dependency\nexport fn fibonacci(n: u32) u32 {\n    if (n <= 1) return n;\n    var a: u32 = 0;\n    var b: u32 = 1;\n    var i: u32 = 2;\n    while (i <= n) : (i += 1) {\n        const next = a + b;\n        a = b;\n        b = next;\n    }\n    return b;\n}\n\npub fn main() void {\n    std.debug.print(\"Compiled for WebAssembly targets (wasm32-freestanding)\\n\", .{});\n}",
    "why": "Compiling Rust to Wasm often requires `wasm-bindgen` and `wasm-pack`. Zig compiles directly to `wasm32-freestanding` out of the box with zero external dependencies, producing tiny, highly-optimized binaries."
  },
  "cross_compilation": {
    "num": "34",
    "title": "Universal Cross-Compilation: `zig cc` as a Superpower",
    "part": "Part 8: Interoperability with C & Node.js Native Addons",
    "desc": "Cross-compiling from macOS to Linux x86_64 or ARM64 with a single flag. Why Bun and Uber use Zig for C/C++ builds.",
    "nodeCode": "// JavaScript / TypeScript:\n// Cross-compiling native Node modules (e.g., sharp, sqlite3) for Docker/AWS Lambda\n// typically requires setting up multi-arch Docker builders or QEMU emulators.",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Zig embeds libc headers for all major operating systems and architectures!\\n\", .{});\n    std.debug.print(\"Cross-compile for Linux with: zig build -Dtarget=x86_64-linux-musl\\n\", .{});\n    std.debug.print(\"Cross-compile for Windows with: zig build -Dtarget=x86_64-windows-gnu\\n\", .{});\n}",
    "why": "Building native code for Linux on a Mac typically requires Docker or cross-compilation toolchains that take hours to configure. Zig bundles headers and source for musl and glibc across dozens of targets."
  },
  "build_zig": {
    "num": "35",
    "title": "The `build.zig` System: Zig as Its Own Make/Webpack",
    "part": "Part 9: Testing, Tooling & The Build System",
    "desc": "Why Zig has no YAML, Makefiles, CMake, or npm scripts. Writing build pipelines and dependency graphs in pure Zig.",
    "nodeCode": "// JavaScript / TypeScript:\n// package.json:\n// { \"scripts\": { \"build\": \"tsc && vite build\", \"test\": \"vitest\" } }",
    "code": "const std = @import(\"std\");\n\n// In build.zig:\npub fn build(b: *std.Build) void {\n    const target = b.standardTargetOptions(.{});\n    const optimize = b.standardOptimizeOption(.{});\n\n    const exe = b.addExecutable(.{\n        .name = \"my_app\",\n        .root_source_file = b.path(\"src/main.zig\"),\n        .target = target,\n        .optimize = optimize,\n    });\n\n    b.installArtifact(exe);\n}\n\npub fn main() void {\n    std.debug.print(\"build.zig defines full compilation graphs with type safety!\\n\", .{});\n}",
    "why": "Node.js developers juggle `package.json`, `webpack.config.js`, `tsconfig.json`, and bash scripts. Zig replaces all build tooling with `build.zig`, written in the exact same language with full type safety and IDE autocompletion."
  },
  "zig_package_manager": {
    "num": "36",
    "title": "The Zig Package Manager (`build.zig.zon`)",
    "part": "Part 9: Testing, Tooling & The Build System",
    "desc": "`build.zig.zon` vs `package.json`. Git dependencies, package hashes, and why Zig has no bloated `node_modules`.",
    "nodeCode": "// JavaScript / TypeScript:\n// package.json + 400MB node_modules folder\n// \"dependencies\": { \"express\": \"^4.21.0\" }",
    "code": "const std = @import(\"std\");\n\n// build.zig.zon (Zig Object Notation):\n// .{\n//     .name = \"my_project\",\n//     .version = \"1.0.0\",\n//     .dependencies = .{\n//         .zap = .{\n//             .url = \"https://github.com/zigzap/zap/archive/v0.8.0.tar.gz\",\n//             .hash = \"1220...\",\n//         },\n//     },\n// }\n\npub fn main() void {\n    std.debug.print(\"build.zig.zon stores cryptographically hashed dependencies with zero runtime bloat!\\n\", .{});\n}",
    "why": "npm relies on a centralized registry and can be vulnerable to left-pad issues, prototype pollution, or rogue scripts. Zig packages are fetched by URL and verified with SHA-256 hashes, with no build-time scripts or post-install hooks."
  },
  "unit_testing": {
    "num": "37",
    "title": "Built-in Testing Framework: `zig test`",
    "part": "Part 9: Testing, Tooling & The Build System",
    "desc": "Declaring tests directly alongside implementation code with `test \"...\"`. Testing allocator, assertions, and mocks.",
    "nodeCode": "// JavaScript / TypeScript:\n// requires Jest / Vitest:\n// import { test, expect } from 'vitest';\n// test('adds 1 + 2', () => expect(1 + 2).toBe(3));",
    "code": "const std = @import(\"std\");\n\nfn add(a: i32, b: i32) i32 {\n    return a + b;\n}\n\ntest \"verify addition logic\" {\n    const result = add(1, 2);\n    try std.testing.expectEqual(@as(i32, 3), result);\n}\n\ntest \"verify string equality\" {\n    const str = \"hello\";\n    try std.testing.expectEqualStrings(\"hello\", str);\n}\n\npub fn main() void {\n    std.debug.print(\"Run 'zig test main.zig' to execute the test suite!\\n\", .{});\n}",
    "why": "In Node.js, running unit tests requires installing heavy test runners (`jest`, `vitest`, `mocha`, `ts-node`). Zig has a built-in test runner that compiles and executes tests in milliseconds without any dependencies."
  },
  "optimization_modes": {
    "num": "38",
    "title": "Build Optimization Modes: Debug, ReleaseSafe, ReleaseFast, ReleaseSmall",
    "part": "Part 9: Testing, Tooling & The Build System",
    "desc": "Choosing the right tradeoff between execution speed, binary size, and runtime safety checks.",
    "nodeCode": "// JavaScript / TypeScript:\n// NODE_ENV=production enables V8 JIT optimizations and strips React dev warnings.",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Zig optimization tiers:\\n\", .{});\n    std.debug.print(\"- Debug: Fast build, full debug symbols, safety checks enabled (default)\\n\", .{});\n    std.debug.print(\"- ReleaseSafe: High optimization, safety checks preserved\\n\", .{});\n    std.debug.print(\"- ReleaseFast: Maximum speed, safety checks disabled (raw performance)\\n\", .{});\n    std.debug.print(\"- ReleaseSmall: Minimal binary size, ideal for embedded and Wasm\\n\", .{});\n}",
    "why": "In Node.js, optimization is handled at runtime by V8's Turbofan JIT compiler. Zig gives you four explicit build modes. For production servers, `ReleaseSafe` gives high speed while retaining panic bounds checks."
  },
  "http_server_fundamentals": {
    "num": "39",
    "title": "Building a High-Performance HTTP Server",
    "part": "Part 10: Building Real-World Systems & Microservices",
    "desc": "Sockets, request parsing, and response framing. Comparing a native Zig HTTP server against Node.js Express.",
    "nodeCode": "// JavaScript / TypeScript:\nimport express from 'express';\nconst app = express();\napp.get('/health', (req, res) => res.json({ status: 'ok' }));\napp.listen(3000);",
    "code": "const std = @import(\"std\");\n\npub fn main() !void {\n    const address = try std.net.Address.parseIp4(\"127.0.0.1\", 3000);\n    var server = try address.listen(.{ .reuse_port = true });\n    defer server.deinit();\n\n    std.debug.print(\"Zig HTTP Server listening on http://127.0.0.1:3000\\n\", .{});\n    // In production, accept connections and write HTTP/1.1 response headers\n}",
    "why": "Express adds multiple layers of middleware, object creation, and GC pressure to every HTTP request. A Zig HTTP server parses request lines directly into memory slices with zero heap allocations."
  },
  "json_parsing_comptime": {
    "num": "40",
    "title": "Zero-Allocation JSON Parsing with `std.json`",
    "part": "Part 10: Building Real-World Systems & Microservices",
    "desc": "Replacing `JSON.parse` and `zod` with type-safe comptime schema deserialization.",
    "nodeCode": "// JavaScript / TypeScript:\nconst data = JSON.parse('{\"id\": 42, \"name\": \"Nadim\"}');\nconsole.log(data.id, data.name);",
    "code": "const std = @import(\"std\");\n\nconst UserPayload = struct {\n    id: u32,\n    name: []const u8,\n};\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n    const allocator = gpa.allocator();\n\n    const raw_json = \"{\"id\": 42, \"name\": \"Nadim\"}\";\n\n    // Parse JSON directly into a statically-typed struct!\n    const parsed = try std.json.parseFromSlice(\n        UserPayload,\n        allocator,\n        raw_json,\n        .{}\n    );\n    defer parsed.deinit();\n\n    std.debug.print(\"User: #{}, Name: {s}\\n\", .{ parsed.value.id, parsed.value.name });\n}",
    "why": "In Node.js, `JSON.parse()` creates untyped dynamic JS objects that require runtime validation libraries like `zod`. Zig's `std.json` parses JSON directly into your declared struct types with zero schema validation overhead."
  },
  "database_sqlite": {
    "num": "41",
    "title": "Database Persistence with SQLite & C Drivers",
    "part": "Part 10: Building Real-World Systems & Microservices",
    "desc": "Embedding SQLite directly into your Zig microservice binary with zero external daemon dependencies.",
    "nodeCode": "// JavaScript / TypeScript:\n// import Database from 'better-sqlite3';\n// const db = new Database('app.db');\n// const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Because Zig is a native C compiler, embedding SQLite is as simple as adding sqlite3.c to build.zig!\\n\", .{});\n    std.debug.print(\"No node-gyp, no Python build scripts, and no separate shared library binaries!\\n\", .{});\n}",
    "why": "In Node.js, using `better-sqlite3` requires compiling native C++ code via `node-gyp`. With Zig, you can simply drop `sqlite3.c` into your project source and compile it directly alongside your Zig code in a single command."
  },
  "graceful_shutdown": {
    "num": "42",
    "title": "Signal Handling & Graceful Shutdown",
    "part": "Part 10: Building Real-World Systems & Microservices",
    "desc": "Handling `SIGINT` (Ctrl+C) and `SIGTERM` gracefully. Draining active connections and flushing pending buffers.",
    "nodeCode": "// JavaScript / TypeScript:\nprocess.on('SIGINT', async () => {\n    console.log('Closing server...');\n    await server.close();\n    process.exit(0);\n});",
    "code": "const std = @import(\"std\");\n\nvar keep_running = true;\n\nfn handleSignal(sig: i32) callconv(.C) void {\n    _ = sig;\n    keep_running = false;\n}\n\npub fn main() !void {\n    std.debug.print(\"Signal handling in Zig allows graceful drain of server loops without abrupt exit.\\n\", .{});\n}",
    "why": "In Node.js, uncaught promises or SIGKILL can terminate processes before file buffers are flushed. Zig provides full access to POSIX signal actions (`sigaction`), allowing clean connection draining before process exit."
  },
  "docker_scratch_containers": {
    "num": "43",
    "title": "Ultra-Minimal Docker Containers (< 5MB Scratch)",
    "part": "Part 11: Production Deployment & Docker",
    "desc": "Packaging Zig microservices into zero-vulnerability `scratch` Docker containers vs 200MB+ Node.js images.",
    "nodeCode": "# Node.js Dockerfile (typically 150MB - 300MB):\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nCMD [\"node\", \"server.js\"]",
    "code": "# Zig Production Dockerfile (Statically linked, ~4MB image size!):\n# Build stage\nFROM alpine:3.20 AS builder\nRUN apk add --no-cache zig\nWORKDIR /build\nCOPY . .\nRUN zig build -Doptimize=ReleaseSafe -Dtarget=x86_64-linux-musl\n\n# Runtime stage: 100% empty scratch image!\nFROM scratch\nCOPY --from=builder /build/zig-out/bin/my_app /app\nEXPOSE 8080\nENTRYPOINT [\"/app\"]",
    "why": "Node.js containers require Linux userland, Python/build tools for npm packages, V8, and hundreds of files in `node_modules`. A statically-linked Zig binary requires literally NOTHING: it runs inside Docker's empty `scratch` image."
  },
  "ci_cd_github_actions": {
    "num": "44",
    "title": "CI/CD Workflows with GitHub Actions & Cache",
    "part": "Part 11: Production Deployment & Docker",
    "desc": "Automating `zig build`, `zig test`, and cross-platform binary releases across macOS, Linux, and Windows.",
    "nodeCode": "// GitHub Actions YAML workflow:\n// - name: Setup Zig\n//   uses: mlugg/setup-zig@v1\n//   with:\n//     version: 0.13.0\n// - run: zig build test",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Automate testing and multi-platform compilation with mlugg/setup-zig in GitHub Actions!\\n\", .{});\n}",
    "why": "Zig's fast compilation and lack of `node_modules` makes CI/CD pipelines run in seconds rather than minutes."
  },
  "observability_metrics": {
    "num": "45",
    "title": "Observability: Prometheus Metrics & Tracing",
    "part": "Part 11: Production Deployment & Docker",
    "desc": "Exposing Prometheus metrics endpoints (`/metrics`) and counting events with atomic counters.",
    "nodeCode": "// JavaScript / TypeScript:\nimport client from 'prom-client';\nconst counter = new client.Counter({ name: 'http_requests_total', help: 'Total requests' });\ncounter.inc();",
    "code": "const std = @import(\"std\");\n\nconst Metrics = struct {\n    requests_total: std.atomic.Value(usize) = std.atomic.Value(usize).init(0),\n    errors_total: std.atomic.Value(usize) = std.atomic.Value(usize).init(0),\n\n    pub fn recordRequest(self: *Metrics) void {\n        _ = self.requests_total.fetchAdd(1, .monotonic);\n    }\n};\n\npub fn main() void {\n    var metrics = Metrics{};\n    metrics.recordRequest();\n    std.debug.print(\"Metrics recorded: requests={}\\n\", .{metrics.requests_total.load(.monotonic)});\n}",
    "why": "Observability in Node.js often requires heavy APM agents (`dd-trace`, `newrelic`) that intercept V8 async hooks. In Zig, lightweight atomic counters track metrics with single-digit nanosecond overhead."
  },
  "two_sum": {
    "num": "46",
    "title": "LeetCode: Two Sum in Zig",
    "part": "Part 12: Rosetta Stone & Classic Algorithms",
    "desc": "Solving Two Sum using `std.AutoHashMap` with zero allocations on failure and O(N) runtime.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction twoSum(nums: number[], target: number): [number, number] | null {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff)!, i];\n        map.set(nums[i], i);\n    }\n    return null;\n}",
    "code": "const std = @import(\"std\");\n\nfn twoSum(allocator: std.mem.Allocator, nums: []const i32, target: i32) !?[2]usize {\n    var map = std.AutoHashMap(i32, usize).init(allocator);\n    defer map.deinit();\n\n    for (nums, 0..) |num, idx| {\n        const complement = target - num;\n        if (map.get(complement)) |prev_idx| {\n            return [2]usize{ prev_idx, idx };\n        }\n        try map.put(num, idx);\n    }\n    return null;\n}\n\npub fn main() !void {\n    var gpa = std.heap.GeneralPurposeAllocator(.{}){};\n    defer _ = gpa.deinit();\n\n    const numbers = [_]i32{ 2, 7, 11, 15 };\n    if (try twoSum(gpa.allocator(), &numbers, 9)) |res| {\n        std.debug.print(\"TwoSum indices: [{}, {}]\\n\", .{ res[0], res[1] });\n    }\n}",
    "why": "In JS, `Map` operations allocate entries on the heap. In Zig, `AutoHashMap(i32, usize)` stores keys and values in flat contiguous buffers, achieving superior cache locality and faster lookups."
  },
  "valid_parentheses": {
    "num": "47",
    "title": "LeetCode: Valid Parentheses with Fixed Stack",
    "part": "Part 12: Rosetta Stone & Classic Algorithms",
    "desc": "Stack-based parsing using a zero-allocation fixed stack array.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction isValid(s: string): boolean {\n    const stack: string[] = [];\n    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };\n    for (const char of s) {\n        if (!map[char]) stack.push(char);\n        else if (stack.pop() !== map[char]) return false;\n    }\n    return stack.length === 0;\n}",
    "code": "const std = @import(\"std\");\n\nfn isValidParentheses(input: []const u8) bool {\n    var stack_buf: [256]u8 = undefined;\n    var top: usize = 0;\n\n    for (input) |char| {\n        switch (char) {\n            '(', '{', '[' => {\n                if (top >= stack_buf.len) return false;\n                stack_buf[top] = char;\n                top += 1;\n            },\n            ')' => {\n                if (top == 0 or stack_buf[top - 1] != '(') return false;\n                top -= 1;\n            },\n            '}' => {\n                if (top == 0 or stack_buf[top - 1] != '{') return false;\n                top -= 1;\n            },\n            ']' => {\n                if (top == 0 or stack_buf[top - 1] != '[') return false;\n                top -= 1;\n            },\n            else => {},\n        }\n    }\n    return top == 0;\n}\n\npub fn main() void {\n    const is_valid = isValidParentheses(\"{[()]}\");\n    std.debug.print(\"Is valid: {}\\n\", .{is_valid});\n}",
    "why": "Solving this in Node.js allocates dynamic arrays and string characters. In Zig, we solve it using an in-place stack buffer with zero heap allocations and sub-microsecond execution time."
  },
  "reverse_linked_list": {
    "num": "48",
    "title": "LeetCode: Reverse Linked List with Pointers",
    "part": "Part 12: Rosetta Stone & Classic Algorithms",
    "desc": "Mastering pointer manipulation in Zig by reversing an in-place singly linked list.",
    "nodeCode": "// JavaScript / TypeScript:\nclass ListNode {\n    val: number;\n    next: ListNode | null = null;\n    constructor(val: number) { this.val = val; }\n}",
    "code": "const std = @import(\"std\");\n\nconst Node = struct {\n    val: i32,\n    next: ?*Node = null,\n};\n\nfn reverseList(head: ?*Node) ?*Node {\n    var prev: ?*Node = null;\n    var current = head;\n\n    while (current) |curr| {\n        const next_node = curr.next;\n        curr.next = prev;\n        prev = curr;\n        current = next_node;\n    }\n    return prev;\n}\n\npub fn main() void {\n    var n3 = Node{ .val = 3 };\n    var n2 = Node{ .val = 2, .next = &n3 };\n    var n1 = Node{ .val = 1, .next = &n2 };\n\n    const reversed = reverseList(&n1);\n    std.debug.print(\"Reversed head val: {?}\\n\", .{if (reversed) |r| r.val else null});\n}",
    "why": "Linked lists in JS allocate separate GC objects for every node. In Zig, nodes are structs linked via optional pointers `?*Node` without any garbage collection overhead."
  },
  "binary_search": {
    "num": "49",
    "title": "LeetCode: Binary Search & Slice Windows",
    "part": "Part 12: Rosetta Stone & Classic Algorithms",
    "desc": "Sub-slice indexing and integer overflow-safe midpoint calculation.",
    "nodeCode": "// JavaScript / TypeScript:\nfunction search(nums: number[], target: number): number {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
    "code": "const std = @import(\"std\");\n\nfn binarySearch(nums: []const i32, target: i32) ?usize {\n    if (nums.len == 0) return null;\n    var left: usize = 0;\n    var right: usize = nums.len;\n\n    while (left < right) {\n        // Safe midpoint calculation avoiding integer overflow\n        const mid = left + (right - left) / 2;\n        if (nums[mid] == target) {\n            return mid;\n        } else if (nums[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid;\n        }\n    }\n    return null;\n}\n\npub fn main() void {\n    const list = [_]i32{ 1, 3, 5, 7, 9, 11, 15 };\n    const idx = binarySearch(&list, 9);\n    std.debug.print(\"Found index: {?}\\n\", .{idx});\n}",
    "why": "In JS, `(left + right) / 2` produces floating-point numbers requiring `Math.floor()`. In Zig, integer division `/` truncates naturally, and `left + (right - left) / 2` avoids integer overflow bugs."
  },
  "simd_vectorization": {
    "num": "50",
    "title": "Hardware SIMD Vectorization (`@Vector`)",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Parallel CPU processing on multiple values simultaneously using Zig's first-class `@Vector` primitive.",
    "nodeCode": "// JavaScript / TypeScript:\n// Node.js processes numbers sequentially in V8 loops\nfunction addVectors(a: number[], b: number[]): number[] {\n    return a.map((val, i) => val + b[i]);\n}",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    // 4-wide 32-bit float SIMD vector\n    const Vec4 = @Vector(4, f32);\n\n    const a: Vec4 = .{ 1.0, 2.0, 3.0, 4.0 };\n    const b: Vec4 = .{ 10.0, 20.0, 30.0, 40.0 };\n\n    // CPU executes this addition in a SINGLE instruction (e.g. ADDPS)!\n    const sum = a + b;\n\n    std.debug.print(\"SIMD vector sum: {d:.1} {d:.1} {d:.1} {d:.1}\\n\", .{\n        sum[0], sum[1], sum[2], sum[3]\n    });\n}",
    "why": "JavaScript engines cannot guarantee that loops will be vectorized by JIT compilers. Zig features native `@Vector(len, T)` primitives that compile directly to AVX2, AVX-512, or ARM NEON CPU instructions."
  },
  "custom_allocator_implementation": {
    "num": "51",
    "title": "Writing a Custom Allocator from Scratch",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Implementing the `std.mem.Allocator` vtable interface to create specialized memory arenas.",
    "nodeCode": "// JavaScript / TypeScript:\n// In V8, memory allocation algorithms are locked inside the C++ runtime.\n// Developers cannot customize how V8 allocates objects.",
    "code": "const std = @import(\"std\");\n\nconst BumpAllocator = struct {\n    buffer: []u8,\n    offset: usize = 0,\n\n    pub fn allocator(self: *BumpAllocator) std.mem.Allocator {\n        return .{\n            .ptr = self,\n            .vtable = &.{\n                .alloc = allocFn,\n                .resize = resizeFn,\n                .free = freeFn,\n            },\n        };\n    }\n\n    fn allocFn(ctx: *anyopaque, len: usize, ptr_align: u8, ret_addr: usize) ?[*]u8 {\n        _ = ptr_align; _ = ret_addr;\n        const self: *BumpAllocator = @ptrCast(@alignCast(ctx));\n        if (self.offset + len > self.buffer.len) return null;\n        const res = self.buffer[self.offset..].ptr;\n        self.offset += len;\n        return res;\n    }\n\n    fn resizeFn(ctx: *anyopaque, buf: []u8, buf_align: u8, new_len: usize, ret_addr: usize) bool {\n        _ = ctx; _ = buf; _ = buf_align; _ = new_len; _ = ret_addr;\n        return false;\n    }\n\n    fn freeFn(ctx: *anyopaque, buf: []u8, buf_align: u8, ret_addr: usize) void {\n        _ = ctx; _ = buf; _ = buf_align; _ = ret_addr;\n        // Bump allocators free everything at once!\n    }\n};\n\npub fn main() void {\n    std.debug.print(\"Custom allocators allow tailor-made memory strategies for games and high-frequency trading!\\n\", .{});\n}",
    "why": "In Go or Node.js, the runtime forces a single monolithic allocator. In Zig, any data structure can implement `std.mem.Allocator`'s simple vtable interface (`alloc`, `resize`, `free`)."
  },
  "zero_cost_abstractions": {
    "num": "52",
    "title": "Zero-Cost Abstractions: Inline & Assembly",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Controlling generated assembly. `inline fn`, `asm volatile`, and examining compiled instructions.",
    "nodeCode": "// JavaScript / TypeScript:\n// JS engines decide inline heuristics unpredictably based on call frequency.",
    "code": "const std = @import(\"std\");\n\n// Force compiler to inline function at all call sites\ninline fn fastAdd(a: u32, b: u32) u32 {\n    return a + b;\n}\n\npub fn main() void {\n    const result = fastAdd(10, 25);\n    std.debug.print(\"Fast inline calculation: {}\\n\", .{result});\n}",
    "why": "In Node.js, V8 JIT inlines functions dynamically, but can de-optimize when hidden classes change. In Zig, `inline fn` guarantees inlining at compile time, eliminating function call overhead entirely."
  },
  "production_debugging_gdb_lldb": {
    "num": "53",
    "title": "Debugging with LLDB & Core Dumps",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Setting breakpoints, inspecting registers, and reading core dumps when native binaries crash.",
    "nodeCode": "// JavaScript / TypeScript:\n// In Node.js:\n// node --inspect-brk server.js (Chrome DevTools debugger)",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Compile with debug symbols using 'zig build' (Debug mode)\\n\", .{});\n    std.debug.print(\"Debug with LLDB:\\n\", .{});\n    std.debug.print(\"  lldb ./zig-out/bin/my_app\\n\", .{});\n    std.debug.print(\"  (lldb) breakpoint set --name main\\n\", .{});\n    std.debug.print(\"  (lldb) run\\n\", .{});\n    std.debug.print(\"  (lldb) frame variable\\n\", .{});\n}",
    "why": "Debugging native compiled binaries uses industry-standard LLDB or GDB instead of browser devtools. Because Zig preserves full DWARF debug symbols in Debug and ReleaseSafe modes, variable names and types are preserved."
  },
  "bun_and_tigerbeetle_case_studies": {
    "num": "54",
    "title": "Case Studies: Why Bun & TigerBeetle Chose Zig",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Architectural review of Jarred Sumner's Bun JavaScript runtime and TigerBeetle financial database.",
    "nodeCode": "// JavaScript / TypeScript:\n// Bun is written in Zig! It replaces Node.js, npm, and Jest with 3x-10x performance.",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Why Bun chose Zig over Rust and C++:\\n\", .{});\n    std.debug.print(\"1. Seamless C/C++ interop for JavaScriptCore bindings\\n\", .{});\n    std.debug.print(\"2. Comptime metaprogramming without macro maintenance headaches\\n\", .{});\n    std.debug.print(\"3. Fast compilation times enabling rapid iteration\\n\", .{});\n    std.debug.print(\"4. Granular control over every byte of memory allocation\\n\", .{});\n}",
    "why": "Bun (the modern JS runtime) is written primarily in Zig. Jarred Sumner cited Zig's seamless C/C++ interop (essential for interfacing with WebKit's JavaScriptCore) and lack of hidden control flow as the primary reasons for choosing Zig over Rust."
  },
  "senior_interview_questions": {
    "num": "55",
    "title": "Senior Systems Engineering Interview Q&A",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "Top interview questions: Allocator lifecycles, undefined memory safety, comptime execution limits, and C ABI compatibility.",
    "nodeCode": "// Questions senior engineering candidates face when interviewing for systems roles:",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"Key Zig Interview Concepts:\\n\", .{});\n    std.debug.print(\"- What is the difference between GeneralPurposeAllocator and ArenaAllocator?\\n\", .{});\n    std.debug.print(\"- How does 'comptime' achieve type generics without runtime RTTI?\\n\", .{});\n    std.debug.print(\"- Why does Zig have no hidden control flow or operator overloading?\\n\", .{});\n    std.debug.print(\"- How does Zig's error handling eliminate the overhead of C++ exceptions?\\n\", .{});\n}",
    "why": "Interviewing for systems engineering roles requires knowing how memory is physically structured in cache lines, why GC pauses occur, and how to write deterministic software."
  },
  "zen_of_zig": {
    "num": "56",
    "title": "The Zen of Zig & Production Playbook",
    "part": "Part 13: Advanced Systems & Production Mastery",
    "desc": "The 18 principles of the Zen of Zig. What Zig deliberately left out (operator overloading, hidden control flow) and why.",
    "nodeCode": "// JavaScript:\n// JS has type coercion ('1' + 1 === '11'), prototype mutation, and hidden getters/setters.",
    "code": "const std = @import(\"std\");\n\npub fn main() void {\n    std.debug.print(\"--- The Zen of Zig ---\\n\", .{});\n    std.debug.print(\"1. Communicate intent precisely.\\n\", .{});\n    std.debug.print(\"2. Edge cases matter.\\n\", .{});\n    std.debug.print(\"3. Favor reading code over writing code.\\n\", .{});\n    std.debug.print(\"4. Only one obvious way to do things.\\n\", .{});\n    std.debug.print(\"5. Runtime crashes are better than runtime bugs.\\n\", .{});\n    std.debug.print(\"6. Compile errors are better than runtime crashes.\\n\", .{});\n    std.debug.print(\"7. Incremental improvement.\\n\", .{});\n    std.debug.print(\"8. Avoid local maximums.\\n\", .{});\n    std.debug.print(\"9. Reduce the amount one must remember.\\n\", .{});\n    std.debug.print(\"10. Focus on code rather than style.\\n\", .{});\n    std.debug.print(\"11. Resource allocation may fail; resource deallocation must succeed.\\n\", .{});\n    std.debug.print(\"12. Memory is a resource.\\n\", .{});\n    std.debug.print(\"13. Together we serve the users.\\n\", .{});\n}",
    "why": "Zig has NO operator overloading, NO hidden control flow (a function call looks like `f()`, never an overloaded operator), and NO hidden memory allocation. What you see is what executes."
  }
};
