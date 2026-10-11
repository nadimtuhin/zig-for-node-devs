import re

# 1. FIX Sidebar.astro
sidebar_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/Sidebar.astro"
with open(sidebar_path, "r") as f:
    sb = f.read()

# Change <nav class="chapters-sidebar" id="chaptersList"> to have id="sidebar"
sb = sb.replace('id="chaptersList"', 'id="sidebar"')
# Change collapse button icon / click handler
sb = sb.replace('toggleSidebar()', 'window.toggleSidebar()')

with open(sidebar_path, "w") as f:
    f.write(sb)
print("Updated Sidebar.astro id to 'sidebar'!")

# 2. FIX index.astro and chapter/[id].astro
def patch_page(path):
    with open(path, "r") as f:
        content = f.read()

    # A. Update toggleSidebar implementation to handle desktop and mobile reliably
    old_toggle_pattern = r"function toggleSidebar\(\) \{[\s\S]*?function closeMobileSidebar\(\) \{[\s\S]*?\}"
    new_toggle = """function toggleSidebar() {
      const container = document.getElementById('viewStudio');
      const sidebar = document.getElementById('sidebar');
      if (!container || !sidebar) return;

      if (window.innerWidth <= 860) {
        container.classList.toggle('mobile-sidebar-open');
        const isOpen = container.classList.contains('mobile-sidebar-open');
        sidebar.classList.toggle('mobile-open', isOpen);
      } else {
        container.classList.toggle('sidebar-collapsed');
        const isCollapsed = container.classList.contains('sidebar-collapsed');
        try {
          localStorage.setItem('zig_book_sidebar_collapsed', isCollapsed ? '1' : '0');
        } catch (e) {}
      }
    }

    function closeMobileSidebar() {
      const container = document.getElementById('viewStudio');
      const sidebar = document.getElementById('sidebar');
      if (container) container.classList.remove('mobile-sidebar-open');
      if (sidebar) sidebar.classList.remove('mobile-open');
    }"""
    content = re.sub(old_toggle_pattern, new_toggle, content)

    # B. Add Left/Right arrow key shortcuts
    old_keydown = r"if \(\(e\.metaKey \|\| e\.ctrlKey\) && e\.key === 'k'\) \{[\s\S]*?\}"
    new_keydown = """if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('lessonSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Alt + Left/Right Arrow for Chapter Navigation
      if ((e.altKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLesson(-1);
      }
      if ((e.altKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLesson(1);
      }"""
    content = re.sub(old_keydown, new_keydown, content)

    # C. Update selectChapter to persist active chapter in localStorage
    old_select_part = "window.history.replaceState({ path: newurl }, '', newurl);\n      }"
    new_select_part = """window.history.replaceState({ path: newurl }, '', newurl);
      }
      try {
        localStorage.setItem('zig_book_active_chapter', key);
      } catch (e) {}"""
    content = content.replace(old_select_part, new_select_part)

    # D. In initStudio, check localStorage for last active chapter
    content = content.replace("localStorage.getItem('go_book_sidebar_collapsed')", "localStorage.getItem('zig_book_sidebar_collapsed')")
    content = content.replace(
        "const targetChapter = queryChapter || initialKey || 'basic_vars';",
        "const targetChapter = queryChapter || (typeof localStorage !== 'undefined' ? localStorage.getItem('zig_book_active_chapter') : null) || initialKey || 'basic_vars';"
    )

    with open(path, "w") as f:
        f.write(content)
    print(f"Patched {path}!")

patch_page("/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/index.astro")
patch_page("/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapter/[id].astro")

# 3. Clean CSS in global.css
css_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/styles/global.css"
with open(css_path, "r") as f:
    css = f.read()

# Replace residual go-* vars and classes
css = css.replace("--go-blue", "--zig-amber")
css = css.replace("--go-dark-cyan", "--zig-dark-amber")
css = css.replace("--go-cyan-light", "--zig-light-amber")
css = css.replace("--go-cyan", "--zig-orange")
css = css.replace(".go-why-box", ".zig-why-box")
css = css.replace(".go-why-title", ".zig-why-title")
css = css.replace(".go-why-desc", ".zig-why-desc")
css = css.replace("/* GO VS RUST COMPARISON STYLES */", "/* ZIG SYSTEMS COMPARISON STYLES */")

with open(css_path, "w") as f:
    f.write(css)
print("Updated global.css branding tokens!")

# 4. LessonDetail.astro classes
lesson_detail_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/LessonDetail.astro"
with open(lesson_detail_path, "r") as f:
    ld = f.read()
ld = ld.replace("go-why-box", "zig-why-box")
ld = ld.replace("go-why-title", "zig-why-title")
ld = ld.replace("go-why-desc", "zig-why-desc")
with open(lesson_detail_path, "w") as f:
    f.write(ld)
print("Updated LessonDetail.astro classes!")

print("All frontend fixes applied!")
