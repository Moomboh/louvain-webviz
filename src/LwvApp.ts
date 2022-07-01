import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Button } from '@material/mwc-button';
import { TopAppBar } from '@material/mwc-top-app-bar';
import { Slider } from '@material/mwc-slider';
import { SliderRange } from '@material/mwc-slider/slider-range';
import { Formfield } from '@material/mwc-formfield';
import { TextField } from '@material/mwc-textfield';
import { LwvGraph } from './components/LwvGraph.js';
import { LwvCollapsible } from './components/LwvCollapsible.js';
import { LwvJsonEditor } from './components/LwvJsonEditor.js';
import {
  CommunityGraph,
  generateRandomGraph,
  Graph,
  graphToCommunityGraph,
} from './lib/graph.js';
import {
  communityAggregation,
  initLouvainState,
  LouvainState,
  louvainStep,
} from './lib/louvain.js';

export const defaultGraph: Graph = {
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

export class LwvApp extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'lwv-graph': LwvGraph,
      'lwv-collapsible': LwvCollapsible,
      'lwv-json-editor': LwvJsonEditor,
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
      font-size: 20px;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
    }

    h1 {
      font-size: 1.75rem;
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

    .left-sidebar {
      background-color: #f4f4f4;
      padding: 1em;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .sidebar-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .graph-container {
      pointer-events: none;
      padding: 1em;
      flex: 1;
      height: 80vh;
    }

    @media (min-width: 1200px) {
      .left-sidebar {
        width: 400px;
      }

      .graph-container {
        pointer-events: initial;
        height: calc(100vh - 64px);
      }
    }

    .mb-0_5 {
      margin-bottom: 0.5em;
    }

    .mb-1 {
      margin-bottom: 1em;
    }

    .mb-1_5 {
      margin-bottom: 1.5em;
    }

    .mb-2 {
      margin-bottom: 2em;
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

  @state()
  private _graph: Graph = defaultGraph;

  @property({ attribute: false })
  get graph() {
    return this._graph;
  }

  set graph(graph: Graph) {
    this._graph = graph;
    this._stateHistory = [initLouvainState(graphToCommunityGraph(graph))];
    // eslint-disable-next-line prefer-destructuring
    this.currentState = this._stateHistory[0];
  }

  @state()
  private _stateHistory: LouvainState[] = [
    initLouvainState(graphToCommunityGraph(this._graph)),
  ];

  @state()
  private _currentState = this._stateHistory[0];

  @property({ attribute: false })
  get currentState() {
    return this._currentState;
  }

  set currentState(s: LouvainState) {
    // need to spread all nested objects to make sure lit updates
    this._currentState = { ...s };
    this._currentNode = s.graph.nodes[s.currentNodeIndex];
    this._currentGraph = { ...s.graph };
    this._currentDeltaModularities = [...s.deltaModularities];
    this._currentNeighbourCommunities = [...s.neighbourCommunities];
  }

  @state()
  private _currentGraph: CommunityGraph = {
    nodes: [],
    matrix: [],
    communities: [],
  };

  @state()
  private _currentNode = '';

  @state()
  private _currentDeltaModularities: number[] = [];

  @state()
  private _currentNeighbourCommunities: number[] = [];

  @state()
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
  private _rndGenMaxNodes = 20;

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

  constructor() {
    super();
    this.graph = defaultGraph;
  }

  render() {
    return html`
      <mwc-top-app-bar>
        <h1 slot="title">Louvain Method Visualization</h1>
      </mwc-top-app-bar>
      <main class="main">
        <div class="left-sidebar">
          <lwv-collapsible
            heading="Generate random graph"
            class="mb-1 rndgen-collapsible"
          >
            <span class="label">Number of nodes</span>
            <div class="slider-group mb-1 rndgen-nodes-group">
              <mwc-slider
                discrete
                step="1"
                min="3"
                max="${this._rndGenMaxNodes}"
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
            <div class="slider-group mb-1 rndgen-edges-group">
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
            <div class="slider-group mb-1 rndgen-range-group">
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
              class="mb-1"
              outlined
            >
              Generate random graph
            </mwc-button>
          </lwv-collapsible>

          <lwv-collapsible heading="Edit graph JSON" class="mb-2">
            <lwv-json-editor
              .json="${this.graph}"
              @json-editor-change="${this._handleJsonEditorChange}"
            ></lwv-json-editor>
          </lwv-collapsible>

          <mwc-button
            @click=${this._handleStep}
            ?disabled=${this._currentState.finished}
            raised
            class="mb-0_5 step-button"
          >
            ${this._currentState.finished ? 'Finished' : 'Step'}
          </mwc-button>

          <mwc-button
            @click=${this._handleCommunityAggregation}
            ?disabled=${!this._currentState.finished}
            raised
            class="mb-1 aggregate-button"
          >
            Community Aggregation
          </mwc-button>

          ${!this._currentState.finished
            ? html`
                <div class="sidebar-panel">
                  <span
                    >Current node: <strong>${this._currentNode}</strong></span
                  >
                  ${this._currentDeltaModularities.map(
                    (deltaModularity, i) => html`
                      <span>
                        ${this._currentNode}&rarr;c${this
                          ._currentNeighbourCommunities[i]}:
                        &Delta;G =
                        <strong
                          >${Math.round(deltaModularity * 1000) / 1000}</strong
                        >
                      </span>
                    `
                  )}
                </div>
              `
            : html``}
        </div>
        <div class="graph-container">
          <lwv-graph id="graph" .graph=${this._currentGraph}></lwv-graph>
        </div>
      </main>
    `;
  }

  private _handleStep() {
    this._stateHistory = [
      ...this._stateHistory,
      { ...louvainStep(this._currentState) },
    ];
    this.currentState = this._stateHistory[this._stateHistory.length - 1];
  }

  private _handleGenerateRandomGraph() {
    this.graph = generateRandomGraph(
      this._rndGenNodes,
      this._rndGenEdges,
      this._rndGenMinWeight,
      this._rndGenMaxWeight
    );
  }

  private _handleCommunityAggregation() {
    this._stateHistory = [
      ...this._stateHistory,
      {
        ...initLouvainState({
          ...communityAggregation(this._currentState.graph),
        }),
      },
    ];

    this.currentState = this._stateHistory[this._stateHistory.length - 1];
  }

  private _handleJsonEditorChange(e: CustomEvent) {
    this.graph = e.detail.json;
  }
}
