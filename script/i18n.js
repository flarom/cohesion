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
        const res = await fetch(`./locale/${lang}.json`);
        const json = await res.json();

        this.cache[lang] = {
        meta: json.meta,
        strings: flattenSections(json.strings)
        };
    }

    return this.cache[lang];
    },

    interpolate(str, el) {
        if (!el.dataset.localeVars) return str;

        try {
            const vars = JSON.parse(el.dataset.localeVars);
            return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
        } catch (err) {
            console.warn("Invalid data-locale-vars", el, err);
            return str;
        }
    },

    applyElement(el, data) {
        if (!data || !data.strings) return;

        // text / html
        if (el.dataset.locale) {
            const key = el.dataset.locale;
            const value = data.strings[key];

            if (value) {
                const result = this.interpolate(value, el);

                if (el.hasAttribute("data-locale-html")) {
                    el.innerHTML = result;
                } else {
                    el.textContent = result;
                }
            }
        }

        // attributes
        if (el.dataset.localeAttr) {
            const rules = el.dataset.localeAttr.split(";");

            rules.forEach(rule => {
                const [attr, key] = rule.split(":");
                const value = data.strings[key];
                if (!value) return;

                el.setAttribute(attr, value);
            });
        }
    },

    applyWithin(root = document) {
        const lang = Language.get();
        if (lang === "en") return;

        const data = this.cache[lang];
        if (!data || !data.strings) return;

        root.querySelectorAll("[data-locale], [data-locale-attr]").forEach(el => {
            this.applyElement(el, data);
        });
    },

    async apply() {
        const lang = Language.get();
        if (lang === "en") return;

        const data = await this.load(lang);
        if (!data || !data.strings) return;

        // applies translation based on id
        document.querySelectorAll("[data-locale]").forEach((el) => {
            const key = el.dataset.locale;
            let value = data.strings[key];
            if (!value) return;

            if (el.dataset.localeVars) {
                try {
                    const vars = JSON.parse(el.dataset.localeVars);
                    value = interpolate(value, vars);
                } catch (e) {
                    console.warn("Invalid data-locale-vars", el, e);
                }
            }
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

function interpolate(str, vars = {}) {
    return str.replace(/\{(\w+)\}/g, (_, key) => {
        return vars[key] ?? "";
    });
}

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

function translateElement(el) {
    cacheOriginalContent();
    cacheOriginalAttributes();
    const lang = Language.get();
    if (lang === "en") return;

    const data = I18n.cache[lang];
    if (!data) return;

    I18n.applyElement(el, data);
}

function translateWithin(root) {
    cacheOriginalContent();
    cacheOriginalAttributes();
    I18n.applyWithin(root);
}

function getTranslation(key, fallback = "") {
    const lang = Language.get();

    if (lang === "en") {
        return fallback;
    }

    const data = I18n.cache[lang];

    if (!data || !data.strings) {
        return fallback;
    }

    return data.strings[key] ?? fallback;
}
