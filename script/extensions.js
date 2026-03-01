const Extensions = (() => {

    const STORAGE_KEY = "cohesion_extensions";

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function save(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function parseMetadata(code) {

        const commentMatch = code.match(/^\/\*\*([\s\S]*?)\*\//);

        if (!commentMatch) return null;

        const block = commentMatch[1];

        if (!block.includes("@extension"))
            return null;

        const meta = {};

        const get = (name) => {
            const match = block.match(new RegExp(`@${name}\\s+(.+)`));
            return match ? match[1].trim() : "";
        };

        meta.title = get("title") || "Untitled Extension";
        meta.author = get("author");
        meta.description = get("description");
        meta.icon = get("icon") || "extension";
        meta.color = get("color") || "";

        return meta;
    }

    async function execute(extension) {
        try {
            const fn = new Function(extension.code);
            await fn();
        } catch (e) {
            console.error("[Extension error]", e);
            showToast("Extension error: " + e.message, "error");
        }
    }

    return {

        async getAll() {
            return load();
        },

        async get(index) {
            return load()[index];
        },

        async create(code) {

            const meta = parseMetadata(code);

            if (!meta) {
                showToast("Invalid extension format", "error");
                return null;
            }

            const items = load();

            const extension = {
                ...meta,
                code
            };

            items.push(extension);

            save(items);

            return extension;
        },

        async update(index, code) {

            const items = load();

            if (!items[index])
                throw "Invalid index";

            const meta = parseMetadata(code);

            if (!meta)
                throw "Invalid extension format";

            items[index] = {
                ...meta,
                code
            };

            save(items);
        },

        async delete(index) {

            const items = load();

            if (!items[index]) return;

            items.splice(index, 1);

            save(items);
        },

        async deleteAll() {
            save([]);
        },

        async export(index) {

            const ext = await Extensions.get(index);

            const blob = new Blob([ext.code], {
                type: "application/javascript"
            });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = `${ext.title}.js`;

            a.click();

            URL.revokeObjectURL(url);
        },

        async import(code) {
            return await Extensions.create(code);
        },

        async pickFile() {

            return new Promise(resolve => {

                const input = document.createElement("input");

                input.type = "file";
                input.accept = ".js";

                input.onchange = async () => {

                    const file = input.files[0];

                    if (!file)
                        return resolve(null);

                    resolve(await file.text());
                };

                input.click();

            });

        },

        async runAll() {

            const extensions = load();

            for (const ext of extensions)
                await execute(ext);

        }

    };

})();