(function() {
  // ====== Key database with synonyms ======
  const KEY_MAP = {
    "shift": "Shift",
    "alt": "Alt",
    "ctrl": "Ctrl",
    "control": "Ctrl",
    "meta": "Meta",
    "cmd": "Cmd",
    "command": "Cmd",
    "super": "Super",
    "win": "Windows",
    "windows": "Windows",
    "enter": "Enter",
    "return": "Enter",
    "esc": "Esc",
    "escape": "Esc",
    "tab": "Tab",
    " ": "Space",
    "space": "Space",
    "spacebar": "Space",
    "spcb": "Space",
    "pgup": "Page Up",
    "pg-up": "Page Up",
    "pageup": "Page Up",
    "page-up": "Page Up",
    "pgdn": "Page Down",
    "pg-down": "Page Down",
    "pagedn": "Page Down",
    "page-down": "Page Down",
    "up": "Up",
    "down": "Down",
    "left": "Left",
    "right": "Right",
    "backspace": "Backspace",
    "back": "Backspace",
    "bksp": "Backspace",
    "delete": "Delete",
    "del": "Delete",
    "insert": "Insert",
    "ins": "Insert",

    "backslash": "\\",
    "bar": "|",
    "pipe": "|",
    "brace-left": "{",
    "open-brace": "{",
    "brace-right": "}",
    "close-brace": "}",
    "bracket-left": "[",
    "open-bracket": "[",
    "bracket-right": "]",
    "close-bracket": "]",
    "colon": ":",
    "comma": ",",
    "double-quote": '"',
    "dblquote": '"',
    "equals": "=",
    "exclam": "!",
    "exclamation": "!",
    "greater": ">",
    "greater-than": ">",
    "gt": ">",
    "less": "<",
    "less-than": "<",
    "lt": "<",
    "minus": "-",
    "hyphen": "-",
    "period": ".",
    "plus": "+",
    "question": "?",
    "question-mark": "?",
    "semicolon": ";",
    "single-quote": "'",
    "slash": "/",
    "tilde": "~",
    "underscore": "_",

    "break": "Break",
    "cancel": "Break",
    "pause": "Break",
    "caps-lock": "Caps Lock",
    "capital": "Caps Lock",
    "cplk": "Caps Lock",
    "clear": "Clear",
    "clr": "Clear",
    "eject": "Eject",
    "help": "Help",
    "print-screen": "Print Screen",
    "prtsc": "Print Screen",
    "scroll-lock": "Scroll Lock",
    "sclk": "Scroll Lock",

    "num-asterisk": "Num *",
    "multiply": "Num *",
    "num-clear": "Num Clear",
    "num-delete": "Num Del",
    "num-del": "Num Del",
    "num-equals": "Num =",
    "num-lock": "Num Lock",
    "numlk": "Num Lock",
    "numlock": "Num Lock",
    "num-minus": "Num -",
    "subtract": "Num -",
    "num-plus": "Num +",
    "add": "Num +",
    "num-separator": "Num .",
    "decimal": "Num .",
    "separator": "Num .",
    "num-slash": "Num /",
    "divide": "Num /",
    "num-enter": "Num Enter",
  };

  const REGEX = /\+\+(?:"([^"]+)"|([^+][\s\S]*?))\+\+/g;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeKeyToken(token) {
    const raw = token.trim();
    const keyLower = raw.toLowerCase().replace(/\s+/g, "-");
    const display = KEY_MAP[keyLower] || raw;
    const slug = display
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/^-+|-+$/g, "");
    return { display, slug: slug || "key" };
  }

  function buildKbd(display, slug) {
    const safe = escapeHtml(display);
    return `<kbd class="key-${slug}" data-key="${safe}">${safe}</kbd>`;
  }

  function hexEncode(str) {
    let out = "";
    for (let i = 0; i < str.length; i++) {
      out += str.charCodeAt(i).toString(16).padStart(4, "0");
    }
    return out;
  }

  function hexDecode(hex) {
    let out = "";
    for (let i = 0; i < hex.length; i += 4) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
    }
    return out;
  }

  showdown.extension("keys", function() {
    return [
      {
        type: "lang",
        regex: REGEX,
        replace: function(_, quoted, seq) {
          const raw = quoted !== undefined ? `"${quoted}"` : seq;
          const hex = hexEncode(raw);
          return `§§KEYS${hex}§§`;
        }
      },

      {
        type: "output",
        filter: function(html) {
          return html.replace(/§§KEYS([0-9a-fA-F]+)§§/g, function(_, hex) {
            const content = hexDecode(hex);

            if (/^".*"$/.test(content)) {
              const text = escapeHtml(content.slice(1, -1));
              return `<span class="keys"><kbd class="key-text" data-key="${text}">${text}</kbd></span>`;
            }

            const parts = content.trim().split("+").filter(Boolean);

            const rendered = parts.map(p => {
              const norm = normalizeKeyToken(p);
              return buildKbd(norm.display, norm.slug);
            }).join(`<span class="sep">+</span>`);

            const dataKeys = parts.map(p => normalizeKeyToken(p).display).join("+");

            return `<span class="keys" data-keys="${escapeHtml(dataKeys)}">${rendered}</span>`;
          });
        }
      }
    ];
  });
})();