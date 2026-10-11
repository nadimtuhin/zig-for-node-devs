# Switch CodeMirror mode from rust to clike (C-like mode provides standard syntax highlighting for Zig without leaking rust-specific keywords)
layout_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/layouts/Layout.astro"
with open(layout_path, "r") as f:
    l = f.read()

l = l.replace(
    '<script is:inline src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/rust/rust.min.js"></script>',
    '<script is:inline src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/clike/clike.min.js"></script>'
)
with open(layout_path, "w") as f:
    f.write(l)

for p in ["/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/index.astro", "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapter/[id].astro"]:
    with open(p, "r") as f:
        content = f.read()
    content = content.replace("mode: 'rust'", "mode: 'text/x-csrc'")
    with open(p, "w") as f:
        f.write(content)

print("Updated CodeMirror mode to clean C/Zig compatible clike tokenizer!")
