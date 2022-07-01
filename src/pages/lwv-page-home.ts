import { LitElement, html } from 'lit';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Button } from '@material/mwc-button';
import { customElement } from 'lit/decorators.js';

@customElement('lwv-page-home')
export class LwvPageHome extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'mwc-button': Button,
    };
  }

  render() {
    return html``;
  }
}
