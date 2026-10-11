import re

rust_index_path = "/Users/nadimtuhin/opensource/rust-for-node-devs/src/pages/index.astro"
zig_index_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/index.astro"
zig_chapter_path = "/Users/nadimtuhin/opensource/zig-for-node-devs/src/pages/chapter/[id].astro"

with open(rust_index_path, "r") as f:
    code = f.read()

# Customize for Zig
code = code.replace("Rust for Node.js Devs | Interactive GitBook & Live Compiler", "Zig for Node.js Devs | Interactive GitBook & Live Compiler")
code = code.replace("Rust for Node.js Developers Masterclass Studio", "Zig for Node.js Developers Masterclass Studio")
code = code.replace("rust-for-node-devs.vercel.app", "zig-for-node-devs.vercel.app")
code = code.replace("rust-for-node-devs", "zig-for-node-devs")
code = code.replace("executeRustCode", "executeZigCode")
code = code.replace("play.rust-lang.org", "godbolt.org")
code = code.replace("Rust Playground", "Zig Compiler Explorer")
code = code.replace("Rust", "Zig")
code = code.replace("rustc", "zig")
code = code.replace("main.rs", "main.zig")
code = code.replace("mode: 'text/x-rustsrc'", "mode: 'text/x-csrc'")

# Replace executeZigCode implementation with Godbolt Zig API call
old_exec_pattern = r"async function executeZigCode\(\) \{[\s\S]*?finally\s*\{[\s\S]*?\}\s*\}"

new_exec_func = """async function executeZigCode() {
      const code = editor ? editor.getValue() : (chaptersData[activeKey] ? chaptersData[activeKey].code : '');
      const consoleArea = document.getElementById('consoleArea');
      const runBtn = document.getElementById('runBtn');
      const statusDot = document.getElementById('statusDot');
      const statusTag = document.getElementById('statusTag');
      const statusLatency = document.getElementById('statusLatency');

      if (runBtn) runBtn.disabled = true;
      if (statusDot) statusDot.className = 'status-dot compiling';
      if (statusTag) {
        statusTag.className = 'status-pill running';
        statusTag.innerText = 'Compiling...';
      }
      if (statusLatency) statusLatency.innerText = '';

      if (consoleArea) {
        consoleArea.className = 'console-body';
        consoleArea.textContent = '⏳ Compiling with Zig compiler via Compiler Explorer...';
      }

      const startTime = performance.now();

      try {
        const response = await fetch('https://godbolt.org/api/compiler/z0130/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            source: code,
            options: {
              userArguments: '-O ReleaseFast',
              compilerOptions: { executorRequest: false },
              filters: { execute: false, intel: true, demangle: true }
            }
          })
        });

        const elapsed = Math.round(performance.now() - startTime);
        if (statusLatency) statusLatency.innerText = `${elapsed}ms`;

        if (!response.ok) {
          throw new Error(`Compiler API returned HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code !== 0 && (data.stderr && data.stderr.length > 0)) {
          const errText = data.stderr.map(e => e.text).join('\\n');
          if (consoleArea) {
            consoleArea.className = 'console-body is-error';
            consoleArea.textContent = '❌ Compilation Failed:\\n\\n' + errText;
          }
          if (statusDot) statusDot.className = 'status-dot error';
          if (statusTag) {
            statusTag.className = 'status-pill error';
            statusTag.innerText = 'Compile Error';
          }
        } else {
          // Format assembly or build output
          let outLines = [];
          outLines.push('✓ Successfully compiled with Zig 0.13+ (-O ReleaseFast)');
          outLines.push('────────────────────────────────────────');
          if (data.asm && data.asm.length > 0) {
            outLines.push('Generated Native Machine Assembly:');
            for (const line of data.asm.slice(0, 45)) {
              outLines.push(line.text);
            }
            if (data.asm.length > 45) {
              outLines.push(`... [${data.asm.length - 45} additional assembly instructions truncated]`);
            }
          } else {
            outLines.push('Program verified and machine code emitted successfully.');
          }
          
          if (consoleArea) {
            consoleArea.className = 'console-body';
            consoleArea.textContent = outLines.join('\\n');
          }
          if (statusDot) statusDot.className = 'status-dot';
          if (statusTag) {
            statusTag.className = 'status-pill ready';
            statusTag.innerText = `Compiled 0 • ${elapsed}ms`;
          }
        }
      } catch (err) {
        const elapsed = Math.round(performance.now() - startTime);
        if (statusLatency) statusLatency.innerText = `${elapsed}ms`;
        if (consoleArea) {
          consoleArea.className = 'console-body is-error';
          consoleArea.textContent = '⚠️ Request Failed:\\n' + err.message + '\\n\\nTip: You can verify your Zig code locally via:\\n  zig run main.zig';
        }
        if (statusDot) statusDot.className = 'status-dot error';
        if (statusTag) {
          statusTag.className = 'status-pill error';
          statusTag.innerText = 'Failed';
        }
      } finally {
        if (runBtn) runBtn.disabled = false;
      }
    }"""

code = re.sub(old_exec_pattern, new_exec_func, code)

# Write index.astro
with open(zig_index_path, "w") as f:
    f.write(code)

# For chapter/[id].astro, add getStaticPaths
chapter_code = """---
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import Sidebar from '../../components/Sidebar.astro';
import LessonDetail from '../../components/LessonDetail.astro';
import Playground from '../../components/Playground.astro';
import { chaptersData } from '../../data/chapters';
import { chapterInsights } from '../../data/chapterInsights';

export function getStaticPaths() {
  return Object.keys(chaptersData).map((id) => ({
    params: { id },
  }));
}

const { id } = Astro.params;
const chapterKey = id || 'basic_vars';
const chapter = chaptersData[chapterKey] || chaptersData['basic_vars'];
const insight = chapterInsights[chapterKey] || chapterInsights['basic_vars'];
---

""" + code[code.find("<Layout"):]

with open(zig_chapter_path, "w") as f:
    f.write(chapter_code)

print("Generated src/pages/index.astro and src/pages/chapter/[id].astro!")
