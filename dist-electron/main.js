import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        transparent: true,
        frame: false,
        vibrancy: 'under-window',
        visualEffectState: 'active',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    const isDev = !app.isPackaged;
    if (isDev) {
        // We wait for the Vite dev server to be ready
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools.
        // mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
