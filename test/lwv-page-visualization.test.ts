import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { Slider } from '@material/mwc-slider';
import { SliderRange } from '@material/mwc-slider/slider-range.js';

import {
  defaultGraph,
  LwvPageVisualization,
} from '../src/pages/visualization/lwv-page-visualization.js';
import { LwvGraph } from '../src/components/LwvGraph.js';
import '../src/lwv-app.js';
import { graphToCommunityGraph } from '../src/lib/graph.js';
import { LouvainState } from '../src/lib/louvain.js';

describe('LwvPageVisualization', () => {
  let element: LwvPageVisualization;
  beforeEach(async () => {
    element = await fixture(
      html`<lwv-page-visualization></lwv-page-visualization>`
    );
  });

  it('succesfully generates and renders a random graph from user input', async () => {
    const nNodesInput: HTMLInputElement = element.shadowRoot!.querySelector(
      '.rndgen-nodes-group .slider-input'
    )!;
    nNodesInput.value = '15';
    nNodesInput.dispatchEvent(new Event('input'));

    const nEdgesInput: HTMLInputElement = element.shadowRoot!.querySelector(
      '.rndgen-edges-group .slider-input'
    )!;
    nEdgesInput.value = '20';
    nEdgesInput.dispatchEvent(new Event('input'));

    const minWeightInput: HTMLInputElement = element.shadowRoot!.querySelector(
      '.rndgen-range-group .slider-input:first-child'
    )!;
    minWeightInput.value = '2';
    minWeightInput.dispatchEvent(new Event('change'));

    const maxWeightInput: HTMLInputElement = element.shadowRoot!.querySelector(
      '.rndgen-range-group .slider-input:last-child'
    )!;
    maxWeightInput.value = '30';
    maxWeightInput.dispatchEvent(new Event('change'));

    const generateButton: HTMLButtonElement = element.shadowRoot!.querySelector(
      '.rndgen-collapsible mwc-button'
    )!;
    generateButton.click();

    await element.updateComplete;

    const { graph } = element;

    expect(graph).to.exist;

    const lwvGraph = element.shadowRoot!.querySelector('lwv-graph') as LwvGraph;

    expect(lwvGraph.graph).to.deep.equal(graphToCommunityGraph(graph));
    expect(lwvGraph.shadowRoot!.querySelector('#graph canvas')).to.exist;

    expect(graph.nodes.length).to.equal(15);
    expect(graph.edges.length).to.equal(20);
    expect(
      graph.edges.every(
        edge => (edge.weight ?? 0) >= 2 && (edge.weight ?? Infinity) <= 30
      )
    ).to.be.true;
  }).timeout(30000);

  it('produces the correct community aggregation when the buttons', async () => {
    const stepButton: HTMLButtonElement =
      element.shadowRoot!.querySelector('.step-button')!;

    while (!stepButton.disabled) {
      stepButton.click();
      // eslint-disable-next-line no-await-in-loop
      await element.updateComplete;
    }

    const aggregateButton: HTMLButtonElement =
      element.shadowRoot!.querySelector('.aggregate-button')!;

    aggregateButton.click();

    await element.updateComplete;

    expect(element.currentState.graph.matrix).to.deep.equal([
      [5, 6, 1],
      [6, 7, 3],
      [1, 3, 8],
    ]);
  }).timeout(30000);

  it('initializes state successfully', () => {
    const expectedInitialState: LouvainState = {
      graph: graphToCommunityGraph(defaultGraph),
      currentNodeIndex: 0,
      currentCommunityIndex: 0,
      neighbourCommunities: [1, 2, 4],
      deltaModularities: [],
      communitiesChanged: false,
      finished: false,
    };

    expect(element.currentState).to.deep.equal(expectedInitialState);
  });

  it('sets rndgen nodes via slider and correctly updates max edges', async () => {
    const nNodesSlider: Slider = element.shadowRoot!.querySelector(
      '.rndgen-nodes-group .slider'
    )!;
    nNodesSlider.value = 3;
    nNodesSlider.dispatchEvent(
      new CustomEvent('input', { detail: { value: 3 } })
    );

    await element.updateComplete;

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-nodes-group .slider-input'
        ) as HTMLInputElement
      ).value
    ).to.equal('3');

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-edges-group .slider-input'
        ) as HTMLInputElement
      ).value
    ).to.equal('3');

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-edges-group .slider'
        ) as HTMLInputElement
      ).max
    ).to.equal(3);
  });

  it('sets rndgen edges via slider', async () => {
    const nEdgesSlider: Slider = element.shadowRoot!.querySelector(
      '.rndgen-edges-group .slider'
    )!;
    nEdgesSlider.value = 3;
    nEdgesSlider.dispatchEvent(
      new CustomEvent('input', { detail: { value: 3 } })
    );

    await element.updateComplete;

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-edges-group .slider-input'
        ) as HTMLInputElement
      ).value
    ).to.equal('3');
  });

  it('sets rndgen min and max weight via slider', async () => {
    const weightSlider: SliderRange = element.shadowRoot!.querySelector(
      '.rndgen-range-group .slider'
    )!;
    weightSlider.valueStart = 3;
    weightSlider.dispatchEvent(
      new CustomEvent('input', { detail: { value: 3, thumb: 1 } })
    );
    weightSlider.valueEnd = 5;
    weightSlider.dispatchEvent(
      new CustomEvent('input', { detail: { value: 5, thumb: 2 } })
    );

    await element.updateComplete;

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-range-group .slider-input:first-child'
        ) as HTMLInputElement
      ).value
    ).to.equal('3');

    expect(
      (
        element.shadowRoot!.querySelector(
          '.rndgen-range-group .slider-input:last-child'
        ) as HTMLInputElement
      ).value
    ).to.equal('5');
  });

  it('correctly updates graph when JSON is changed', async () => {
    element.shadowRoot!.querySelector('lwv-json-editor')!.dispatchEvent(
      new CustomEvent('json-editor-change', {
        detail: {
          json: defaultGraph,
        },
      })
    );

    await element.updateComplete;

    expect(element.currentState.graph).to.deep.equal(
      graphToCommunityGraph(defaultGraph)
    );
  });
});
