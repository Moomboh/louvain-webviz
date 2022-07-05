import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import katex from 'katex';

export class LwvKatex extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: String })
  expression = '';

  @property({ type: Boolean, attribute: 'display-mode' })
  displayMode = false;

  render() {
    return html`<span class="katex-container"></span>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  protected updated(): void {
    const katexContainer: HTMLDivElement =
      this.querySelector('.katex-container')!;

    katex.render(this.expression, katexContainer, {
      displayMode: this.displayMode,
    });
  }
}
