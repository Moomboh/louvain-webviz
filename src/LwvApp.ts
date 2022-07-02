/* eslint-disable lit-a11y/anchor-is-valid */
import { LitElement, html, css } from 'lit';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TopAppBar } from '@material/mwc-top-app-bar';
import { property } from 'lit/decorators.js';

export class LwvApp extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'mwc-top-app-bar': TopAppBar,
    };
  }

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      font-size: 18px;
      font-family: sans-serif;
    }

    .app-title {
      text-decoration: none;
    }

    .app-title h1 {
      font-size: 1.5rem;
      color: #fff;
      text-decoration: none;
      font-weight: normal;
    }

    .app-footer {
      display: flex;
      justify-content: end;
      padding: 0.5rem;
    }

    .app-footer a {
      font-size: 0.8rem;
      text-decoration: none;
      margin-right: 0.5rem;
    }
  `;

  // TODO: this is also a workaround for the multi HTML-file setup, which should be
  //       generated during the build process.
  @property({ type: Number, attribute: 'route-depth' })
  routeDepth = 0;

  private get _baseHref() {
    return '../'.repeat(this.routeDepth);
  }

  render() {
    return html`
      <mwc-top-app-bar>
        <a slot="title" class="app-title" href="${this._baseHref}">
          <h1>Louvain Method Visualization</h1></a
        >
      </mwc-top-app-bar>
      <main>
        <slot></slot>
      </main>
      <div class="app-footer">
        <a href="${this._baseHref}imprint">Imprint</a>
        <a href="${this._baseHref}privacy">Privacy Policy</a>
      </div>
    `;
  }
}
