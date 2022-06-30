import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { LouvainWebvizCollapsible } from '../src/LouvainWebvizCollapsible.js';

import '../src/louvain-webviz-collapsible.js';

describe('LouvainWebvizCollapsible', () => {
  let element: LouvainWebvizCollapsible;
  let slottedContent: HTMLElement;

  beforeEach(async () => {
    element = await fixture(
      html`<louvain-webviz-collapsible heading="Collapsible test">
        <span id="slotted-content">Slotted content</span>
      </louvain-webviz-collapsible>`
    );

    slottedContent = element
      .shadowRoot!.querySelector('slot')!
      .assignedNodes()
      .find(
        node => (node as HTMLElement).id === 'slotted-content'
      )! as HTMLElement;
  });

  it('renders heading', () => {
    const heading = element.shadowRoot!.querySelector('.heading-text')!;
    expect(heading.textContent?.trim()).to.equal('Collapsible test');
  });

  it('renders slotted content', () => {
    expect(slottedContent?.textContent?.trim()).to.equal('Slotted content');
  });

  it('hides content initially', () => {
    expect(slottedContent.offsetParent).to.be.null;
  });

  it('shows content when clicked', async () => {
    const heading = element.shadowRoot!.querySelector(
      '.heading'
    )! as HTMLElement;
    heading.click();

    await element.updateComplete;

    expect(slottedContent.offsetParent).to.not.be.null;
  });
});
