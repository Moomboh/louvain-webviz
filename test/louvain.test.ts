import { expect } from '@open-wc/testing';
import { communityAggregation } from '../src/louvain.js';

describe('communityAggregation', () => {
  it('correctly aggregates communities', () => {
    const graph = {
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
