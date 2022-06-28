import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { LouvainWebviz } from '../src/LouvainWebviz.js';
import { LouvainWebvizGraph } from '../src/LouvainWebvizGraph.js';
import '../src/louvain-webviz.js';
import { graphToCommunityGraph } from '../src/graph.js';

describe('LouvainWebviz', () => {
  let element: LouvainWebviz;
  beforeEach(async () => {
    element = await fixture(html`<louvain-webviz></louvain-webviz>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    expect(h1).to.exist;
    expect(h1.textContent?.length).to.be.greaterThan(0);
  });

  it('succesfully generates a random graph from user input', async () => {
    const nNodesInput: HTMLInputElement =
      element.shadowRoot!.querySelector('#rndgen-n-nodes')!;
    nNodesInput.value = '15';
    nNodesInput.dispatchEvent(new Event('input'));

    const nEdgesInput: HTMLInputElement =
      element.shadowRoot!.querySelector('#rndgen-n-edges')!;
    nEdgesInput.value = '20';
    nEdgesInput.dispatchEvent(new Event('input'));

    const minWeightInput: HTMLInputElement =
      element.shadowRoot!.querySelector('#rndgen-min-weight')!;
    minWeightInput.value = '2';
    minWeightInput.dispatchEvent(new Event('change'));

    const maxWeightInput: HTMLInputElement =
      element.shadowRoot!.querySelector('#rndgen-max-weight')!;
    maxWeightInput.value = '30';
    maxWeightInput.dispatchEvent(new Event('change'));

    const generateButton: HTMLButtonElement =
      element.shadowRoot!.querySelector('#rndgen-generate')!;
    generateButton.click();

    await element.updateComplete;

    const { graph } = element;

    expect(graph).to.exist;

    const louvainWebvizGraph = element.shadowRoot!.querySelector(
      'louvain-webviz-graph'
    ) as LouvainWebvizGraph;

    const louvainWebvizGraphContainer =
      louvainWebvizGraph.shadowRoot!.querySelector('#graph') as HTMLElement;

    expect(louvainWebvizGraph.graph).to.deep.equal(
      graphToCommunityGraph(graph)
    );
    expect(
      louvainWebvizGraphContainer.classList.contains(
        '__________cytoscape_container'
      )
    );

    expect(graph.nodes.length).to.equal(15);
    expect(graph.edges.length).to.equal(20);
    expect(
      graph.edges.every(
        edge => (edge.weight ?? 0) >= 2 && (edge.weight ?? Infinity) <= 30
      )
    ).to.be.true;
  });
});
