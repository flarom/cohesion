const StatusRegister = {
    items: [],

    register(item) {
        // item: { id, side:"left"|"right", render(), update(), interval }
        this.items.push(item);
        this.render();
    },

    remove(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) return;

        const item = this.items[index];

        if (item._timer) {
            clearInterval(item._timer);
        }

        if (item._element && item._element.parentNode) {
            item._element.parentNode.removeChild(item._element);
        }

        this.items.splice(index, 1);
    },

    removeAll() {
        this.items = []
        this.render();
    },

    render() {
        const left = document.querySelector("#status .status-bar-left");
        const right = document.querySelector("#status .status-bar-right");

        left.innerHTML = "";
        right.innerHTML = "";

        for (const item of this.items) {
            const el = document.createElement("div");
            el.className = "status-bar-item";
            el.dataset.id = item.id;
            el.innerHTML = item.render();

            if (item.side === "left") left.appendChild(el);
            else right.appendChild(el);

            item._element = el;

            if (item.interval) {
                item._timer = setInterval(() => {
                    item.update?.(el);
                }, item.interval);
            }
        }
    },

    update(id) {
        const item = this.items.find(i => i.id === id);
        if (item && item._element && item.update) {
            item.update(item._element);
        }
    },

    updateAll() {
        for (const item of this.items) {
            if (item._element && item.update) {
                item.update(item._element);
            }
        }
    }
};
