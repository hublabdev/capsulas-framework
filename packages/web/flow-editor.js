// Port Type Definitions
const PORT_TYPES = {
    AUTH: { id: 'auth', name: 'Auth', color: '#9c27b0' },
    USER: { id: 'user', name: 'User', color: '#2196f3' },
    DATA: { id: 'data', name: 'Data', color: '#4caf50' },
    STRING: { id: 'string', name: 'String', color: '#ff9800' },
    NUMBER: { id: 'number', name: 'Number', color: '#f44336' },
    OBJECT: { id: 'object', name: 'Object', color: '#00bcd4' },
    ARRAY: { id: 'array', name: 'Array', color: '#8bc34a' },
    FILE: { id: 'file', name: 'File', color: '#795548' },
    EVENT: { id: 'event', name: 'Event', color: '#e91e63' },
    MESSAGE: { id: 'message', name: 'Message', color: '#3f51b5' },
    JOB: { id: 'job', name: 'Job', color: '#607d8b' },
    EMAIL: { id: 'email', name: 'Email', color: '#009688' },
    ANY: { id: 'any', name: 'Any', color: '#9e9e9e' }
};

// Capsule Definitions with Sacred ASCII Icons
const CAPSULES = [
    {
        id: 'auth-jwt',
        name: 'JWT Auth',
        icon: '♔', // King (Auth/Security)
        desc: 'Autenticación JWT',
        category: 'auth',
        inputs: [
            { id: 'user', name: 'User Data', type: PORT_TYPES.USER },
            { id: 'payload', name: 'Payload', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'token', name: 'JWT Token', type: PORT_TYPES.STRING },
            { id: 'decoded', name: 'Decoded', type: PORT_TYPES.OBJECT },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'auth-oauth',
        name: 'OAuth 2.0',
        icon: '♚', // King Alt (Auth/Security)
        desc: 'Login social',
        category: 'auth',
        inputs: [
            { id: 'code', name: 'Auth Code', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'user', name: 'User Info', type: PORT_TYPES.USER },
            { id: 'token', name: 'Access Token', type: PORT_TYPES.STRING },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'database',
        name: 'Database',
        icon: '╦', // Box drawing (Database/Structure)
        desc: 'Consultas SQL/NoSQL',
        category: 'data',
        inputs: [
            { id: 'query', name: 'Query', type: PORT_TYPES.STRING },
            { id: 'data', name: 'Data', type: PORT_TYPES.OBJECT },
            { id: 'params', name: 'Parameters', type: PORT_TYPES.ARRAY }
        ],
        outputs: [
            { id: 'rows', name: 'Rows', type: PORT_TYPES.ARRAY },
            { id: 'count', name: 'Count', type: PORT_TYPES.NUMBER },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'cache',
        name: 'Cache',
        icon: '⊕', // Circled Plus (Cache/Storage)
        desc: 'Cache Redis/Memory',
        category: 'data',
        inputs: [
            { id: 'key', name: 'Key', type: PORT_TYPES.STRING },
            { id: 'value', name: 'Value', type: PORT_TYPES.ANY }
        ],
        outputs: [
            { id: 'data', name: 'Cached Data', type: PORT_TYPES.ANY },
            { id: 'hit', name: 'Cache Hit', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'http',
        name: 'HTTP Client',
        icon: '⊹', // Sparkle (Network/Communication)
        desc: 'Peticiones HTTP',
        category: 'network',
        inputs: [
            { id: 'url', name: 'URL', type: PORT_TYPES.STRING },
            { id: 'body', name: 'Body', type: PORT_TYPES.OBJECT },
            { id: 'headers', name: 'Headers', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'response', name: 'Response', type: PORT_TYPES.OBJECT },
            { id: 'data', name: 'Data', type: PORT_TYPES.ANY },
            { id: 'status', name: 'Status', type: PORT_TYPES.NUMBER },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'websocket',
        name: 'WebSocket',
        icon: '⭢', // Arrow (Realtime/Flow)
        desc: 'Tiempo real',
        category: 'network',
        inputs: [
            { id: 'message', name: 'Message', type: PORT_TYPES.MESSAGE },
            { id: 'event', name: 'Event', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'message', name: 'Message', type: PORT_TYPES.MESSAGE },
            { id: 'connected', name: 'Connected', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'queue',
        name: 'Queue',
        icon: '⍓', // Up-down arrow (Queue/Processing)
        desc: 'Trabajos async',
        category: 'processing',
        inputs: [
            { id: 'data', name: 'Job Data', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'job', name: 'Job', type: PORT_TYPES.JOB },
            { id: 'result', name: 'Result', type: PORT_TYPES.ANY },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'ai-chat',
        name: 'AI Chat',
        icon: '♞', // Knight (AI/Intelligent)
        desc: 'Chatbot IA',
        category: 'ai',
        inputs: [
            { id: 'prompt', name: 'Prompt', type: PORT_TYPES.STRING },
            { id: 'context', name: 'Context', type: PORT_TYPES.ARRAY }
        ],
        outputs: [
            { id: 'response', name: 'AI Response', type: PORT_TYPES.STRING },
            { id: 'tokens', name: 'Tokens Used', type: PORT_TYPES.NUMBER }
        ]
    },
    {
        id: 'email',
        name: 'Email',
        icon: '⌘', // Command (Email/Action)
        desc: 'Envío emails',
        category: 'communication',
        inputs: [
            { id: 'to', name: 'To', type: PORT_TYPES.STRING },
            { id: 'subject', name: 'Subject', type: PORT_TYPES.STRING },
            { id: 'body', name: 'Body', type: PORT_TYPES.STRING },
            { id: 'template', name: 'Template Data', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'messageId', name: 'Message ID', type: PORT_TYPES.STRING },
            { id: 'status', name: 'Status', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'notification',
        name: 'Notifications',
        icon: '●', // Bullet (Alert/Notification)
        desc: 'Push notifications',
        category: 'communication',
        inputs: [
            { id: 'user', name: 'User', type: PORT_TYPES.USER },
            { id: 'message', name: 'Message', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'sent', name: 'Sent', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'file-upload',
        name: 'File Upload',
        icon: '⭡', // Up arrow (Upload)
        desc: 'Subida archivos',
        category: 'storage',
        inputs: [
            { id: 'file', name: 'File', type: PORT_TYPES.FILE }
        ],
        outputs: [
            { id: 'url', name: 'File URL', type: PORT_TYPES.STRING },
            { id: 'metadata', name: 'Metadata', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'analytics',
        name: 'Analytics',
        icon: '╣', // Box drawing (Stats/Charts)
        desc: 'Tracking eventos',
        category: 'analytics',
        inputs: [
            { id: 'event', name: 'Event', type: PORT_TYPES.EVENT },
            { id: 'properties', name: 'Properties', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'tracked', name: 'Tracked', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'validator',
        name: 'Validator',
        icon: '✶', // Star (Validation/Check)
        desc: 'Validación datos',
        category: 'utility',
        inputs: [
            { id: 'data', name: 'Data', type: PORT_TYPES.OBJECT },
            { id: 'schema', name: 'Schema', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'valid', name: 'Valid Data', type: PORT_TYPES.OBJECT },
            { id: 'errors', name: 'Errors', type: PORT_TYPES.ARRAY }
        ]
    },
    {
        id: 'logger',
        name: 'Logger',
        icon: '├', // Tree line (Logs/Lines)
        desc: 'Sistema de logs',
        category: 'utility',
        inputs: [
            { id: 'message', name: 'Message', type: PORT_TYPES.STRING },
            { id: 'data', name: 'Data', type: PORT_TYPES.ANY }
        ],
        outputs: [
            { id: 'logged', name: 'Logged', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'encryption',
        name: 'Encryption',
        icon: '♜', // Rook (Security/Castle)
        desc: 'Cifrado AES',
        category: 'security',
        inputs: [
            { id: 'data', name: 'Data', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'encrypted', name: 'Encrypted', type: PORT_TYPES.STRING },
            { id: 'decrypted', name: 'Decrypted', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'storage',
        name: 'Storage',
        icon: '╩', // Box drawing (Storage/Container)
        desc: 'Almacenamiento',
        category: 'data',
        inputs: [
            { id: 'key', name: 'Key', type: PORT_TYPES.STRING },
            { id: 'value', name: 'Value', type: PORT_TYPES.ANY }
        ],
        outputs: [
            { id: 'data', name: 'Data', type: PORT_TYPES.ANY }
        ]
    },
    {
        id: 'i18n',
        name: 'i18n',
        icon: '✿', // Flower (International/Global)
        desc: 'Traducción',
        category: 'utility',
        inputs: [
            { id: 'key', name: 'Translation Key', type: PORT_TYPES.STRING },
            { id: 'locale', name: 'Locale', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'text', name: 'Translated Text', type: PORT_TYPES.STRING }
        ]
    },
    {
        id: 'geolocation',
        name: 'Geolocation',
        icon: '❯', // Breadcrumb arrow (Location/Navigation)
        desc: 'GPS y mapas',
        category: 'device',
        inputs: [
            { id: 'address', name: 'Address', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'coords', name: 'Coordinates', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'theme',
        name: 'Theme',
        icon: '░', // Light shade (Theme/Style)
        desc: 'Temas UI',
        category: 'ui',
        inputs: [
            { id: 'theme', name: 'Theme Name', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'colors', name: 'Colors', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'router',
        name: 'Router',
        icon: '◈',
        desc: 'Navegación',
        category: 'ui',
        inputs: [
            { id: 'path', name: 'Path', type: PORT_TYPES.STRING }
        ],
        outputs: [
            { id: 'route', name: 'Route', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'state',
        name: 'State',
        icon: '⊡', // Square with center (State/Storage)
        desc: 'Estado global',
        category: 'ui',
        inputs: [
            { id: 'action', name: 'Action', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'state', name: 'State', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'form',
        name: 'Form Builder',
        icon: '▭', // Rectangle (Form/Input)
        desc: 'Formularios',
        category: 'ui',
        inputs: [
            { id: 'schema', name: 'Form Schema', type: PORT_TYPES.OBJECT }
        ],
        outputs: [
            { id: 'data', name: 'Form Data', type: PORT_TYPES.OBJECT }
        ]
    },
    {
        id: 'payment',
        name: 'Payments',
        icon: '◇', // Diamond (Payment/Value)
        desc: 'Pagos Stripe',
        category: 'commerce',
        inputs: [
            { id: 'amount', name: 'Amount', type: PORT_TYPES.NUMBER },
            { id: 'customer', name: 'Customer', type: PORT_TYPES.USER }
        ],
        outputs: [
            { id: 'charge', name: 'Charge', type: PORT_TYPES.OBJECT },
            { id: 'error', name: 'Error', type: PORT_TYPES.STRING }
        ]
    }
];

// State
let nodes = [];
let connections = [];
let selectedNode = null;
let nextNodeId = 1;
let isDraggingNode = false;
let draggedNode = null;
let isPanning = false;
let panStart = { x: 0, y: 0 };
let canvasOffset = { x: 0, y: 0 };
let isConnecting = false;
let connectionStart = null;
let tempConnection = null;

// Initialize
function init() {
    renderCapsuleLibrary();
    setupEventListeners();
    updateStats();
}

// Render Capsule Library
function renderCapsuleLibrary() {
    const library = document.getElementById('capsuleLibrary');
    library.innerHTML = CAPSULES.map(capsule => `
        <div class="capsule-item" draggable="true" data-capsule-id="${capsule.id}">
            <div class="capsule-header">
                <span class="capsule-icon">${capsule.icon}</span>
                <span class="capsule-name">${capsule.name}</span>
            </div>
            <div class="capsule-desc">${capsule.desc}</div>
        </div>
    `).join('');

    // Add drag event listeners
    document.querySelectorAll('.capsule-item').forEach(item => {
        item.addEventListener('dragstart', handleCapsuleDragStart);
    });
}

// Event Listeners
function setupEventListeners() {
    const canvas = document.getElementById('canvas');

    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);

    document.addEventListener('keydown', handleKeyDown);
}

// Drag and Drop Handlers
function handleCapsuleDragStart(e) {
    e.dataTransfer.setData('capsuleId', e.target.dataset.capsuleId);
}

function handleCanvasDragOver(e) {
    e.preventDefault();
}

function handleCanvasDrop(e) {
    e.preventDefault();
    const capsuleId = e.dataTransfer.getData('capsuleId');
    if (!capsuleId) return;

    const capsule = CAPSULES.find(c => c.id === capsuleId);
    if (!capsule) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;

    createNode(capsule, x, y);
}

// Create Node
function createNode(capsule, x, y) {
    const nodeId = `node-${nextNodeId++}`;
    const node = {
        id: nodeId,
        capsuleId: capsule.id,
        capsule: capsule,
        x: x,
        y: y,
        config: {}
    };

    nodes.push(node);
    renderNode(node);
    updateStats();
}

// Render Node
function renderNode(node) {
    const canvas = document.getElementById('canvas');

    const nodeEl = document.createElement('div');
    nodeEl.className = 'node';
    nodeEl.id = node.id;
    nodeEl.style.left = node.x + 'px';
    nodeEl.style.top = node.y + 'px';

    // Render input ports - PERFECTLY ALIGNED with TOOLTIPS
    const PORT_SPACING = 28; // Standard spacing between ports
    const PORT_START = 45;   // Start position from top

    const inputPortsHTML = node.capsule.inputs.map((port, index) => `
        <div class="port port-input"
             data-node-id="${node.id}"
             data-port-id="${port.id}"
             data-port-type="${port.type.id}"
             data-port-direction="input"
             style="top: ${PORT_START + (index * PORT_SPACING)}px;">
            <div class="port-dot" style="color: ${port.type.color};"></div>
            <div class="port-tooltip">
                <div class="port-tooltip-title">${port.name}</div>
                <div class="port-tooltip-type">${port.type.name.toUpperCase()}</div>
            </div>
        </div>
    `).join('');

    // Render output ports - PERFECTLY ALIGNED with TOOLTIPS
    const outputPortsHTML = node.capsule.outputs.map((port, index) => `
        <div class="port port-output"
             data-node-id="${node.id}"
             data-port-id="${port.id}"
             data-port-type="${port.type.id}"
             data-port-direction="output"
             style="top: ${PORT_START + (index * PORT_SPACING)}px;">
            <div class="port-tooltip">
                <div class="port-tooltip-title">${port.name}</div>
                <div class="port-tooltip-type">${port.type.name.toUpperCase()}</div>
            </div>
            <div class="port-dot" style="color: ${port.type.color};"></div>
        </div>
    `).join('');

    const nodeHeight = Math.max(
        PORT_START + Math.max(node.capsule.inputs.length, node.capsule.outputs.length) * PORT_SPACING + 20,
        120
    );

    nodeEl.style.minHeight = nodeHeight + 'px';

    nodeEl.innerHTML = `
        ${inputPortsHTML}
        <div class="node-header">
            <span class="node-icon">${node.capsule.icon}</span>
            <span class="node-title">${node.capsule.name}</span>
            <button class="node-delete" onclick="deleteNode('${node.id}')">×</button>
        </div>
        <div class="node-content">${node.capsule.desc}</div>
        ${outputPortsHTML}
    `;

    canvas.appendChild(nodeEl);

    // Add node event listeners
    const nodeHeader = nodeEl.querySelector('.node-header');
    const nodeContent = nodeEl.querySelector('.node-content');

    nodeHeader.addEventListener('mousedown', (e) => handleNodeMouseDown(e, node));
    nodeContent.addEventListener('mousedown', (e) => handleNodeMouseDown(e, node));

    nodeEl.addEventListener('click', (e) => {
        if (!e.target.closest('.port')) {
            e.stopPropagation();
            selectNode(node);
        }
    });

    // Add port event listeners
    nodeEl.querySelectorAll('.port').forEach(port => {
        port.addEventListener('mousedown', (e) => handlePortMouseDown(e, node, port));
        port.addEventListener('mouseenter', (e) => handlePortHover(e, port));
        port.addEventListener('mouseleave', (e) => handlePortUnhover(e, port));
    });
}

// Node Mouse Handlers
function handleNodeMouseDown(e, node) {
    if (e.target.closest('.connection-point') || e.target.closest('.node-delete')) {
        return;
    }

    isDraggingNode = true;
    draggedNode = node;

    const nodeEl = document.getElementById(node.id);
    const rect = nodeEl.getBoundingClientRect();

    draggedNode.offsetX = e.clientX - rect.left;
    draggedNode.offsetY = e.clientY - rect.top;

    e.stopPropagation();
}

function handleCanvasMouseDown(e) {
    if (e.target.id === 'canvas' || e.target.closest('.empty-state')) {
        isPanning = true;
        panStart = { x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y };
        document.getElementById('canvas').classList.add('panning');
        deselectNode();
    }
}

function handleCanvasMouseMove(e) {
    if (isDraggingNode && draggedNode) {
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();

        draggedNode.x = e.clientX - rect.left - draggedNode.offsetX;
        draggedNode.y = e.clientY - rect.top - draggedNode.offsetY;

        const nodeEl = document.getElementById(draggedNode.id);
        nodeEl.style.left = draggedNode.x + 'px';
        nodeEl.style.top = draggedNode.y + 'px';

        updateConnectionsWithPorts();
    } else if (isPanning) {
        canvasOffset.x = e.clientX - panStart.x;
        canvasOffset.y = e.clientY - panStart.y;
    } else if (isConnecting && tempConnection) {
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        updateTempConnection(mouseX, mouseY);
    }
}

function handleCanvasMouseUp(e) {
    if (isDraggingNode) {
        isDraggingNode = false;
        draggedNode = null;
    }

    if (isPanning) {
        isPanning = false;
        document.getElementById('canvas').classList.remove('panning');
    }

    if (isConnecting) {
        const target = e.target.closest('.port');
        if (target && target.dataset.portDirection === 'input' && connectionStart.nodeId !== target.dataset.nodeId) {
            createConnectionWithPorts(
                connectionStart.nodeId,
                connectionStart.portId,
                target.dataset.nodeId,
                target.dataset.portId
            );
        }

        isConnecting = false;
        connectionStart = null;
        if (tempConnection) {
            tempConnection.remove();
            tempConnection = null;
        }

        // Clear port highlights
        clearPortHighlights();
    }
}

// Connection Handlers
function handleConnectionStart(e, node) {
    e.stopPropagation();
    const point = e.target;

    if (point.dataset.type === 'output') {
        isConnecting = true;
        connectionStart = {
            nodeId: node.id,
            element: point
        };

        const rect = point.getBoundingClientRect();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();

        connectionStart.x = rect.left + rect.width / 2 - canvasRect.left;
        connectionStart.y = rect.top + rect.height / 2 - canvasRect.top;
    }
}

function updateTempConnection(mouseX, mouseY) {
    const svg = document.getElementById('connections-svg');

    if (!tempConnection) {
        tempConnection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempConnection.setAttribute('class', 'connection-line');
        tempConnection.setAttribute('style', 'stroke-dasharray: 5,5');
        svg.appendChild(tempConnection);
    }

    const path = createCurvePath(
        connectionStart.x,
        connectionStart.y,
        mouseX,
        mouseY
    );

    tempConnection.setAttribute('d', path);
}

function createConnection(fromNodeId, toNodeId) {
    // Check if connection already exists
    const exists = connections.some(c =>
        c.from === fromNodeId && c.to === toNodeId
    );

    if (exists) return;

    const connection = {
        id: `conn-${connections.length}`,
        from: fromNodeId,
        to: toNodeId
    };

    connections.push(connection);
    renderConnection(connection);
    updateStats();
}

function renderConnection(connection) {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);

    if (!fromNode || !toNode) return;

    const fromEl = document.querySelector(`#${connection.from} .connection-point.output`);
    const toEl = document.querySelector(`#${connection.to} .connection-point.input`);

    const canvasRect = document.getElementById('canvas').getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
    const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
    const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

    const svg = document.getElementById('connections-svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('class', 'connection-line');
    path.setAttribute('id', connection.id);
    path.setAttribute('d', createCurvePath(x1, y1, x2, y2));

    path.addEventListener('click', () => {
        if (confirm('¿Eliminar esta conexión?')) {
            deleteConnection(connection.id);
        }
    });

    svg.appendChild(path);
}

function createCurvePath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(distance / 2, 100);

    return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
}

function updateConnections() {
    connections.forEach(connection => {
        const pathEl = document.getElementById(connection.id);
        if (!pathEl) return;

        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);

        if (!fromNode || !toNode) return;

        const fromEl = document.querySelector(`#${connection.from} .connection-point.output`);
        const toEl = document.querySelector(`#${connection.to} .connection-point.input`);

        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
        const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

        pathEl.setAttribute('d', createCurvePath(x1, y1, x2, y2));
    });
}

// Node Selection
function selectNode(node) {
    deselectNode();
    selectedNode = node;

    const nodeEl = document.getElementById(node.id);
    nodeEl.classList.add('selected');

    showNodeConfig(node);
}

function deselectNode() {
    if (selectedNode) {
        const nodeEl = document.getElementById(selectedNode.id);
        if (nodeEl) nodeEl.classList.remove('selected');
        selectedNode = null;
    }
}

// Delete Operations
function deleteNode(nodeId) {
    // Remove connections
    connections = connections.filter(c => {
        if (c.from === nodeId || c.to === nodeId) {
            const pathEl = document.getElementById(c.id);
            if (pathEl) pathEl.remove();
            return false;
        }
        return true;
    });

    // Remove node
    nodes = nodes.filter(n => n.id !== nodeId);
    const nodeEl = document.getElementById(nodeId);
    if (nodeEl) nodeEl.remove();

    if (selectedNode && selectedNode.id === nodeId) {
        deselectNode();
    }

    updateStats();
}

function deleteConnection(connectionId) {
    connections = connections.filter(c => c.id !== connectionId);
    const pathEl = document.getElementById(connectionId);
    if (pathEl) pathEl.remove();

    updateStats();
}

// Panel Functions
function togglePanel() {
    const panel = document.getElementById('rightPanel');
    panel.classList.toggle('visible');
}

function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Add active to selected tab and pane
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function showNodeConfig(node) {
    const panel = document.getElementById('rightPanel');
    panel.classList.add('visible');

    // Update panel header
    document.getElementById('panelNodeIcon').textContent = node.capsule.icon;
    document.getElementById('panelNodeName').textContent = node.capsule.name;
    document.getElementById('panelNodeDesc').textContent = node.capsule.desc;

    // Update Parameters tab
    const parametersDiv = document.getElementById('nodeParameters');
    parametersDiv.innerHTML = `
        <div class="panel-section">
            <div class="panel-section-title">Configuración de ${node.capsule.name}</div>
            ${getConfigFieldsForCapsule(node.capsule)}
        </div>
    `;

    // Update Settings tab
    document.getElementById('nodeName').value = node.capsule.name;
    document.getElementById('nodeNotes').value = node.config.notes || '';
    document.getElementById('nodeTimeout').value = node.config.timeout || 5000;

    // Update Output tab
    updateNodeInfo(node);

    // Update Code tab
    updateCodePreview();
}

function updateNodeInfo(node) {
    const inputConnections = connections.filter(c => c.to === node.id).length;
    const outputConnections = connections.filter(c => c.from === node.id).length;

    document.getElementById('infoNodeId').textContent = node.id;
    document.getElementById('infoCapsuleType').textContent = node.capsule.name;
    document.getElementById('infoInputs').textContent = inputConnections;
    document.getElementById('infoOutputs').textContent = outputConnections;

    // Update data preview
    const dataPreview = {
        nodeId: node.id,
        capsule: node.capsule.id,
        status: 'ready',
        config: node.config,
        connections: {
            inputs: inputConnections,
            outputs: outputConnections
        },
        sampleData: getSampleDataForCapsule(node.capsule)
    };

    document.getElementById('dataPreview').textContent = JSON.stringify(dataPreview, null, 2);
}

function getSampleDataForCapsule(capsule) {
    const samples = {
        'auth-jwt': { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', userId: 'user123' },
        'auth-oauth': { accessToken: 'ya29.a0AfH6SMBx...', provider: 'google', user: { email: 'user@example.com' } },
        'database': { rows: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }], count: 2 },
        'http': { status: 200, data: { message: 'Success' }, headers: { 'content-type': 'application/json' } },
        'cache': { key: 'user:123', value: { name: 'John' }, ttl: 3600 },
        'queue': { jobId: 'job_123', status: 'completed', result: { success: true } },
        'email': { messageId: 'msg_abc123', to: 'user@example.com', status: 'sent' },
        'ai-chat': { response: 'Hola! ¿En qué puedo ayudarte?', model: 'gpt-4', tokens: 15 },
        'websocket': { connected: true, message: { type: 'chat', content: 'Hello' } },
        'file-upload': { url: 'https://cdn.example.com/file.pdf', size: 2048000, type: 'application/pdf' },
        'analytics': { event: 'page_view', properties: { page: '/home', duration: 45 } },
        'notification': { notificationId: 'notif_123', sent: true, deviceId: 'device_abc' }
    };

    return samples[capsule.id] || { status: 'ready', data: null };
}

function getConfigFieldsForCapsule(capsule) {
    const configs = {
        'auth-jwt': `
            <div class="config-field">
                <label class="config-label">Secret Key</label>
                <input type="text" class="config-input" placeholder="your-secret-key-min-32-chars">
            </div>
            <div class="config-field">
                <label class="config-label">Algoritmo</label>
                <select class="config-select">
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="HS512">HS512 (HMAC SHA-512)</option>
                    <option value="RS256">RS256 (RSA SHA-256)</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Tiempo de Expiración</label>
                <input type="text" class="config-input" value="24h" placeholder="1h, 7d, 30d">
            </div>
            <div class="config-field">
                <label class="config-label">Issuer (opcional)</label>
                <input type="text" class="config-input" placeholder="myapp.com">
            </div>
        `,
        'auth-oauth': `
            <div class="config-field">
                <label class="config-label">Proveedor OAuth</label>
                <select class="config-select">
                    <option value="google">Google</option>
                    <option value="github">GitHub</option>
                    <option value="microsoft">Microsoft</option>
                    <option value="facebook">Facebook</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Client ID</label>
                <input type="text" class="config-input" placeholder="your-client-id">
            </div>
            <div class="config-field">
                <label class="config-label">Client Secret</label>
                <input type="password" class="config-input" placeholder="your-client-secret">
            </div>
            <div class="config-field">
                <label class="config-label">Redirect URI</label>
                <input type="text" class="config-input" value="http://localhost:3000/auth/callback">
            </div>
            <div class="config-checkbox">
                <input type="checkbox" id="usePKCE" checked>
                <label class="config-label" style="margin: 0;">Usar PKCE (recomendado)</label>
            </div>
            <div class="config-checkbox">
                <input type="checkbox" id="autoRefresh" checked>
                <label class="config-label" style="margin: 0;">Auto-refrescar tokens</label>
            </div>
        `,
        'database': `
            <div class="config-field">
                <label class="config-label">Tipo de Base de Datos</label>
                <select class="config-select">
                    <option value="sqlite">SQLite</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Host</label>
                <input type="text" class="config-input" value="localhost">
            </div>
            <div class="config-field">
                <label class="config-label">Puerto</label>
                <input type="number" class="config-input" value="5432">
            </div>
            <div class="config-field">
                <label class="config-label">Base de Datos</label>
                <input type="text" class="config-input" placeholder="myapp_db">
            </div>
            <div class="config-field">
                <label class="config-label">Usuario</label>
                <input type="text" class="config-input" placeholder="postgres">
            </div>
            <div class="config-field">
                <label class="config-label">Contraseña</label>
                <input type="password" class="config-input" placeholder="password">
            </div>
            <div class="config-field">
                <label class="config-label">Pool de Conexiones</label>
                <input type="number" class="config-input" value="10">
            </div>
        `,
        'http': `
            <div class="config-field">
                <label class="config-label">Método HTTP</label>
                <select class="config-select">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">URL</label>
                <input type="text" class="config-input" placeholder="https://api.example.com/endpoint">
            </div>
            <div class="config-field">
                <label class="config-label">Headers (JSON)</label>
                <textarea class="config-textarea" placeholder='{"Authorization": "Bearer token"}'></textarea>
            </div>
            <div class="config-field">
                <label class="config-label">Body (JSON)</label>
                <textarea class="config-textarea" placeholder='{"key": "value"}'></textarea>
            </div>
            <div class="config-field">
                <label class="config-label">Timeout (ms)</label>
                <input type="number" class="config-input" value="5000">
            </div>
        `,
        'email': `
            <div class="config-field">
                <label class="config-label">Proveedor de Email</label>
                <select class="config-select">
                    <option value="sendgrid">SendGrid</option>
                    <option value="ses">AWS SES</option>
                    <option value="smtp">SMTP</option>
                    <option value="mailgun">Mailgun</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">API Key</label>
                <input type="password" class="config-input" placeholder="Enter API key">
            </div>
            <div class="config-field">
                <label class="config-label">From Email</label>
                <input type="email" class="config-input" placeholder="noreply@myapp.com">
            </div>
            <div class="config-field">
                <label class="config-label">From Name</label>
                <input type="text" class="config-input" placeholder="My App">
            </div>
            <div class="config-field">
                <label class="config-label">To Email</label>
                <input type="email" class="config-input" placeholder="user@example.com">
            </div>
            <div class="config-field">
                <label class="config-label">Subject</label>
                <input type="text" class="config-input" placeholder="Welcome to My App">
            </div>
            <div class="config-field">
                <label class="config-label">Template ID (opcional)</label>
                <input type="text" class="config-input" placeholder="welcome-email">
            </div>
        `,
        'queue': `
            <div class="config-field">
                <label class="config-label">Nombre del Job</label>
                <input type="text" class="config-input" placeholder="process-data">
            </div>
            <div class="config-field">
                <label class="config-label">Prioridad</label>
                <select class="config-select">
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="normal">Normal</option>
                    <option value="low">Baja</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Concurrencia</label>
                <input type="number" class="config-input" value="5">
            </div>
            <div class="config-field">
                <label class="config-label">Reintentos Máximos</label>
                <input type="number" class="config-input" value="3">
            </div>
            <div class="config-field">
                <label class="config-label">Backoff</label>
                <select class="config-select">
                    <option value="exponential">Exponencial</option>
                    <option value="fixed">Fijo</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Delay (ms)</label>
                <input type="number" class="config-input" value="1000">
            </div>
        `,
        'ai-chat': `
            <div class="config-field">
                <label class="config-label">Proveedor de IA</label>
                <select class="config-select">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="ollama">Ollama (Local)</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Modelo</label>
                <select class="config-select">
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">API Key</label>
                <input type="password" class="config-input" placeholder="sk-...">
            </div>
            <div class="config-field">
                <label class="config-label">System Prompt</label>
                <textarea class="config-textarea" placeholder="Eres un asistente útil...">Eres un asistente útil y amigable.</textarea>
            </div>
            <div class="config-field">
                <label class="config-label">Temperatura</label>
                <input type="number" class="config-input" value="0.7" min="0" max="2" step="0.1">
            </div>
            <div class="config-field">
                <label class="config-label">Max Tokens</label>
                <input type="number" class="config-input" value="1000">
            </div>
        `,
        'cache': `
            <div class="config-field">
                <label class="config-label">Tipo de Cache</label>
                <select class="config-select">
                    <option value="memory">Memoria (local)</option>
                    <option value="redis">Redis</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Redis Host (si aplica)</label>
                <input type="text" class="config-input" placeholder="localhost">
            </div>
            <div class="config-field">
                <label class="config-label">Redis Port</label>
                <input type="number" class="config-input" value="6379">
            </div>
            <div class="config-field">
                <label class="config-label">TTL por defecto (segundos)</label>
                <input type="number" class="config-input" value="3600">
            </div>
            <div class="config-field">
                <label class="config-label">Max Size (entradas)</label>
                <input type="number" class="config-input" value="1000">
            </div>
        `,
        'websocket': `
            <div class="config-field">
                <label class="config-label">WebSocket URL</label>
                <input type="text" class="config-input" placeholder="wss://api.example.com/ws">
            </div>
            <div class="config-field">
                <label class="config-label">Protocolo</label>
                <input type="text" class="config-input" placeholder="chat">
            </div>
            <div class="config-checkbox">
                <input type="checkbox" checked>
                <label class="config-label" style="margin: 0;">Auto-reconectar</label>
            </div>
            <div class="config-field">
                <label class="config-label">Intervalo de Ping (ms)</label>
                <input type="number" class="config-input" value="30000">
            </div>
        `,
        'file-upload': `
            <div class="config-field">
                <label class="config-label">Tamaño Máximo (MB)</label>
                <input type="number" class="config-input" value="10">
            </div>
            <div class="config-field">
                <label class="config-label">Tipos Permitidos</label>
                <textarea class="config-textarea" placeholder="image/jpeg, image/png, application/pdf">image/jpeg, image/png, application/pdf</textarea>
            </div>
            <div class="config-field">
                <label class="config-label">Destino de Upload</label>
                <select class="config-select">
                    <option value="local">Local Storage</option>
                    <option value="s3">Amazon S3</option>
                    <option value="cloudinary">Cloudinary</option>
                </select>
            </div>
        `,
        'analytics': `
            <div class="config-field">
                <label class="config-label">Proveedor</label>
                <select class="config-select">
                    <option value="ga">Google Analytics</option>
                    <option value="mixpanel">Mixpanel</option>
                    <option value="segment">Segment</option>
                </select>
            </div>
            <div class="config-field">
                <label class="config-label">Tracking ID</label>
                <input type="text" class="config-input" placeholder="UA-XXXXX-Y">
            </div>
            <div class="config-field">
                <label class="config-label">Nombre del Evento</label>
                <input type="text" class="config-input" placeholder="page_view">
            </div>
        `
    };

    return configs[capsule.id] || `
        <div class="config-field">
            <label class="config-label">Configuración</label>
            <textarea class="config-textarea" placeholder="Configuración JSON"></textarea>
        </div>
    `;
}

function updateNodeConfig(nodeId, key, value) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        node.config[key] = value;
        updateCodePreview();
    }
}

// Code Generation
function generateCode() {
    // Use improved generator if connections exist, otherwise use basic one
    const code = connections.length > 0 ? generateImprovedCode() : generateFlowCode();

    // Download code
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-app.ts';
    a.click();
    URL.revokeObjectURL(url);

    const message = connections.length > 0
        ? `✅ Código FUNCIONAL generado!\n\n` +
          `📦 Nodos: ${nodes.length}\n` +
          `🔗 Conexiones: ${connections.length}\n` +
          `💻 Archivo: generated-app.ts\n\n` +
          `El código incluye:\n` +
          `• Implementación real de cada cápsula\n` +
          `• Flujo de datos entre nodos\n` +
          `• Manejo de errores\n` +
          `• Listo para ejecutar con npm!`
        : `⚠️ Código generado (sin conexiones)\n\n` +
          `Sugerencia: Conecta los nodos para generar\n` +
          `código funcional con flujo de datos real.`;

    alert(message);
}

function generateFlowCode() {
    const sortedNodes = topologicalSort();

    let code = `// Aplicación generada por Sistema de Cápsulas\n`;
    code += `// Nodos: ${nodes.length} | Conexiones: ${connections.length}\n\n`;

    // Imports
    code += `// Importar cápsulas\n`;
    const uniqueCapsules = [...new Set(nodes.map(n => n.capsuleId))];
    uniqueCapsules.forEach(capsuleId => {
        const capsule = CAPSULES.find(c => c.id === capsuleId);
        const factoryName = `create${capsule.name.replace(/\s/g, '')}Service`;
        code += `import { ${factoryName} } from '@capsulas/${capsuleId}';\n`;
    });

    code += `\n// Inicializar servicios\n`;
    code += `async function initializeServices() {\n`;

    sortedNodes.forEach(node => {
        const varName = `${node.capsule.id.replace(/-/g, '')}Service`;
        const factoryName = `create${node.capsule.name.replace(/\s/g, '')}Service`;
        code += `  const ${varName} = ${factoryName}();\n`;
    });

    code += `\n  return {\n`;
    sortedNodes.forEach(node => {
        const varName = `${node.capsule.id.replace(/-/g, '')}Service`;
        code += `    ${varName},\n`;
    });
    code += `  };\n}\n\n`;

    code += `// Ejecutar flujo de trabajo\n`;
    code += `async function executeWorkflow() {\n`;
    code += `  const services = await initializeServices();\n\n`;

    sortedNodes.forEach((node, index) => {
        code += `  // Paso ${index + 1}: ${node.capsule.name}\n`;
        code += `  console.log('Ejecutando: ${node.capsule.name}');\n`;

        const inputNodes = getInputNodes(node.id);
        if (inputNodes.length > 0) {
            code += `  // Recibe datos de: ${inputNodes.map(n => n.capsule.name).join(', ')}\n`;
        }

        code += `  // TODO: Implementar lógica de ${node.capsule.name}\n\n`;
    });

    code += `  console.log('✅ Flujo completado');\n`;
    code += `}\n\n`;
    code += `executeWorkflow().catch(console.error);\n`;

    return code;
}

function topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    function visit(nodeId) {
        if (visited.has(nodeId)) return;
        if (visiting.has(nodeId)) {
            console.warn('Ciclo detectado en el flujo');
            return;
        }

        visiting.add(nodeId);

        const inputConnections = connections.filter(c => c.to === nodeId);
        inputConnections.forEach(conn => visit(conn.from));

        visiting.delete(nodeId);
        visited.add(nodeId);

        const node = nodes.find(n => n.id === nodeId);
        if (node) sorted.push(node);
    }

    nodes.forEach(node => visit(node.id));

    return sorted;
}

function getInputNodes(nodeId) {
    return connections
        .filter(c => c.to === nodeId)
        .map(c => nodes.find(n => n.id === c.from))
        .filter(n => n);
}

function updateCodePreview() {
    const code = generateFlowCode();
    document.getElementById('codePreview').textContent = code;
}

// Execute Flow
async function executeFlow() {
    if (nodes.length === 0) {
        alert('⚠️ Agrega nodos al canvas primero');
        return;
    }

    const sortedNodes = topologicalSort();

    for (const node of sortedNodes) {
        const nodeEl = document.getElementById(node.id);
        nodeEl.classList.add('executing');

        await sleep(800);

        console.log(`✅ Ejecutado: ${node.capsule.name}`);

        nodeEl.classList.remove('executing');
    }

    alert('✅ Flujo ejecutado exitosamente!');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Clear Canvas
function clearCanvas() {
    if (nodes.length === 0) return;

    if (!confirm('¿Eliminar todos los nodos y conexiones?')) return;

    nodes = [];
    connections = [];
    selectedNode = null;

    document.getElementById('canvas').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🎨</div>
            <div class="empty-state-text">Arrastra cápsulas aquí para comenzar</div>
            <div class="empty-state-hint">Conecta las cápsulas para crear tu flujo de trabajo</div>
        </div>
    `;

    document.getElementById('connections-svg').innerHTML = '';

    updateStats();
}

// Update Stats
function updateStats() {
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('connectionCount').textContent = connections.length;
}

// Keyboard Handlers
function handleKeyDown(e) {
    if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode.id);
    }

    if (e.key === 'Escape') {
        deselectNode();
    }
}

// Initialize on load
window.addEventListener('load', init);
