import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { Button } from '@material/mwc-button';
import { LwvPageHome } from '../src/pages/lwv-page-home.js';

describe('LwvPageHome', () => {
  let element: LwvPageHome;

  before(async () => {
    // TODO: should not be necessary to register component here. Should already be done
    //       automatically by the `@customElements` decorator. Like in
    //       `src/lwv-page-visualization.test.ts`
    if (!customElements.get('lwv-page-home')) {
      customElements.define('lwv-page-home', LwvPageHome);
    }
  });

  beforeEach(async () => {
    element = await fixture(html`<lwv-page-home></lwv-page-home>`);
  });

  it('renders a h2', async () => {
    const h2 = element.shadowRoot!.querySelector('h2')!;
    expect(h2).to.exist;
    expect(h2.textContent?.length).to.be.greaterThan(0);
  });

  it('scrolls to explanation on button click', async () => {
    const explanationButton: Button = element.shadowRoot!.querySelector(
      '.hero-actions-button-explanation'
    )!;
    explanationButton.click();

    await element.updateComplete;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(window.screenTop).to.be.greaterThan(0);
      }, 500);
      resolve();
    });
  });

  it('scrolls to explanation if href ends in #explanation', async () => {
    window.location.href = '#explanation';
    element = await fixture(html`<lwv-page-home></lwv-page-home>`);

    await element.updateComplete;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(window.screenTop).to.be.greaterThan(0);
      }, 500);
      resolve();
    });
  });
});
