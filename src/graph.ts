import { cytoscape, coseBilkent } from '_vendors';

export interface Node {
  id: string;
  label?: string;
  parent?: string;
}

export interface Edge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

export interface Graph {
  nodes: Node[] | string[];
  edges: Edge[];
}

export interface CommunityGraph {
  nodes: string[];
  matrix: number[][];
  communities: Set<string>[];
}

export function graphToCommunityGraph(graph: Graph): CommunityGraph {
  const nodes = graph.nodes.map((n: Node | string) =>
    typeof n === 'string' ? n : n.id
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const matrix = Array.from(Array(nodes.length), _ =>
    Array(nodes.length).fill(0)
  );

  for (const edge of graph.edges) {
    const i = nodes.indexOf(edge.source);
    const j = nodes.indexOf(edge.target);

    const weight = edge.weight || 1;

    matrix[i][j] = weight;
    matrix[j][i] = weight;
  }

  const communites = nodes.map(n => new Set([n]));

  return {
    nodes,
    matrix,
    communities: communites,
  };
}

export function communityGraphToGraph(communityGraph: CommunityGraph): Graph {
  const communityNodes = communityGraph.communities.map((_, i) => ({
    id: `c${i}`,
  }));

  let nodes: { id: string; parent?: string }[] = communityGraph.nodes.map(
    id => ({
      id,
      parent: `c${communityGraph.communities.findIndex(c => c.has(id))}`,
    })
  );

  nodes = [
    ...communityNodes.filter((_, i) => communityGraph.communities[i].size > 0),
    ...nodes,
  ];

  const edges: Edge[] = [];

  for (let i = 0; i < communityGraph.nodes.length; i += 1) {
    for (let j = i; j < communityGraph.nodes.length; j += 1) {
      if (communityGraph.matrix[i][j] !== 0) {
        edges.push({
          id: `${communityGraph.nodes[i]}-${communityGraph.nodes[j]}`,
          source: communityGraph.nodes[i],
          target: communityGraph.nodes[j],
          label: communityGraph.matrix[i][j].toString(),
        });
      }
    }
  }

  return { nodes, edges };
}

export function renderGraph(graph: Graph, el: Element) {
  cytoscape.use(coseBilkent);
  return cytoscape({
    container: el,

    ready() {
      this.layout({
        name: 'cose-bilkent',
        animationDuration: 0,
        randomize: false,
      }).run();
    },

    elements: [
      ...graph.nodes.map((node: Node | string) =>
        typeof node === 'string'
          ? { data: { id: node, label: node } }
          : {
              data: {
                id: node.id,
                label: node.label || node.id,
                parent: node.parent,
              },
            }
      ),
      ...graph.edges.map(edge => ({
        data: {
          id: edge.id || `${edge.source}-${edge.target}`,
          label: edge.label || edge.weight || edge.id,
          source: edge.source,
          target: edge.target,
        },
      })),
    ],

    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          label: 'data(label)',
          color: '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
        },
      },
      {
        selector: 'node:parent',
        css: {
          'background-opacity': 0.333,
          'background-color': 'blue',
          'text-valign': 'bottom',
          'text-halign': 'right',
          color: 'blue',
          'font-size': '10px',
          'text-margin-x': '-14px',
          'text-margin-y': '-12px',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          label: 'data(label)',
          'line-color': '#222',
          'text-background-color': '#fff',
          'text-background-shape': 'round-rectangle',
          'text-background-opacity': 1,
          'curve-style': 'bezier',
        },
      },
    ],
  });
}
