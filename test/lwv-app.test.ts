import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { LwvApp } from '../src/LwvApp.js';
import '../src/lwv-app.js';

describe('LwvApp', () => {
  let element: LwvApp;

  beforeEach(async () => {
    element = await fixture(
      html`<lwv-app><span id="slotted-content">Slotted content</span></lwv-app>`
    );
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    expect(h1).to.exist;
    expect(h1.textContent?.length).to.be.greaterThan(0);
  });

  it('renders slotted content', () => {
    const slottedContent = element
      .shadowRoot!.querySelector('slot')!
      .assignedNodes()
      .find(
        node => (node as HTMLElement).id === 'slotted-content'
      )! as HTMLElement;

    expect(slottedContent?.textContent?.trim()).to.equal('Slotted content');
  });
});
