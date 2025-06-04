const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "cohesion", "favicon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
});

// leaving a note here because i always forget how to use electron
// npm install
// npm start (optional)
// npm run build 