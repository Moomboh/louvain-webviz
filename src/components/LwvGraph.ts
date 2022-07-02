import { LitElement, html, css, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import {
  CommunityGraph,
  renderGraph,
  communityGraphToGraph,
} from '../lib/graph.js';

export class LwvGraph extends LitElement {
  static styles = css`
    :host {
      font-family: sans-serif;
    }

    #graph {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: var(--lwv-graph-min-height, 50vh);
      overflow: hidden;
    }
  `;

  @property({ attribute: false })
  graph: CommunityGraph = {
    nodes: [],
    matrix: [],
    communities: [],
  };

  render() {
    return html` <div id="graph" part="graph"></div> `;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('graph')) {
      this.renderGraph();
    }
  }

  renderGraph() {
    const graphEl = this.shadowRoot!.querySelector('#graph')!;
    renderGraph(communityGraphToGraph(this.graph), graphEl);
  }
}
