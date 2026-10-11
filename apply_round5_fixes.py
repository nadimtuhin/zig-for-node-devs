import json, re

# 1. FIX public/chapter-insights.js: Sync directly from src/data/chapterInsights.ts
insights_ts_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapterInsights.ts"
public_insights_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/public/chapter-insights.js"

with open(insights_ts_path, "r") as f:
    ts_content = f.read()

prefix = "export const chapterInsights: Record<string, ChapterInsight> = "
json_str = ts_content[ts_content.find(prefix) + len(prefix):].rstrip(";\n")
insights_data = json.loads(json_str)

with open(public_insights_path, "w") as f:
    f.write("window.chapterInsights = " + json.dumps(insights_data, indent=2) + ";\n")
print("Synchronized public/chapter-insights.js with 100% Zig insights!")

# 2. FIX Sidebar.astro: Props default parameter bug
sidebar_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/Sidebar.astro"
with open(sidebar_path, "r") as f:
    sb = f.read()

sb = sb.replace(
    "const { chapterKey = 'basic_vars', activeKey = 'basic_vars' } = Astro.props;",
    "const { chapterKey, activeKey } = Astro.props;\nconst currentKey = chapterKey || activeKey || 'basic_vars';"
)
with open(sidebar_path, "w") as f:
    f.write(sb)
print("Fixed Sidebar.astro active state binding!")

# 3. FIX Header.astro: Keep Studio active on /chapter/*
header_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/Header.astro"
with open(header_path, "r") as f:
    hd = f.read()

hd = hd.replace(
    "class={`tab-toggle ${pathname === '' || pathname === '/' ? 'active' : ''}`}",
    "class={`tab-toggle ${pathname === '' || pathname === '/' || pathname.startsWith('/chapter') ? 'active' : ''}`}"
)
with open(header_path, "w") as f:
    f.write(hd)
print("Updated Header.astro Studio tab active highlighting!")

# 4. FIX chapters/index.astro: Update 12 to 13 guides in copy
chapters_index_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapters/index.astro"
with open(chapters_index_path, "r") as f:
    ci = f.read()

ci = ci.replace("and 12 architecture guides.", "and 13 architecture guides.")
ci = ci.replace("and 12 systems architecture deep-dives.", "and 13 systems architecture deep-dives.")
with open(chapters_index_path, "w") as f:
    f.write(ci)
print("Updated chapters/index.astro guide count copy to 13!")

# 5. FIX chapter 21 whitespace error in chapters.ts
chapters_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/data/chapters.ts"
with open(chapters_path, "r") as f:
    raw_ch = f.read()

# Ensure symmetrical spacing for ** in Chapter 21
raw_ch = raw_ch.replace("[_]u8{0} ** 16", "[_]u8{0} ** 16")
with open(chapters_path, "w") as f:
    f.write(raw_ch)

# 6. FIX TroubleshootingView.html GPA leak snippet enclosure
troubleshoot_html_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/views/TroubleshootingView.html"
with open(troubleshoot_html_path, "r") as f:
    tb = f.read()

tb = tb.replace(
    """<pre style=\"background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px;\"><code>var gpa = std.heap.GeneralPurposeAllocator(.{}){};
defer {
    const check = gpa.deinit();
    if (check == .leak) @panic(\"Memory leak detected!\");
}</code></pre>""",
    """<pre style=\"background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px;\"><code>const std = @import(\"std\");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer {
        const check = gpa.deinit();
        if (check == .leak) @panic(\"Memory leak detected!\");
    }
}</code></pre>"""
)
with open(troubleshoot_html_path, "w") as f:
    f.write(tb)
print("Fixed TroubleshootingView.html code snippet syntax!")

# 7. CLEAN global.css Go theme comments and focus colors
css_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/styles/global.css"
with open(css_path, "r") as f:
    css = f.read()

css = css.replace("OFFICIAL GOLANG BRAND THEME & ACCESSIBILITY SYSTEM", "ZIG FOR NODE DEVS BRAND THEME & ACCESSIBILITY SYSTEM")
css = css.replace("/* OFFICIAL GOLANG BRAND PALETTE */", "/* ZIG BRAND PALETTE */")
css = css.replace("--focus-ring: #00add8; /* High-visibility official Go Blue outline */", "--focus-ring: #f7a41d; /* High-visibility Zig Amber outline */")
css = css.replace("--console-bg: #0b2545; /* Go Accent Navy terminal background */", "--console-bg: #0f172a; /* Slate 900 terminal background */")

with open(css_path, "w") as f:
    f.write(css)
print("Cleaned residual Go comments and focus ring color in global.css!")

print("All Round 5 audit fixes applied successfully!")
