import { expect } from '@open-wc/testing';
import {
  CommunityGraph,
  communityGraphToGraph,
  Graph,
  graphToCommunityGraph,
  renderGraph,
} from '../src/graph.js';

const graph: Graph = {
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
  edges: [
    { source: 'A', target: 'A', weight: 3 },
    { source: 'A', target: 'B', weight: 5 },
    { source: 'A', target: 'C', weight: 4 },
    { source: 'B', target: 'C', weight: 2 },
  ],
};

const communityGraph: CommunityGraph = {
  nodes: ['A', 'B', 'C'],
  matrix: [
    [3, 5, 4],
    [5, 0, 2],
    [4, 2, 0],
  ],
  communities: [new Set(['A']), new Set(['B']), new Set(['C'])],
};

const graphFromCommunityGraph: Graph = {
  nodes: [
    { id: 'c0' },
    { id: 'c1' },
    { id: 'c2' },
    { id: 'A', parent: 'c0' },
    { id: 'B', parent: 'c1' },
    { id: 'C', parent: 'c2' },
  ],
  edges: [
    { id: 'A-A', source: 'A', target: 'A', label: '3' },
    { id: 'A-B', source: 'A', target: 'B', label: '5' },
    { id: 'A-C', source: 'A', target: 'C', label: '4' },
    { id: 'B-C', source: 'B', target: 'C', label: '2' },
  ],
};

const graphWithoutIdsAndWeights: Graph = {
  nodes: ['A', 'B', 'C'],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
  ],
};

describe('graphToCommunityGraph', () => {
  it('correctly converts Graph to CommunityGraph', () => {
    expect(graphToCommunityGraph(graph)).to.deep.equal(communityGraph);
  });

  it('correctly converts Graph without ids and weights to CommunityGraph', () => {
    expect(graphToCommunityGraph(graphWithoutIdsAndWeights)).to.deep.equal({
      nodes: ['A', 'B', 'C'],
      matrix: [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ],
      communities: [new Set(['A']), new Set(['B']), new Set(['C'])],
    });
  });
});

describe('communityGraphToGraph', () => {
  it('correctly converts CommunityGraph to Graph', () => {
    expect(communityGraphToGraph(communityGraph)).to.deep.equal(
      graphFromCommunityGraph
    );
  });
});

describe('renderGraph', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    element.id = 'graph';
    document.body.appendChild(element);
  });

  it('renders graph succesfully', () => {
    renderGraph(graph, element);
    expect(element.querySelector('canvas')).to.exist;
  });

  it('renders graph without ids and weights succesfully', () => {
    renderGraph(graphWithoutIdsAndWeights, element);
    expect(element.querySelector('canvas')).to.exist;
  });
});
