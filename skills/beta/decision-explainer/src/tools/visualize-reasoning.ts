import { z } from 'zod';

/**
 * Visualize Reasoning - Generate decision tree diagrams
 *
 * Creates visual representations of decision paths in text, Mermaid, or JSON formats
 * for easier understanding and debugging of agent reasoning.
 */

const DecisionNodeSchema = z.object({
  id: z.string(),
  description: z.string(),
  decision_type: z.enum(['condition', 'action', 'branch']).optional(),
  children: z.array(z.string()).optional(),
  parent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const VisualizeReasoningInputSchema = z.object({
  decision_path: z.array(DecisionNodeSchema),
  format: z.enum(['text', 'mermaid', 'json']).default('text'),
});

export const VisualizeReasoningOutputSchema = z.object({
  visualization: z.string(),
  format: z.string(),
  node_count: z.number(),
  depth: z.number(),
});

export type VisualizeReasoningInput = z.infer<typeof VisualizeReasoningInputSchema>;
export type VisualizeReasoningOutput = z.infer<typeof VisualizeReasoningOutputSchema>;

type DecisionNode = z.infer<typeof DecisionNodeSchema>;

/**
 * Calculate tree depth
 */
function calculateDepth(nodes: DecisionNode[]): number {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  let maxDepth = 0;

  function getNodeDepth(nodeId: string, visited = new Set<string>()): number {
    if (visited.has(nodeId)) return 0; // Cycle detection

    const node = nodeMap.get(nodeId);
    if (!node || !node.children || node.children.length === 0) {
      return 1;
    }

    visited.add(nodeId);
    const childDepths = node.children.map(childId => getNodeDepth(childId, new Set(visited)));
    return 1 + Math.max(...childDepths);
  }

  // Find root nodes (no parents)
  const rootNodes = nodes.filter(n => !n.parent);
  for (const root of rootNodes) {
    maxDepth = Math.max(maxDepth, getNodeDepth(root.id));
  }

  return maxDepth;
}

/**
 * Generate text visualization
 */
function generateTextVisualization(nodes: DecisionNode[]): string {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const lines: string[] = [];

  lines.push('Decision Tree Visualization');
  lines.push('='.repeat(50));
  lines.push('');

  function renderNode(nodeId: string, indent: number = 0, prefix: string = ''): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const indentation = '  '.repeat(indent);
    const typeIcon = node.decision_type === 'condition' ? '?' :
                     node.decision_type === 'action' ? '✓' : '→';

    lines.push(`${indentation}${prefix}${typeIcon} ${node.description}`);

    if (node.metadata && Object.keys(node.metadata).length > 0) {
      const metadataStr = Object.entries(node.metadata)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      lines.push(`${indentation}  (${metadataStr})`);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((childId, index) => {
        const isLast = index === node.children!.length - 1;
        const childPrefix = isLast ? '└─ ' : '├─ ';
        renderNode(childId, indent + 1, childPrefix);
      });
    }
  }

  // Find and render root nodes
  const rootNodes = nodes.filter(n => !n.parent);
  rootNodes.forEach((root, index) => {
    if (index > 0) lines.push('');
    renderNode(root.id);
  });

  lines.push('');
  lines.push('='.repeat(50));
  lines.push(`Total Nodes: ${nodes.length}`);
  lines.push(`Tree Depth: ${calculateDepth(nodes)}`);

  return lines.join('\n');
}

/**
 * Generate Mermaid diagram
 */
function generateMermaidVisualization(nodes: DecisionNode[]): string {
  const lines: string[] = [];

  lines.push('graph TD');

  // Define nodes
  for (const node of nodes) {
    const safeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDesc = node.description.replace(/"/g, "'");

    // Choose shape based on type
    let nodeDefinition = '';
    if (node.decision_type === 'condition') {
      nodeDefinition = `${safeId}{{"${safeDesc}"}}`;
    } else if (node.decision_type === 'action') {
      nodeDefinition = `${safeId}["${safeDesc}"]`;
    } else {
      nodeDefinition = `${safeId}("${safeDesc}")`;
    }

    lines.push(`  ${nodeDefinition}`);
  }

  lines.push('');

  // Define edges
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const safeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');

      node.children.forEach((childId, index) => {
        const safeChildId = childId.replace(/[^a-zA-Z0-9]/g, '_');

        // Add labels for branches
        if (node.children!.length > 1) {
          const label = index === 0 ? 'Yes' : 'No';
          lines.push(`  ${safeId} -->|${label}| ${safeChildId}`);
        } else {
          lines.push(`  ${safeId} --> ${safeChildId}`);
        }
      });
    }
  }

  lines.push('');
  lines.push(`%% Total Nodes: ${nodes.length}`);
  lines.push(`%% Tree Depth: ${calculateDepth(nodes)}`);

  return lines.join('\n');
}

/**
 * Generate JSON visualization
 */
function generateJSONVisualization(nodes: DecisionNode[]): string {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function buildTree(nodeId: string, visited = new Set<string>()): any {
    if (visited.has(nodeId)) return null; // Cycle detection

    const node = nodeMap.get(nodeId);
    if (!node) return null;

    visited.add(nodeId);

    const treeNode: any = {
      id: node.id,
      description: node.description,
      type: node.decision_type || 'branch',
    };

    if (node.metadata) {
      treeNode.metadata = node.metadata;
    }

    if (node.children && node.children.length > 0) {
      treeNode.children = node.children
        .map(childId => buildTree(childId, new Set(visited)))
        .filter(child => child !== null);
    }

    return treeNode;
  }

  // Find root nodes
  const rootNodes = nodes.filter(n => !n.parent);
  const trees = rootNodes.map(root => buildTree(root.id));

  const output = {
    trees: trees.length === 1 ? trees[0] : trees,
    metadata: {
      total_nodes: nodes.length,
      tree_depth: calculateDepth(nodes),
      root_count: rootNodes.length,
    },
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Main visualization function
 */
export async function run(input: VisualizeReasoningInput): Promise<VisualizeReasoningOutput> {
  // Validate input
  const validated = VisualizeReasoningInputSchema.parse(input);

  const { decision_path, format } = validated;

  if (decision_path.length === 0) {
    throw new Error('Decision path is empty. Cannot generate visualization.');
  }

  // Generate visualization based on format
  let visualization = '';

  switch (format) {
    case 'text':
      visualization = generateTextVisualization(decision_path);
      break;
    case 'mermaid':
      visualization = generateMermaidVisualization(decision_path);
      break;
    case 'json':
      visualization = generateJSONVisualization(decision_path);
      break;
  }

  const depth = calculateDepth(decision_path);

  return {
    visualization,
    format,
    node_count: decision_path.length,
    depth,
  };
}
