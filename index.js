const { app, BrowserWindow } = require("electron");

// app.disableHardwareAcceleration();

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true,
    });
    mainWindow.setFullScreen(true);
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};

app.on("ready", createWindow);
