import re

# 1. FIX Layout.astro: Add skip-to-content link, fix canonical, ensure siteOrigin
layout_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/layouts/Layout.astro"
with open(layout_path, "r") as f:
    l = f.read()

# Add skip-to-content link if missing
if "skip-to-content" not in l:
    l = l.replace("<body>", "<body>\n  <a href=\"#main-content\" class=\"skip-to-content\">Skip to main content</a>")

with open(layout_path, "w") as f:
    f.write(l)
print("Updated Layout.astro with skip-to-content!")

# 2. FIX chapter/[id].astro:
# - Dynamic meta title, description, canonicalPath, and breadcrumbs for all 56 chapter static routes
# - Fix client-side hydration bug where selectChapter defaulted to 'basic_vars' instead of currentRouteKey
chapter_page_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapter/[id].astro"
with open(chapter_page_path, "r") as f:
    cp = f.read()

# Replace Layout call with dynamic metadata
old_layout_call = r"<Layout\s+title=\"Zig for Node\.js Devs[^\"]*\"\s+description=\"[^\"]*\"\s*>"
new_layout_call = """<Layout 
  title={`${chapter.title} | Zig for Node Devs (#${chapter.num})`}
  description={`${chapter.desc} Learn Zig systems programming tailored for JavaScript and Node.js developers.`}
  canonicalPath={`/chapter/${chapterKey}`}
  breadcrumbs={[
    { name: "Home", item: "https://zig-for-node-devs.vercel.app" },
    { name: "Curriculum", item: "https://zig-for-node-devs.vercel.app/chapters" },
    { name: chapter.title, item: `https://zig-for-node-devs.vercel.app/chapter/${chapterKey}` }
  ]}
>"""
cp = re.sub(old_layout_call, new_layout_call, cp)

# In chapter/[id].astro, ensure targetChapter resolves correctly on client hydration
cp = re.sub(
    r"const targetChapter = queryChapter \|\| \(typeof localStorage !== 'undefined' \? localStorage\.getItem\('zig_book_active_chapter'\) : null\) \|\| initialKey \|\| 'basic_vars';",
    "const targetChapter = queryChapter || (window.location.pathname.split('/').filter(Boolean).pop()) || initialKey || 'basic_vars';",
    cp
)

with open(chapter_page_path, "w") as f:
    f.write(cp)
print("Updated chapter/[id].astro with dynamic SEO metadata and robust route hydration!")

# 3. FIX Sidebar.astro:
# - Add missing #noResultsNotice with role="status" and aria-live="polite"
# - Increase contrast of footer link
sidebar_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/Sidebar.astro"
with open(sidebar_path, "r") as f:
    sb = f.read()

if "noResultsNotice" not in sb:
    sb = sb.replace(
        '<button id="clearSearchBtn" aria-label="Clear lesson search query" class="clear-search-btn" onclick="clearLessonSearch()" style="display:none;">✕</button>\n    </div>',
        '<button id="clearSearchBtn" aria-label="Clear lesson search query" class="clear-search-btn" onclick="clearLessonSearch()" style="display:none;">✕</button>\n    </div>\n    <div id="noResultsNotice" class="search-empty-state" style="display:none; padding: 0.75rem 1rem; color: #64748b; font-size: 0.85rem;" role="status" aria-live="polite">No lessons found matching filter.</div>'
    )

# Fix contrast from #d97706 to #b45309
sb = sb.replace("color: #d97706;", "color: #b45309;")

with open(sidebar_path, "w") as f:
    f.write(sb)
print("Updated Sidebar.astro with search empty state and compliant WCAG contrast!")
