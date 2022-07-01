import { LitElement, html, css } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { property } from 'lit/decorators.js';

export class LwvCollapsible extends LitElement {
  static styles = css`
    :host {
      font-family: sans-serif;
      background-color: #fff;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .heading {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: none;
      background-color: transparent;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem 0rem;
    }
  `;

  @property({ type: String })
  heading = '';

  @property({ type: Boolean })
  show = false;

  render() {
    return html`
      <button
        class="heading"
        part="heading"
        @click="${() => {
          this.show = !this.show;
        }}"
        icon="${this.show ? 'expand_less' : 'expand_more'}"
      >
        <span class="heading-text">${this.heading}</span>
        <mwc-icon class="heading-icon"
          >${cache(this.show ? 'expand_less' : 'expand_more')}</mwc-icon
        >
      </button>
      <slot style="${this.show ? 'display: block;' : 'display: none;'}"></slot>
    `;
  }
}
