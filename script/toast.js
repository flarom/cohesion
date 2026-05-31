/*
Cohesion Toast
==============

Provides a simple toast notification system for Cohesion
*/

toast = {
    show: function(message, icon = "") {
        const snackbar = document.createElement("div");
        snackbar.className = "toast show";
        snackbar.innerHTML = `<span class='icon'>${icon}</span><p>${message}</p>`;

        document.body.appendChild(snackbar);

        setTimeout(() => {
            snackbar.classList.add("hide");
            setTimeout(() => {
                snackbar.remove();
            }, 400);
        }, 3000);
    },
    prompt: function(message, buttons = [{ text: "OK", callback: null }]) {
        const snackbar = document.createElement("div");
        snackbar.className = "toast show";
        snackbar.innerHTML = `<p>${message}</p><div class="buttons"></div>`;

        const buttonsContainer = snackbar.querySelector(".buttons");
        buttons.forEach(button => {
            const btn = document.createElement("button");
            btn.className = "text-button";
            btn.textContent = button.text;
            btn.onclick = () => {
                if (button.callback) button.callback();
                snackbar.classList.add("hide");
                setTimeout(() => {
                    snackbar.remove();
                }, 400);
            };
            buttonsContainer.appendChild(btn);
        });

        document.body.appendChild(snackbar);
    }
}