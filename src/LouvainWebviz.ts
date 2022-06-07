import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Button } from '@material/mwc-button';
import { TopAppBar } from '@material/mwc-top-app-bar';
import { Slider } from '@material/mwc-slider';
import { SliderRange } from '@material/mwc-slider/slider-range';
import { Formfield } from '@material/mwc-formfield';
import { TextField } from '@material/mwc-textfield';
import { LouvainWebvizGraph } from './LouvainWebvizGraph.js';
import { generateRandomGraph, Graph, graphToCommunityGraph } from './graph.js';
import { initLouvainState, LouvainState, louvainStep } from './louvain.js';

const defaultGraph: Graph = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [
    { source: 'A', target: 'B', weight: 5 },
    { source: 'A', target: 'C', weight: 4 },
    { source: 'A', target: 'E', weight: 1 },
    { source: 'B', target: 'C', weight: 2 },
    { source: 'C', target: 'D', weight: 7 },
    { source: 'D', target: 'F', weight: 3 },
    { source: 'E', target: 'F', weight: 8 },
  ],
};

export class LouvainWebviz extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'louvain-webviz-graph': LouvainWebvizGraph,
      'mwc-button': Button,
      'mwc-top-app-bar': TopAppBar,
      'mwc-slider': Slider,
      'mwc-formfield': Formfield,
      'mwc-textfield': TextField,
      'mwc-slider-range': SliderRange,
    };
  }

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
    }

    #graph {
      display: block;
      width: 99%; /* 99% because otherwise we get weird overflow issues */
      height: 99%; /* 99% because otherwise we get weird overflow issues */
    }

    .main {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
    }

    .left-panel,
    .right-panel {
      background-color: #f4f4f4;
      padding: 1em;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .graph-container {
      pointer-events: none;
      padding: 1em;
      flex: 1;
    }

    @media (min-width: 800px) {
      .left-panel {
        width: 300px;
      }

      .right-panel {
        width: 200px;
      }

      .graph-container {
        pointer-events: initial;
        height: calc(100vh - 64px);
      }
    }

    .mb-1 {
      margin-bottom: 1em;
    }

    .section-title {
      font-size: 1.1em;
    }

    .label {
      font-size: 0.9em;
      color: #666;
    }

    .slider-group {
      display: flex;
    }

    .slider {
      flex: 1;
    }

    .slider-input {
      width: 5em;
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

  @state()
  private _lastState: LouvainState | null = null;

  private __rndGenNodes = 10;

  @state()
  private get _rndGenNodes() {
    return this.__rndGenNodes;
  }

  private set _rndGenNodes(value) {
    this.__rndGenNodes = value;
    if (this._rndGenMaxEdges < this._rndGenEdges) {
      this._rndGenEdges = this._rndGenMaxEdges;
    }
  }

  @state()
  private _rndGenEdges = 10;

  @state()
  private _rndGenMinWeight = 1;

  @state()
  private _rndGenMaxWeight = 20;

  @state()
  private get _rndGenMaxEdges() {
    return (this._rndGenNodes * (this._rndGenNodes - 1)) / 2;
  }

  @state()
  private get _lastNode() {
    return this._lastState?.graph.nodes[this._lastState.currentNodeIndex];
  }

  render() {
    return html`
      <mwc-top-app-bar>
        <div slot="title">Louvain Method Visualization</div>
      </mwc-top-app-bar>
      <main class="main">
        <div class="left-panel">
          <span class="section-title mb-1">Generate random graph</span>

          <span class="label">Number of nodes</span>
          <div class="slider-group mb-1">
            <mwc-slider
              discrete
              step="1"
              min="3"
              max="100"
              value="${this._rndGenNodes}"
              @input="${(e: CustomEvent) => {
                this._rndGenNodes = e.detail.value;
              }}"
              class="slider"
            >
            </mwc-slider>
            <mwc-textfield
              type="number"
              outlined
              value="${this._rndGenNodes}"
              class="slider-input"
              @input="${(e: InputEvent) => {
                this._rndGenNodes = parseInt(
                  (e.target as HTMLInputElement).value,
                  10
                );
              }}"
            ></mwc-textfield>
          </div>

          <span class="label">Number of edges</span>
          <div class="slider-group mb-1">
            <mwc-slider
              discrete
              step="1"
              min="3"
              max="${this._rndGenMaxEdges}"
              value="${this._rndGenEdges}"
              @input="${(e: CustomEvent) => {
                this._rndGenEdges = e.detail.value;
              }}"
              class="slider"
            >
            </mwc-slider>
            <mwc-textfield
              type="number"
              outlined
              min="3"
              value="${this._rndGenEdges}"
              class="slider-input"
              @input="${(e: InputEvent) => {
                this._rndGenEdges = parseInt(
                  (e.target as HTMLInputElement).value,
                  10
                );
              }}"
            ></mwc-textfield>
          </div>

          <span class="label mb-1">Range of edge weights</span>
          <div class="slider-group mb-1">
            <mwc-textfield
              type="number"
              min="1"
              max="100"
              label="min"
              outlined
              value="${this._rndGenMinWeight}"
              class="slider-input"
              @change="${(e: InputEvent) => {
                this._rndGenMinWeight = parseInt(
                  (e.target as HTMLInputElement).value,
                  10
                );
              }}"
            ></mwc-textfield>
            <mwc-slider-range
              min="1"
              max="100"
              valueStart="${this._rndGenMinWeight}"
              valueEnd="${this._rndGenMaxWeight}"
              class="slider mb-1"
              @input="${(e: CustomEvent) => {
                const { value, thumb } = e.detail;

                if (thumb === 1) {
                  this._rndGenMinWeight = value;
                }

                if (thumb === 2) {
                  this._rndGenMaxWeight = value;
                }
              }}"
            >
            </mwc-slider-range>
            <mwc-textfield
              type="number"
              min="1"
              max="100"
              label="max"
              outlined
              value="${this._rndGenMaxWeight}"
              class="slider-input"
              @change="${(e: InputEvent) => {
                this._rndGenMaxWeight = parseInt(
                  (e.target as HTMLInputElement).value,
                  10
                );
              }}"
            ></mwc-textfield>
          </div>

          <mwc-button
            @click=${this._handleGenerateRandomGraph}
            outlined
            class="mb-1"
          >
            Generate random graph
          </mwc-button>

          <mwc-button
            @click=${this._handleStep}
            ?disabled=${this._state.finished}
            raised
          >
            ${this._state.finished ? 'Finished' : 'Step'}
          </mwc-button>
        </div>
        <div class="graph-container">
          <louvain-webviz-graph
            id="graph"
            .graph=${this._state.graph}
          ></louvain-webviz-graph>
        </div>
        <div class="right-panel">
          ${this._lastState !== null
            ? html`
                <span class="section-title mb-1">Last step</span>
                <span>Node: <strong>${this._lastNode}</strong></span>
                ${this._lastState.deltaModularities.map(
                  (deltaModularity, i) => html`
                    <span>
                      ${this._lastNode}&rarr;c${this._lastState
                        ?.neighbourCommunities[i]}:
                      &Delta;G =
                      <strong
                        >${Math.round(deltaModularity * 1000) / 1000}</strong
                      >
                    </span>
                  `
                )}
              `
            : html``}
        </div>
      </main>
    `;
  }

  private _handleStep() {
    this._lastState = this._state;
    this._state = { ...louvainStep(this._state) };
    this._state.graph = { ...this._state.graph };
  }

  private _handleGenerateRandomGraph() {
    this.graph = generateRandomGraph(
      this._rndGenNodes,
      this._rndGenEdges,
      this._rndGenMinWeight,
      this._rndGenMaxWeight
    );
  }
}
