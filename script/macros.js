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

        async create({ name, code, description = "", icon = "action_key" }) {
            const items = load();
            items.push({ name, code, description, icon });
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
