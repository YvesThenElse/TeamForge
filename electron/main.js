import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import handlers
import { registerGitHandlers } from './handlers/gitHandlers.js';
import { registerProjectHandlers } from './handlers/projectHandlers.js';
import { registerAgentHandlers } from './handlers/agentHandlers.js';
import { registerConfigHandlers } from './handlers/configHandlers.js';
import { registerAgentFileHandlers } from './handlers/agentFileHandlers.js';
import { registerSkillHandlers } from './handlers/skillHandlers.js';
import { registerTeamHandlers } from './handlers/teamHandlers.js';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load from Vite dev server in development, or from built files in production
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:1420');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // Register all IPC handlers
  registerGitHandlers(ipcMain);
  registerProjectHandlers(ipcMain);
  registerAgentHandlers(ipcMain);
  registerConfigHandlers(ipcMain);
  registerAgentFileHandlers(ipcMain);
  registerSkillHandlers(ipcMain);
  registerTeamHandlers(ipcMain);

  // Basic dialog handler for file/folder selection
  ipcMain.handle('dialog:selectFolder', async () => {
    console.log('[Electron] dialog:selectFolder called');
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
      console.log('[Electron] Dialog result:', result);
      return result.canceled ? null : result.filePaths[0];
    } catch (err) {
      console.error('[Electron] Error showing dialog:', err);
      throw err;
    }
  });

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
