const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Keep a global reference of the window object
let mainWindow;

// Development mode check
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: '#fafafa',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create menu
  createMenu();

  // Setup IPC handlers
  setupIPCHandlers();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            });
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save Flow',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-flow');
          }
        },
        {
          label: 'Save Flow As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-save-flow-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Code',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-code');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Clear Canvas',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.send('menu-clear-canvas');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Toggle Panel',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('menu-toggle-panel');
          }
        }
      ]
    },
    {
      label: 'Flow',
      submenu: [
        {
          label: 'Run Flow',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-run-flow');
          }
        },
        {
          label: 'Validate Flow',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu-validate-flow');
          }
        },
        { type: 'separator' },
        {
          label: 'Add Node',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow.webContents.send('menu-add-node');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://docs.capsulas.dev');
          }
        },
        {
          label: 'GitHub',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/yourusername/capsulas');
          }
        },
        { type: 'separator' },
        {
          label: 'About Capsulas',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Capsulas',
              message: 'Capsulas',
              detail: 'Version 0.1.0\nVisual development framework\n\nMIT License'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setupIPCHandlers() {
  // IPC Handlers for file operations
  ipcMain.handle('save-flow', async (event, flowData) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Flow',
      defaultPath: 'flow.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      await fs.writeFile(result.filePath, JSON.stringify(flowData, null, 2));
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-flow', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-code', async (event, code) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Code',
      defaultPath: 'generated-app.ts',
      filters: [
        { name: 'TypeScript Files', extensions: ['ts'] },
        { name: 'JavaScript Files', extensions: ['js'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      await fs.writeFile(result.filePath, code);
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-error', async (event, message) => {
  await dialog.showErrorBox('Error', message);
});

ipcMain.handle('show-info', async (event, title, message) => {
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title,
    message
  });
});
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
