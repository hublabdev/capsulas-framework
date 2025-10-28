/**
 * Desktop Integration for Capsulas
 * Handles file operations, menu commands, and keyboard shortcuts
 */

// Check if running in Electron
const isElectron = window.electron && window.electron.isElectron;

// Current project state
let currentProjectPath = null;
let currentFlowPath = null;
let hasUnsavedChanges = false;

// Initialize desktop features
function initDesktopIntegration() {
  if (!isElectron) {
    console.log('Running in browser mode');
    return;
  }

  console.log('Initializing desktop integration...');

  // Setup menu event listeners
  setupMenuListeners();

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Track unsaved changes
  trackUnsavedChanges();

  // Update UI for desktop mode
  updateDesktopUI();
}

function setupMenuListeners() {
  // File menu
  window.electron.onMenuNewProject(() => {
    if (confirmUnsavedChanges()) {
      newProject();
    }
  });

  window.electron.onMenuOpenProject((event, projectPath) => {
    if (confirmUnsavedChanges()) {
      openProject(projectPath);
    }
  });

  window.electron.onMenuSaveFlow(() => {
    saveFlow();
  });

  window.electron.onMenuSaveFlowAs(() => {
    saveFlowAs();
  });

  window.electron.onMenuExportCode(() => {
    exportCode();
  });

  // Edit menu
  window.electron.onMenuClearCanvas(() => {
    if (confirmUnsavedChanges()) {
      clearCanvas();
    }
  });

  // View menu
  window.electron.onMenuTogglePanel(() => {
    togglePanel();
  });

  // Flow menu
  window.electron.onMenuRunFlow(() => {
    executeFlow();
  });

  window.electron.onMenuValidateFlow(() => {
    validateFlow();
  });

  window.electron.onMenuAddNode(() => {
    // Focus search or show capsule picker
    focusCapsuleSearch();
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S - Save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (e.shiftKey) {
        saveFlowAs();
      } else {
        saveFlow();
      }
    }

    // Cmd/Ctrl + O - Open
    if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
      e.preventDefault();
      // Trigger open dialog via menu
    }

    // Cmd/Ctrl + R - Run
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      executeFlow();
    }

    // Cmd/Ctrl + E - Export
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault();
      exportCode();
    }

    // Cmd/Ctrl + B - Toggle panel
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      togglePanel();
    }

    // Delete key - Delete selected node
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedNode && !e.target.matches('input, textarea')) {
        e.preventDefault();
        deleteSelectedNode();
      }
    }

    // Escape - Deselect
    if (e.key === 'Escape') {
      deselectAll();
    }
  });
}

function trackUnsavedChanges() {
  // Monitor node and connection changes
  const originalAddNode = window.addNode;
  window.addNode = function(...args) {
    const result = originalAddNode.apply(this, args);
    markUnsaved();
    return result;
  };

  // Add similar tracking for other modifications
  setInterval(() => {
    updateWindowTitle();
  }, 1000);
}

function updateDesktopUI() {
  // Update header for desktop mode
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.textContent = 'Capsulas';
  }

  const projectName = document.querySelector('.project-name');
  if (projectName) {
    projectName.textContent = currentProjectPath || 'Untitled Project';
  }

  // Remove unnecessary buttons
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    // Keep only essential buttons
    headerActions.innerHTML = `
      <button class="btn btn-secondary" onclick="togglePanel()">Settings</button>
      <button class="btn btn-primary" onclick="executeFlow()">Run Flow</button>
    `;
  }
}

function updateWindowTitle() {
  const projectName = currentProjectPath ?
    currentProjectPath.split('/').pop() :
    'Untitled Project';

  const unsaved = hasUnsavedChanges ? ' •' : '';
  document.title = `${projectName}${unsaved} - Capsulas`;
}

// File operations
async function newProject() {
  clearCanvas();
  currentProjectPath = null;
  currentFlowPath = null;
  hasUnsavedChanges = false;
  updateDesktopUI();
  updateWindowTitle();
}

async function openProject(projectPath) {
  currentProjectPath = projectPath;
  // Load project files
  updateDesktopUI();
  updateWindowTitle();
}

async function saveFlow() {
  if (!isElectron) return;

  const flowData = {
    nodes: nodes,
    connections: connections,
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      version: '0.1.0'
    }
  };

  const result = await window.electron.saveFlow(flowData);

  if (result.success) {
    currentFlowPath = result.path;
    hasUnsavedChanges = false;
    updateWindowTitle();
    showNotification('Flow saved successfully');
  } else {
    showError('Failed to save flow');
  }
}

async function saveFlowAs() {
  currentFlowPath = null;
  await saveFlow();
}

async function exportCode() {
  if (!isElectron) return;

  const code = typeof generateImprovedCode === 'function' ?
    generateImprovedCode() :
    '// Code generation not available';

  const result = await window.electron.exportCode(code);

  if (result.success) {
    showNotification(`Code exported to ${result.path}`);
  } else {
    showError('Failed to export code');
  }
}

function validateFlow() {
  if (typeof window.validateFlow === 'function') {
    const result = window.validateFlow();
    if (result.valid) {
      showNotification('Flow is valid');
    } else {
      showError('Flow validation failed:\n' + result.errors.join('\n'));
    }
  }
}

// Helper functions
function confirmUnsavedChanges() {
  if (hasUnsavedChanges) {
    return confirm('You have unsaved changes. Continue?');
  }
  return true;
}

function markUnsaved() {
  hasUnsavedChanges = true;
  updateWindowTitle();
}

function showNotification(message) {
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 12px 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 10000;
    font-size: 13px;
    color: #0a0a0a;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showError(message) {
  if (isElectron) {
    window.electron.showError(message);
  } else {
    alert(message);
  }
}

function focusCapsuleSearch() {
  // Focus on sidebar search if it exists
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.scrollIntoView({ behavior: 'smooth' });
  }
}

function deleteSelectedNode() {
  if (typeof window.deleteNode === 'function' && selectedNode) {
    window.deleteNode(selectedNode.id);
    markUnsaved();
  }
}

function deselectAll() {
  if (typeof window.deselectNode === 'function') {
    window.deselectNode();
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopIntegration);
} else {
  initDesktopIntegration();
}
