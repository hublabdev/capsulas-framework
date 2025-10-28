// Improved Code Generator - Genera código funcional basado en conexiones

function generateImprovedCode() {
    if (nodes.length === 0) {
        return '// No hay nodos en el flujo';
    }

    const sortedNodes = topologicalSort();

    let code = `// 🚀 Aplicación generada por Sistema de Cápsulas\n`;
    code += `// Nodos: ${nodes.length} | Conexiones: ${connections.length}\n`;
    code += `// Generado: ${new Date().toLocaleString()}\n\n`;

    // Imports
    code += `// ===== IMPORTS =====\n`;
    const uniqueCapsules = [...new Set(nodes.map(n => n.capsuleId))];
    uniqueCapsules.forEach(capsuleId => {
        const capsule = CAPSULES.find(c => c.id === capsuleId);
        const factoryName = `create${capsule.name.replace(/\s/g, '')}Service`;
        code += `import { ${factoryName} } from '@capsulas/${capsuleId}';\n`;
    });

    // Configuration interface
    code += `\n// ===== CONFIGURATION =====\n`;
    code += `interface AppConfig {\n`;
    sortedNodes.forEach(node => {
        const configKey = `${node.capsule.id.replace(/-/g, '')}Config`;
        code += `  ${configKey}?: any;\n`;
    });
    code += `}\n\n`;

    // Initialize services
    code += `// ===== INITIALIZE SERVICES =====\n`;
    code += `async function initializeServices(config: AppConfig = {}) {\n`;

    sortedNodes.forEach(node => {
        const varName = `${node.capsule.id.replace(/-/g, '')}Service`;
        const factoryName = `create${capsule.name.replace(/\s/g, '')}Service`;
        const configKey = `${node.capsule.id.replace(/-/g, '')}Config`;
        code += `  const ${varName} = ${factoryName}(config.${configKey} || {});\n`;
    });

    code += `\n  return {\n`;
    sortedNodes.forEach(node => {
        const varName = `${node.capsule.id.replace(/-/g, '')}Service`;
        code += `    ${varName},\n`;
    });
    code += `  };\n}\n\n`;

    // Main workflow
    code += `// ===== WORKFLOW EXECUTION =====\n`;
    code += `async function executeWorkflow(input?: any) {\n`;
    code += `  const services = await initializeServices();\n`;
    code += `  const results: Record<string, any> = {};\n\n`;

    // Generate code for each node with actual logic
    sortedNodes.forEach((node, index) => {
        code += `  // ===== STEP ${index + 1}: ${node.capsule.name} =====\n`;
        code += `  console.log('🔄 Ejecutando: ${node.capsule.name}');\n`;

        // Get input connections for this node
        const inputConns = connections.filter(c => c.toNode === node.id);

        if (inputConns.length > 0) {
            code += `  // Recibe datos de:\n`;
            inputConns.forEach(conn => {
                const fromNode = nodes.find(n => n.id === conn.fromNode);
                const fromPort = fromNode.capsule.outputs.find(p => p.id === conn.fromPort);
                const toPort = node.capsule.inputs.find(p => p.id === conn.toPort);
                code += `  //   - ${fromNode.capsule.name}.${fromPort.name} → ${toPort.name}\n`;
            });
        }

        // Generate actual implementation based on capsule type
        const varName = `${node.capsule.id.replace(/-/g, '')}Service`;
        const resultVar = `result_${node.id.replace(/-/g, '_')}`;

        code += generateCapsuleImplementation(node, varName, resultVar, inputConns);

        code += `  results['${node.id}'] = ${resultVar};\n`;
        code += `  console.log('✅ ${node.capsule.name} completado');\n\n`;
    });

    code += `  console.log('🎉 Flujo completado exitosamente');\n`;
    code += `  return results;\n`;
    code += `}\n\n`;

    // Example usage
    code += `// ===== EXAMPLE USAGE =====\n`;
    code += `async function main() {\n`;
    code += `  try {\n`;
    code += `    const results = await executeWorkflow();\n`;
    code += `    console.log('Resultados:', results);\n`;
    code += `  } catch (error) {\n`;
    code += `    console.error('Error en el flujo:', error);\n`;
    code += `    process.exit(1);\n`;
    code += `  }\n`;
    code += `}\n\n`;
    code += `main();\n`;

    return code;
}

