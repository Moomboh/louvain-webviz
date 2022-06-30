import { LitElement, html, css, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { CommunityGraph, renderGraph, communityGraphToGraph } from './graph.js';

export class LouvainWebvizGraph extends LitElement {
  static styles = css`
    :host {
      font-family: sans-serif;
    }

    #graph {
      position: relative;
      width: 100%;
      height: 100%;
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
