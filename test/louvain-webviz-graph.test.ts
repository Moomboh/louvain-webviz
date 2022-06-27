import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { Graph, CommunityGraph, graphToCommunityGraph } from '../src/graph.js';
import { LouvainWebvizGraph } from '../src/LouvainWebvizGraph.js';
import '../src/louvain-webviz-graph.js';

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

describe('LouvainWebvizGraph', () => {
  let element: LouvainWebvizGraph;

  beforeEach(async () => {
    element = await fixture(
      html`<louvain-webviz-graph
        .graph=${communityGraphFixture}
      ></louvain-webviz-graph>`
    );
  });

  it('renders graph with cytoscape.js succesfully', () => {
    const graphContainer = element.shadowRoot!.querySelector('#graph')!;
    expect(graphContainer.classList.contains('__________cytoscape_container'))
      .to.be.true;
  });
});
