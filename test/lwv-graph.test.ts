import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import {
  Graph,
  CommunityGraph,
  graphToCommunityGraph,
} from '../src/lib/graph.js';
import { LwvGraph } from '../src/components/LwvGraph.js';
import '../src/components/lwv-graph.js';

const graphFixture: Graph = {
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

const communityGraphFixture: CommunityGraph =
  graphToCommunityGraph(graphFixture);

describe('LwvGraph', () => {
  let element: LwvGraph;

  beforeEach(async () => {
    element = await fixture(
      html`<lwv-graph .graph=${communityGraphFixture}></lwv-graph>`
    );
  });

  it('renders graph with cytoscape.js succesfully', () => {
    const graphContainer = element.shadowRoot!.querySelector('#graph')!;
    expect(graphContainer.classList.contains('__________cytoscape_container'))
      .to.be.true;
  });
});
