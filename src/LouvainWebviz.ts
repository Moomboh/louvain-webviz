import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LouvainWebvizGraph } from './LouvainWebvizGraph.js';
import { Graph, graphToCommunityGraph } from './graph.js';
import { initLouvainState, LouvainState, louvainStep } from './louvain.js';

const defaultGraph: Graph = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [
    { source: 'A', target: 'B', weight: 8 },
    { source: 'A', target: 'C', weight: 3 },
    { source: 'B', target: 'D', weight: 12 },
    { source: 'C', target: 'D', weight: 1 },
    { source: 'C', target: 'E', weight: 7 },
    { source: 'D', target: 'E', weight: 2 },
    { source: 'D', target: 'F', weight: 9 },
    { source: 'E', target: 'F', weight: 4 },
  ],
};

export class LouvainWebviz extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'louvain-webviz-graph': LouvainWebvizGraph,
    };
  }

  static styles = css`
    :host {
      font-family: sans-serif;
    }

    #graph {
      display: block;
      width: 800px;
    }
  `;

  @property({ attribute: false })
  get graph() {
    return this._graph;
  }

  set graph(graph: Graph) {
    this._graph = graph;
    this._state = initLouvainState(graphToCommunityGraph(graph));
  }

  @state()
  private _graph: Graph = defaultGraph;

  @state()
  private _state: LouvainState = initLouvainState(
    graphToCommunityGraph(defaultGraph)
  );

  render() {
    return html`
      <main>
        <button @click=${this.handleStep} ?disabled=${this._state.finished}>
          ${this._state.finished ? 'Finished' : 'Step'}
        </button>
        <louvain-webviz-graph
          id="graph"
          .graph=${this._state.graph}
        ></louvain-webviz-graph>
      </main>
    `;
  }

  handleStep() {
    this._state = { ...louvainStep(this._state) };
    this._state.graph = { ...this._state.graph };
  }
}
