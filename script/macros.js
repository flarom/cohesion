const Macros = (() => {

    const STORAGE_KEY = "cohesion_macros";

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

    return {

        async getAll() {
            return load();
        },

        async get(index) {
            return load()[index];
        },

        async create({ name, code, author, description = "", icon = "action_key" }) {
            const items = load();
            items.push({ name, code, author, description, icon });
            save(items);
            await Macros.updateSlashCommands();
        },

        async update(index, data) {
            const items = load();
            if (!items[index]) throw "Invalid index";
            items[index] = { ...items[index], ...data };
            save(items);
            await Macros.updateSlashCommands();
        },

        async delete(index) {
            const items = load();
            if (!items[index]) return;
            items.splice(index, 1);
            save(items);
            await Macros.updateSlashCommands();
        },

        async deleteAll() {
            save([]);
        },

        async export(index) {
            const macro = await Macros.get(index);

            const data = {
                name: macro.name || "",
                description: macro.description || "",
                author: macro.author || "",
                icon: macro.icon || "",
                code: macro.code || ""
            };

            const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.name || "macro"}.json`;
            a.click();

            URL.revokeObjectURL(url);
        },

        async pickFile() {
            return new Promise((resolve) => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";

                input.onchange = async () => {
                    const file = input.files[0];
                    if (!file) return resolve(null);

                    const text = await file.text();
                    resolve(text);
                };

                input.click();
            });
        },

        async import(text) {
            let data;

            try {
                data = JSON.parse(text);
            } catch (err) {
                showToast("Invalid JSON file", "error");
                return null;
            }

            if (!data.code) {
                showToast("This file has no macro code", "error");
                return null;
            }

            const macro = {
                name: data.name || "Unnamed macro",
                description: data.description || "",
                author: data.author || "",
                icon: data.icon || "action_key",
                code: data.code
            };

            await Macros.create(macro);
            return macro;
        },

        async updateSlashCommands() {
            const macros = load();

            const active = new Set(macros.map(m => "macro-" + m.name));

            // remove old macro commands
            CommandRegistry.unregisterWhere(cmd => {
                return cmd.id && cmd.id.startsWith("macro-") && !active.has(cmd.id);
            });

            // register / update current macros
            for (let macro of macros) {

                const id = "macro-" + macro.name;

                CommandRegistry.register(
                    macro.name, 
                    {
                        id,
                        icon: macro.icon || "terminal", // default icon
                        description: macro.description || "User macro",
                        exec: async () => {
                            try {
                                const fn = new Function(macro.code);
                                return await fn();
                            } catch (e) {
                                console.error("[Macro error]", e);
                                showToast("Macro error: " + e.message, "error");
                            }
                        }
                    }
                );
            }
        }
    };
})();
