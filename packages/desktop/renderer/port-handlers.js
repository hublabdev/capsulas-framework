// Port Connection Handlers

// Handle port mouse down - start connection
function handlePortMouseDown(e, node, portEl) {
    e.stopPropagation();

    const portDirection = portEl.dataset.portDirection;

    // Only start connection from output ports
    if (portDirection !== 'output') return;

    isConnecting = true;
    connectionStart = {
        nodeId: node.id,
        portId: portEl.dataset.portId,
        portType: portEl.dataset.portType,
        element: portEl
    };

    const rect = portEl.querySelector('.port-dot').getBoundingClientRect();
    const canvasRect = document.getElementById('canvas').getBoundingClientRect();

    connectionStart.x = rect.left + rect.width / 2 - canvasRect.left;
    connectionStart.y = rect.top + rect.height / 2 - canvasRect.top;

    // Highlight compatible ports
    highlightCompatiblePorts(connectionStart.portType);
}

// Highlight ports that are compatible with the source port type
function highlightCompatiblePorts(sourcePortType) {
    document.querySelectorAll('.port-input').forEach(port => {
        const targetPortType = port.dataset.portType;

        if (isPortCompatible(sourcePortType, targetPortType)) {
            port.classList.add('compatible');
        } else {
            port.classList.add('incompatible');
        }
    });
}

// Remove all port highlights
function clearPortHighlights() {
    document.querySelectorAll('.port').forEach(port => {
        port.classList.remove('compatible', 'incompatible');
    });
}

// Check if two port types are compatible
function isPortCompatible(sourceType, targetType) {
    // ANY type is compatible with everything
    if (sourceType === 'any' || targetType === 'any') return true;

    // Same types are compatible
    if (sourceType === targetType) return true;

    // Define custom compatibility rules
    const compatibilityRules = {
        'user': ['object'],        // User can connect to Object
        'auth': ['string'],        // Auth can connect to String
        'data': ['object', 'array'], // Data can connect to Object or Array
        'message': ['object'],     // Message can connect to Object
        'event': ['object'],       // Event can connect to Object
        'job': ['object']          // Job can connect to Object
    };

    // Check if source type has custom rules
    if (compatibilityRules[sourceType]) {
        return compatibilityRules[sourceType].includes(targetType);
    }

    return false;
}

// Handle port hover - show tooltip
function handlePortHover(e, portEl) {
    const portName = portEl.title;
    // Could show a tooltip here if needed
}

// Handle port unhover
function handlePortUnhover(e, portEl) {
    // Hide tooltip if we added one
}

// Get port element position
function getPortPosition(nodeId, portId, portDirection) {
    const portEl = document.querySelector(
        `.port[data-node-id="${nodeId}"][data-port-id="${portId}"][data-port-direction="${portDirection}"]`
    );

    if (!portEl) return null;

    const dotEl = portEl.querySelector('.port-dot');
    const rect = dotEl.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas').getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2 - canvasRect.left,
        y: rect.top + rect.height / 2 - canvasRect.top
    };
}

// Update connection creation to use port IDs
function createConnectionWithPorts(fromNodeId, fromPortId, toNodeId, toPortId) {
    // Check if connection already exists
    const exists = connections.some(c =>
        c.fromNode === fromNodeId && c.fromPort === fromPortId &&
        c.toNode === toNodeId && c.toPort === toPortId
    );

    if (exists) {
        console.log('Connection already exists');
        return;
    }

    // Get port types
    const fromNode = nodes.find(n => n.id === fromNodeId);
    const toNode = nodes.find(n => n.id === toNodeId);

    const fromPortDef = fromNode.capsule.outputs.find(p => p.id === fromPortId);
    const toPortDef = toNode.capsule.inputs.find(p => p.id === toPortId);

    // Validate compatibility
    if (!isPortCompatible(fromPortDef.type.id, toPortDef.type.id)) {
        alert(`❌ Puertos incompatibles:\n\n${fromPortDef.name} (${fromPortDef.type.name})\n→\n${toPortDef.name} (${toPortDef.type.name})\n\nTipos no compatibles.`);
        return;
    }

    const connection = {
        id: `conn-${connections.length}`,
        fromNode: fromNodeId,
        fromPort: fromPortId,
        toNode: toNodeId,
        toPort: toPortId,
        color: fromPortDef.type.color
    };

    connections.push(connection);
    renderConnectionWithPorts(connection);
    updateStats();

    console.log(`✅ Conexión creada: ${fromNode.capsule.name}.${fromPortDef.name} → ${toNode.capsule.name}.${toPortDef.name}`);
}

// Render connection between ports
function renderConnectionWithPorts(connection) {
    const fromPos = getPortPosition(connection.fromNode, connection.fromPort, 'output');
    const toPos = getPortPosition(connection.toNode, connection.toPort, 'input');

    if (!fromPos || !toPos) {
        console.error('Could not get port positions');
        return;
    }

    const svg = document.getElementById('connections-svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('class', 'connection-line');
    path.setAttribute('id', connection.id);
    path.setAttribute('d', createCurvePath(fromPos.x, fromPos.y, toPos.x, toPos.y));
    path.setAttribute('style', `stroke: ${connection.color}`);

    path.addEventListener('click', () => {
        if (confirm('¿Eliminar esta conexión?')) {
            deleteConnection(connection.id);
        }
    });

    svg.appendChild(path);
}

// Update all connections with ports
function updateConnectionsWithPorts() {
    connections.forEach(connection => {
        const pathEl = document.getElementById(connection.id);
        if (!pathEl) return;

        const fromPos = getPortPosition(connection.fromNode, connection.fromPort, 'output');
        const toPos = getPortPosition(connection.toNode, connection.toPort, 'input');

        if (!fromPos || !toPos) return;

        pathEl.setAttribute('d', createCurvePath(fromPos.x, fromPos.y, toPos.x, toPos.y));
    });
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.handlePortMouseDown = handlePortMouseDown;
    window.handlePortHover = handlePortHover;
    window.handlePortUnhover = handlePortUnhover;
    window.clearPortHighlights = clearPortHighlights;
    window.createConnectionWithPorts = createConnectionWithPorts;
    window.updateConnectionsWithPorts = updateConnectionsWithPorts;
    window.isPortCompatible = isPortCompatible;
    window.getPortPosition = getPortPosition;
}
