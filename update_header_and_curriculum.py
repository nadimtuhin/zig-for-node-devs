import re

# 1. Update Header.astro to include Roadmap tab
header_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/components/Header.astro"
new_header = """---
const pathname = Astro.url.pathname.replace(/\\/$/, '') || '/';
---

<header>
  <a href="/" class="brand" aria-label="Zig for Node.js Devs Studio Home">
    <span aria-hidden="true">⚡ ➔ 🦎</span>
    <span>Zig for Node Devs</span>
    <span class="badge">56 Lessons & Demos</span>
  </a>
  
  <nav class="header-nav-scroll" aria-label="Primary Navigation">
    <a href="/" class={`tab-toggle ${pathname === '' || pathname === '/' ? 'active' : ''}`}>⚡ Studio</a>
    <a href="/roadmap" class={`tab-toggle ${pathname === '/roadmap' ? 'active' : ''}`}>🗺️ Roadmap</a>
    <a href="/comptime" class={`tab-toggle ${pathname === '/comptime' ? 'active' : ''}`}>⚡ comptime</a>
    <a href="/memory" class={`tab-toggle ${pathname === '/memory' ? 'active' : ''}`}>🧠 Allocators</a>
    <a href="/c-interop" class={`tab-toggle ${pathname === '/c-interop' ? 'active' : ''}`}>🔌 C & Node-API</a>
    <a href="/build-system" class={`tab-toggle ${pathname === '/build-system' ? 'active' : ''}`}>📦 build.zig</a>
    <a href="/microservice" class={`tab-toggle ${pathname === '/microservice' ? 'active' : ''}`}>📂 Microservice</a>
    <a href="/docker" class={`tab-toggle ${pathname === '/docker' ? 'active' : ''}`}>🐳 Docker</a>
    <a href="/leetcode" class={`tab-toggle ${pathname === '/leetcode' ? 'active' : ''}`}>🧩 LeetCode</a>
    <a href="/philosophy" class={`tab-toggle ${pathname === '/philosophy' ? 'active' : ''}`}>🧘 Philosophy</a>
    <a href="/pitfalls" class={`tab-toggle ${pathname === '/pitfalls' ? 'active' : ''}`}>⚠️ Pitfalls</a>
    <a href="/troubleshooting" class={`tab-toggle ${pathname === '/troubleshooting' ? 'active' : ''}`}>🛠️ Diagnostics</a>
    <a href="/interviews" class={`tab-toggle ${pathname === '/interviews' ? 'active' : ''}`}>🎯 Interviews</a>
    <a href="/cheatsheet" class={`tab-toggle ${pathname === '/cheatsheet' ? 'active' : ''}`}>📖 Rosetta</a>
  </nav>

  <a href="https://github.com/nadimtuhin/zig-for-node-devs" target="_blank" rel="noopener noreferrer" class="github-link-btn" aria-label="GitHub Repository">
    <span>GitHub ★</span>
  </a>
</header>
"""
with open(header_path, "w") as f:
    f.write(new_header)
print("Updated Header.astro with Roadmap tab!")

# 2. Update chapters/index.astro to feature the Roadmap card as guide #1
chapters_index_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapters/index.astro"
with open(chapters_index_path, "r") as f:
    c = f.read()

# Add roadmap guide to architectureGuides array
if "/roadmap" not in c:
    c = c.replace(
        "const architectureGuides = [",
        "const architectureGuides = [\n  { href: '/roadmap', icon: '🗺️', title: 'Zig Developer Roadmap (roadmap.sh style)', desc: 'Step-by-step visual learning path and milestones for Node.js developers learning Zig.' },"
    )
    c = c.replace('<span class="section-count">12 In-Depth Guides</span>', '<span class="section-count">13 In-Depth Guides & Roadmaps</span>')
    c = c.replace('<span class="stat-number">12</span>\n              <span class="stat-label">Systems Guides</span>', '<span class="stat-number">13</span>\n              <span class="stat-label">Guides & Roadmap</span>')

with open(chapters_index_path, "w") as f:
    f.write(c)
print("Updated chapters/index.astro with Roadmap guide card!")
