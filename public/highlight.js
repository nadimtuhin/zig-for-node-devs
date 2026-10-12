(function(root) {
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightJS(code) {
    if (!code) return '';

    var tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|\x27(?:\\.|[^\x27\\])*\x27)|(\b(?:const|let|var|function|return|if|else|switch|case|break|for|while|class|constructor|this|import|export|from|require|async|await|try|catch|throw|new|typeof|interface|type|extends|implements|yield|default|super)\b)|(\b(?:true|false|null|undefined|NaN|Promise|Map|Set|Buffer|Array|Object|JSON|console|process|Error|Math)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|([&<>])/g;

    return code.replace(tokenRegex, function(match, comment, str, kw, builtin, num, fn, escapeChar) {
      if (escapeChar) return escapeHtml(escapeChar);
      if (comment) return '<span class="tok-comment">' + escapeHtml(comment) + '</span>';
      if (str) return '<span class="tok-string">' + escapeHtml(str) + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (builtin) return '<span class="tok-builtin">' + builtin + '</span>';
      if (num) return '<span class="tok-number">' + num + '</span>';
      if (fn) return '<span class="tok-func">' + fn + '</span>';
      return match;
    });
  }

  function highlightZig(code) {
    if (!code) return '';

    var tokenRegex = /(\/\/[^\n]*|\\\\[^\n]*)|("(?:\\.|[^"\\])*"|\x27(?:\\.|[^\x27\\])*\x27)|(@[a-zA-Z_][a-zA-Z0-9_]*)|(\b(?:const|var|fn|pub|comptime|defer|errdefer|return|if|else|switch|try|catch|orelse|while|for|break|continue|test|unreachable|usingnamespace|struct|enum|union|error|inline|noinline|resume|suspend|nosuspend|async|await|threadlocal|export|extern|align|and|or)\b)|(\b(?:i8|u8|i16|u16|i32|u32|i64|u64|i128|u128|isize|usize|f16|f32|f64|f128|c_char|c_int|c_uint|c_long|c_ulong|bool|void|anyopaque|type|anyerror|anytype|noreturn|true|false|null|undefined)\b)|(0x[0-9a-fA-F]+|0b[01]+|\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())|([&<>])/g;

    return code.replace(tokenRegex, function(match, comment, str, builtinAt, kw, typeOrAtom, num, fn, escapeChar) {
      if (escapeChar) return escapeHtml(escapeChar);
      if (comment) return '<span class="tok-comment">' + escapeHtml(comment) + '</span>';
      if (str) return '<span class="tok-string">' + escapeHtml(str) + '</span>';
      if (builtinAt) return '<span class="tok-builtin">' + escapeHtml(builtinAt) + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (typeOrAtom) return '<span class="tok-builtin">' + typeOrAtom + '</span>';
      if (num) return '<span class="tok-number">' + num + '</span>';
      if (fn) return '<span class="tok-func">' + fn + '</span>';
      return match;
    });
  }

  function highlightC(code) {
    if (!code) return '';

    var tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|\x27(?:\\.|[^\x27\\])*\x27)|(#[a-zA-Z_]+)|(\b(?:int|char|float|double|void|long|short|unsigned|signed|struct|union|enum|typedef|const|static|extern|volatile|return|if|else|for|while|do|switch|case|default|break|continue|goto|sizeof)\b)|(\b(?:size_t|ssize_t|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|bool|true|false|NULL)\b)|(0x[0-9a-fA-F]+|\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\())|([&<>])/g;

    return code.replace(tokenRegex, function(match, comment, str, preproc, kw, typeOrAtom, num, fn, escapeChar) {
      if (escapeChar) return escapeHtml(escapeChar);
      if (comment) return '<span class="tok-comment">' + escapeHtml(comment) + '</span>';
      if (str) return '<span class="tok-string">' + escapeHtml(str) + '</span>';
      if (preproc) return '<span class="tok-builtin">' + escapeHtml(preproc) + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (typeOrAtom) return '<span class="tok-builtin">' + typeOrAtom + '</span>';
      if (num) return '<span class="tok-number">' + num + '</span>';
      if (fn) return '<span class="tok-func">' + fn + '</span>';
      return match;
    });
  }

  function highlightBash(code) {
    if (!code) return '';

    var tokenRegex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|\x27[^\x27]*\x27)|(\$(?:[a-zA-Z0-9_]+|\([^\)]+\)))|((?<![.\/-])\b(?:zig|node|npm|pnpm|npx|apk|add|install|build|run|test|fetch|echo|cat|cd|mkdir|rm|cp|export|if|then|else|fi|for|in|do|done|while)\b(?![.\/-]))|((?:^|\s)(?:-{1,2}[a-zA-Z0-9_\-=]+))|(\b\d+\b)|([&<>])/g;

    return code.replace(tokenRegex, function(match, comment, str, variable, kw, flag, num, escapeChar) {
      if (escapeChar) return escapeHtml(escapeChar);
      if (comment) return '<span class="tok-comment">' + escapeHtml(comment) + '</span>';
      if (str) return '<span class="tok-string">' + escapeHtml(str) + '</span>';
      if (variable) return '<span class="tok-builtin">' + escapeHtml(variable) + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (flag) {
        var space = flag.match(/^\s+/);
        var sp = space ? space[0] : '';
        var f = flag.trim();
        return sp + '<span class="tok-builtin">' + f + '</span>';
      }
      if (num) return '<span class="tok-number">' + num + '</span>';
      return match;
    });
  }

  function highlightDockerfile(code) {
    if (!code) return '';

    var tokenRegex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|\x27[^\x27]*\x27)|(\b(?:FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL|AS)\b)|(--[a-zA-Z0-9_\-=]+)|(\b\d+\b)|([&<>])/g;

    return code.replace(tokenRegex, function(match, comment, str, kw, flag, num, escapeChar) {
      if (escapeChar) return escapeHtml(escapeChar);
      if (comment) return '<span class="tok-comment">' + escapeHtml(comment) + '</span>';
      if (str) return '<span class="tok-string">' + escapeHtml(str) + '</span>';
      if (kw) return '<span class="tok-keyword">' + kw + '</span>';
      if (flag) return '<span class="tok-builtin">' + flag + '</span>';
      if (num) return '<span class="tok-number">' + num + '</span>';
      return match;
    });
  }

  function detectLang(code, hint) {
    if (/(?:^|\n)\s*(?:FROM|RUN|COPY|EXPOSE|WORKDIR|ENTRYPOINT)\b/.test(code)) return 'dockerfile';
    if (/(?:^|\n)\s*(?:#!\/bin|zig build-lib|zig build-exe|zig build|npm install|apk add|# Build with|\(lldb\))/.test(code)) return 'bash';
    if (/(?:^|\n)\s*(?:import\s+.*from|const\s+.*=\s*require\(|console\.log|import\s*\{)/.test(code)) return 'js';
    if (/@(?:import|cImport|compileError|typeInfo|as|intCast)|pub\s+fn\b|!\s*void\b|b\.standardTargetOptions|\.\{|\bstd\./.test(code)) return 'zig';
    if (/(?:^|\n)\s*#(?:include|define)\b/.test(code)) return 'c';
    if (hint) {
      var h = hint.toLowerCase();
      if (/\b(?:zig|zon)\b/.test(h)) return 'zig';
      if (/\b(?:javascript|js|typescript|ts)\b/.test(h)) return 'js';
      if (/\b(?:docker|dockerfile)\b/.test(h)) return 'dockerfile';
      if (/\b(?:bash|sh|shell)\b/.test(h)) return 'bash';
      if (/\b(?:c|cpp|clang)\b/.test(h)) return 'c';
    }
    return 'zig';
  }

  function highlightCode(code, lang) {
    var detected = detectLang(code, lang);
    switch (detected) {
      case 'zig': return highlightZig(code);
      case 'js': return highlightJS(code);
      case 'c': return highlightC(code);
      case 'bash': return highlightBash(code);
      case 'dockerfile': return highlightDockerfile(code);
      default: return highlightZig(code);
    }
  }

  function highlightAll() {
    if (typeof document === 'undefined') return;
    var codeBlocks = document.querySelectorAll('pre code, .node-code code, .code-block code');
    for (var i = 0; i < codeBlocks.length; i++) {
      var el = codeBlocks[i];
      if (el.querySelector('.tok-keyword, .tok-builtin, .tok-comment, .tok-string, .tok-func, .tok-number')) {
        continue;
      }
      var text = el.textContent || '';
      if (!text.trim()) continue;

      var hint = el.getAttribute('data-lang') || '';
      if (!hint && el.className) {
        var m = el.className.match(/language-([a-zA-Z0-9_-]+)/);
        if (m) hint = m[1];
      }
      if (!hint && el.parentElement) {
        var prev = el.parentElement.previousElementSibling;
        if (prev && prev.textContent) {
          hint = prev.textContent;
        }
      }
      el.innerHTML = highlightCode(text, hint);
    }
  }

  root.escapeHtml = escapeHtml;
  root.highlightJS = highlightJS;
  root.highlightZig = highlightZig;
  root.highlightC = highlightC;
  root.highlightBash = highlightBash;
  root.highlightDockerfile = highlightDockerfile;
  root.detectLang = detectLang;
  root.highlightCode = highlightCode;
  root.highlightAll = highlightAll;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', highlightAll);
    } else {
      highlightAll();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
