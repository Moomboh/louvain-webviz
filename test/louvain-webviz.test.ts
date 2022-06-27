import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { LouvainWebviz } from '../src/LouvainWebviz.js';
import '../src/louvain-webviz.js';

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
});
