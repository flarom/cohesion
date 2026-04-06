Toast = {
    show: function(message, icon = "") {
        const snackbar = document.createElement("div");
        snackbar.className = "toast show";
        snackbar.innerHTML = `<span class='icon' style='font-size:x-large'>${icon}</span><p>${message}</p>`;

        document.body.appendChild(snackbar);

        setTimeout(() => {
            snackbar.classList.remove("show");
            setTimeout(() => {
                snackbar.remove();
            }, 400);
        }, 3000);
    }
}