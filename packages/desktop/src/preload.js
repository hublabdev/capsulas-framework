const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File operations
  saveFlow: (flowData) => ipcRenderer.invoke('save-flow', flowData),
  loadFlow: (filePath) => ipcRenderer.invoke('load-flow', filePath),
  exportCode: (code) => ipcRenderer.invoke('export-code', code),

  // Dialogs
  showError: (message) => ipcRenderer.invoke('show-error', message),
  showInfo: (title, message) => ipcRenderer.invoke('show-info', title, message),

  // Menu event listeners
  onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onMenuOpenProject: (callback) => ipcRenderer.on('menu-open-project', callback),
  onMenuSaveFlow: (callback) => ipcRenderer.on('menu-save-flow', callback),
  onMenuSaveFlowAs: (callback) => ipcRenderer.on('menu-save-flow-as', callback),
  onMenuExportCode: (callback) => ipcRenderer.on('menu-export-code', callback),
  onMenuClearCanvas: (callback) => ipcRenderer.on('menu-clear-canvas', callback),
  onMenuTogglePanel: (callback) => ipcRenderer.on('menu-toggle-panel', callback),
  onMenuRunFlow: (callback) => ipcRenderer.on('menu-run-flow', callback),
  onMenuValidateFlow: (callback) => ipcRenderer.on('menu-validate-flow', callback),
  onMenuAddNode: (callback) => ipcRenderer.on('menu-add-node', callback),

  // Platform info
  platform: process.platform,
  isElectron: true
});
