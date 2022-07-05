import { expect } from '@open-wc/testing';
import {
  CommunityGraph,
  Graph,
  graphToCommunityGraph,
} from '../src/lib/graph.js';
import {
  communityAggregation,
  initLouvainState,
  louvainStep,
  moveDeltaModularity,
} from '../src/lib/louvain.js';

describe('communityAggregation', () => {
  it('correctly aggregates communities', () => {
    const graph: CommunityGraph = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      matrix: [
        [1, 5, 4, 0, 0],
        [5, 0, 3, 0, 1],
        [4, 3, 2, 1, 0],
        [0, 0, 1, 0, 7],
        [0, 1, 0, 7, 2],
      ],
      communities: [new Set(['A', 'B', 'C']), new Set(['D', 'E'])],
    };

    const aggregatedGraph = communityAggregation(graph);

    expect(aggregatedGraph.nodes).to.deep.equal(['ac0', 'ac1']);
    expect(aggregatedGraph.matrix).to.deep.equal([
      [15, 2],
      [2, 9],
    ]);
  });
});

describe('louvainStep', () => {
  it('creates expected communities', () => {
    const graph: Graph = {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: [
        { source: 'A', target: 'B', weight: 5 },
        { source: 'A', target: 'C', weight: 4 },
        { source: 'A', target: 'E', weight: 1 },
        { source: 'B', target: 'C', weight: 2 },
        { source: 'C', target: 'D', weight: 7 },
        { source: 'D', target: 'F', weight: 3 },
        { source: 'E', target: 'F', weight: 8 },
      ],
    };

    const communityGraph = graphToCommunityGraph(graph);

    let state = initLouvainState(communityGraph);

    while (!state.finished) {
      state = louvainStep(state);
    }

    expect(
      new Set(state.graph.communities.filter(c => c.size > 0))
    ).to.deep.equal(
      new Set([new Set(['A', 'B']), new Set(['C', 'D']), new Set(['E', 'F'])])
    );
  });
});

describe('moveDeltaModularity', () => {
  it('correctly calculates modularity contribution', () => {
    const graph: CommunityGraph = {
      nodes: ['A', 'B', 'C', 'D'],
      matrix: [
        [0, 1, 2, 3],
        [1, 0, 3, 2],
        [2, 3, 0, 1],
        [3, 2, 1, 0],
      ],
      communities: [new Set(['A', 'B']), new Set(['C', 'D'])],
    };

    const deltaModularity = moveDeltaModularity(
      graph,
      'B',
      graph.communities[0],
      graph.communities[1]
    );

    expect(deltaModularity).to.be.approximately(0.20833, 0.00001);
  });
});
