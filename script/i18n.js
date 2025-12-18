// Global language state
const Language = {
    current: Settings.getSetting('language', 'en'),

    set(lang) {
        this.current = lang;
        Settings.setSetting('language', lang);
        document.documentElement.lang = lang;
        window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
    },

    get() {
        return this.current;
    },
};

// Translation engine
const I18n = {
    cache: {},

    async load(lang) {
    if (lang === "en") return null;

    if (!this.cache[lang]) {
        const res = await fetch(`/locale/${lang}.json`);
        const json = await res.json();

        this.cache[lang] = {
        meta: json.meta,
        strings: flattenSections(json.strings)
        };
    }

    return this.cache[lang];
    },

    async apply() {
        const lang = Language.get();
        if (lang === "en") return;

        const data = await this.load(lang);
        if (!data || !data.strings) return;

        // applies translation based on id
        document.querySelectorAll("[data-locale]").forEach((el) => {
            const key = el.dataset.locale;
            const value = data.strings[key];
            if (!value) return;

            // allow html
            if (el.hasAttribute("data-locale-html")) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });

        // translate attributes, such as title, placeholder, alt or aria-label
        document.querySelectorAll("[data-locale-attr]").forEach((el) => {
            const rules = el.dataset.localeAttr.split(";");

            rules.forEach((rule) => {
                const [attr, key] = rule.split(":");
                const value = data.strings[key];
                if (!value) return;

                el.setAttribute(attr, value);
            });
        });
    },

    getMeta(lang = Language.get()) {
        return this.cache[lang]?.meta || null;
    },
};

// Cache original English text
function cacheOriginalContent() {
    document.querySelectorAll("[data-locale]").forEach((el) => {
        if (!el.dataset.localeOriginal) {
            el.dataset.localeOriginal = el.innerHTML;
        }
    });
}

function cacheOriginalAttributes() {
    document.querySelectorAll("[data-locale-attr]").forEach((el) => {
        const rules = el.dataset.localeAttr.split(";");

        rules.forEach((rule) => {
            const [attr] = rule.split(":");
            const key = `localeOriginalAttr_${attr}`;

            if (!el.dataset[key]) {
                el.dataset[key] = el.getAttribute(attr) || "";
            }
        });
    });
}

// Apply current language
async function applyLanguage() {
    const lang = Language.get();

    document.querySelectorAll("[data-locale]").forEach((el) => {
        if (lang === "en") {
            el.innerHTML = el.dataset.localeOriginal;
        }
    });

    document.querySelectorAll("[data-locale-attr]").forEach((el) => {
        const rules = el.dataset.localeAttr.split(";");

        rules.forEach((rule) => {
            const [attr] = rule.split(":");
            const key = `localeOriginalAttr_${attr}`;

            el.setAttribute(attr, el.dataset[key]);
        });
    });

    await I18n.apply();
}

function flattenSections(obj, out = {}) {
  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      continue;
    }

    if (typeof value === "object" && value !== null) {
      for (const [k, v] of Object.entries(value)) {
        if (typeof v === "string") {
          out[k] = v;
        } else {
          flattenSections({ [k]: v }, out);
        }
      }
    }
  }
  return out;
}

// Global listeners
window.addEventListener("languagechange", applyLanguage);

document.addEventListener("DOMContentLoaded", () => {
    cacheOriginalContent();
    cacheOriginalAttributes();
    applyLanguage();
});