function generateCapsuleImplementation(node, serviceName, resultVar, inputConns) {
    let code = '';

    // Build input data from connections
    if (inputConns.length > 0) {
        code += `  const input_${node.id.replace(/-/g, '_')} = {\n`;
        inputConns.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromNode);
            const fromResultVar = `result_${conn.fromNode.replace(/-/g, '_')}`;
            const fromPort = fromNode.capsule.outputs.find(p => p.id === conn.fromPort);
            const toPort = node.capsule.inputs.find(p => p.id === conn.toPort);
            code += `    ${toPort.id}: ${fromResultVar}?.${fromPort.id},\n`;
        });
        code += `  };\n`;
    }

    // Generate implementation based on capsule type
    switch(node.capsule.id) {
        case 'auth-jwt':
            code += `  const ${resultVar} = await ${serviceName}.sign(${inputConns.length > 0 ? `input_${node.id.replace(/-/g, '_')}.user || input_${node.id.replace(/-/g, '_')}.payload` : '{ userId: "demo" }'});\n`;
            break;

        case 'auth-oauth':
            code += `  const authUrl = await ${serviceName}.getAuthorizationUrlAsync();\n`;
            code += `  const ${resultVar} = { authUrl, provider: 'google' };\n`;
            break;

        case 'database':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.table('data').insert(input_${node.id.replace(/-/g, '_')}.data);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.table('data').select('*').get();\n`;
            }
            break;

        case 'http':
            const hasUrl = inputConns.some(c => {
                const toPort = node.capsule.inputs.find(p => p.id === c.toPort);
                return toPort.id === 'url';
            });
            if (hasUrl) {
                code += `  const ${resultVar} = await ${serviceName}.get(input_${node.id.replace(/-/g, '_')}.url);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.get('https://api.example.com/data');\n`;
            }
            break;

        case 'ai-chat':
            const hasPrompt = inputConns.some(c => {
                const toPort = node.capsule.inputs.find(p => p.id === c.toPort);
                return toPort.id === 'prompt';
            });
            if (hasPrompt) {
                code += `  const ${resultVar} = await ${serviceName}.chat([{ role: 'user', content: input_${node.id.replace(/-/g, '_')}.prompt }]);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.chat([{ role: 'user', content: 'Hola!' }]);\n`;
            }
            break;

        case 'email':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.send({\n`;
                code += `    to: input_${node.id.replace(/-/g, '_')}.to || 'user@example.com',\n`;
                code += `    subject: input_${node.id.replace(/-/g, '_')}.subject || 'Notification',\n`;
                code += `    html: input_${node.id.replace(/-/g, '_')}.body || 'Message'\n`;
                code += `  });\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.send({\n`;
                code += `    to: 'user@example.com',\n`;
                code += `    subject: 'Test Email',\n`;
                code += `    html: '<p>Test message</p>'\n`;
                code += `  });\n`;
            }
            break;

        case 'websocket':
            if (inputConns.length > 0) {
                code += `  await ${serviceName}.connect();\n`;
                code += `  const ${resultVar} = await ${serviceName}.send(input_${node.id.replace(/-/g, '_')}.message);\n`;
            } else {
                code += `  await ${serviceName}.connect();\n`;
                code += `  const ${resultVar} = { connected: true };\n`;
            }
            break;

        case 'cache':
            if (inputConns.length > 0) {
                code += `  await ${serviceName}.set(input_${node.id.replace(/-/g, '_')}.key, input_${node.id.replace(/-/g, '_')}.value);\n`;
                code += `  const ${resultVar} = await ${serviceName}.get(input_${node.id.replace(/-/g, '_')}.key);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.get('demo-key');\n`;
            }
            break;

        case 'notification':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.send(input_${node.id.replace(/-/g, '_')}.user, input_${node.id.replace(/-/g, '_')}.message);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.send('user123', 'Test notification');\n`;
            }
            break;

        case 'queue':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.add('process-job', input_${node.id.replace(/-/g, '_')}.data);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.add('demo-job', { data: 'test' });\n`;
            }
            break;

        case 'validator':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.validate(input_${node.id.replace(/-/g, '_')}.data, input_${node.id.replace(/-/g, '_')}.schema);\n`;
            } else {
                code += `  const ${resultVar} = { valid: true, errors: [] };\n`;
            }
            break;

        case 'analytics':
            if (inputConns.length > 0) {
                code += `  const ${resultVar} = await ${serviceName}.track(input_${node.id.replace(/-/g, '_')}.event, input_${node.id.replace(/-/g, '_')}.properties);\n`;
            } else {
                code += `  const ${resultVar} = await ${serviceName}.track('page_view', { page: '/demo' });\n`;
            }
            break;

        default:
            code += `  const ${resultVar} = await ${serviceName}.execute(${inputConns.length > 0 ? `input_${node.id.replace(/-/g, '_')}` : '{}'});\n`;
    }

    return code;
}

// Export para uso global
if (typeof window !== 'undefined') {
    window.generateImprovedCode = generateImprovedCode;
}
