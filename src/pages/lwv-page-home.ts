import { LitElement, html, css } from 'lit';
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

  static styles = css`
    * {
      box-sizing: border-box;
    }

    figcaption {
      font-size: 0.9rem;
    }

    .citation {
      font-size: 0.8rem;
    }

    .hero-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50vh;
      background-image: url('assets/img/louvain-webviz-background.png');
      background-position: center;
      background-size: cover;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    @media (min-width: 900px) {
      .hero-actions {
        flex-direction: row;
      }
    }

    .hero-actions-link {
      text-decoration: none;
      color: #fff;
      margin-bottom: 1rem;
      margin-left: 1rem;
    }

    .hero-actions-button-outlined {
      --mdc-button-outline-color: #fff;
      --mdc-theme-primary: #fff;
    }
  `;

  // TODO: workaround, because lit-plugin considers `@import` as invalid css also inside
  //       <style> tags, where it is valid, just because is invalid inside the css``
  //       template-literal.
  private _styleImportStatement = `@import 'assets/css/style.css';`;

  render() {
    return html`
      <style>
        ${this._styleImportStatement}
      </style>
      <div class="hero-container">
        <div class="hero-actions">
          <a href="visualization" class="hero-actions-link">
            <mwc-button raised>Start visualization</mwc-button>
          </a>
          <a href="#explanation" class="hero-actions-link">
            <mwc-button
              outlined
              class="hero-actions-button-outlined"
              icon="arrow_downward"
              @click="${() => this._scrollToExplanation()}"
            >
              More about Louvain Method</mwc-button
            >
          </a>
        </div>
      </div>
      <article id="explanation" class="content-container">
        <h2>What is the Louvain Method?</h2>
        <p>
          The
          <a href="https://en.wikipedia.org/wiki/Louvain_method"
            >Louvain Method</a
          >
          is an efficient algorithm for hierarchical clustering of nodes in a
          graph into communities which are strongly connected internally and
          weakly connected to other communities. The Louvain method was first
          introduced in this paper:
        </p>
        <p class="citation">
          Blondel, V. D., Guillaume, J.-L., Lambiotte, R., & Lefebvre, E.
          (2008). Fast unfolding of communities in large networks. In Journal of
          Statistical Mechanics: Theory and Experiment (Vol. 2008, Issue 10, p.
          P10008). IOP Publishing. DOI:
          <a href="https://doi.org/10.1088/1742-5468/2008/10/p10008"
            >10.1088/1742-5468/2008/10/p10008</a
          >
        </p>
        <h2>How does the Louvain Method work?</h2>
        <p>
          The Louvain Method has two phases which are executed repeatedly:
          <strong>Modularity Optimization</strong> and
          <strong>Community Aggregation</strong>. In Modularity Optimization
          nodes are assigned to communities and in Community Aggregation these
          communities are merged into single nodes.
        </p>

        <figure>
          <img
            src="assets/img/louvain-method-overview.jpg"
            alt="Diagram showing an overview of the steps of the Louvain Method method"
            width="100%"
          />
          <figcaption>
            Overview of the two phases of the Louvain Method. First Modularity
            is optimized to find a partition then the resulting communities are
            merged into single nodes. (Figure from: Blondel et. al, 2008).
          </figcaption>
        </figure>

        <h3>Modularity Optimization</h3>

        <p>
          During Modularity Optimization the Louvain Method tries to find a
          partition (i.e. the assignment of nodes to communities), which
          optimizes the modularity of the graph.
          <strong>Modularity</strong> of the graph. "The modularity of a
          partition is a scalar value between -1 and 1 that measures the density
          of links inside communities as compared to links between communities."
          (Blondel et. al, 2008). The formula for the modularity is:
        </p>
        <p>
          <katex-expression
            expression="G = \\frac{1}{2m}\\sum_{p,q} \\left(A_{pq} - \\frac{k_p k_q}{2m}\\right) \\delta(C_p, C_q)"
            .katexOptions="${JSON.stringify({ displayMode: true })}"
          >
          </katex-expression>
        </p>
        <p>
          <katex-expression expression="A_{pq}"></katex-expression>: weight of
          edge between <katex-expression expression="p"></katex-expression> and
          <katex-expression expression="q"></katex-expression>
          <br />

          <katex-expression expression="k_p = \\sum_i A_{pi}"></katex-expression
          >: sum of weights of all edges originating from
          <katex-expression expression="p"></katex-expression>
          <br />

          <katex-expression expression="C_p"></katex-expression>: community to
          which <katex-expression expression="p"></katex-expression> has been
          assigned
          <br />

          <katex-expression expression="\\delta(C_p, C_q)"></katex-expression>:
          Kronecker delta function,
          <katex-expression expression="1"></katex-expression> if
          <katex-expression expression="C_p = C_q"></katex-expression>,
          <katex-expression expression="0"></katex-expression> otherwise
          <br />

          <katex-expression
            expression="m = \\frac{1}{2} \\sum_{p,q} A_{pq}"
          ></katex-expression
          >: sum of all weights of all edges
          <br />
        </p>

        <p>
          For initialization each node is first assigned to a community
          containing only it self. Then for each node and each of its
          neighbouring communities the change in modularity
          <katex-expression expression="\\Delta G"></katex-expression> for the
          node being removed from its current community and added to the
          neighbouring community is calculated. The node is then reassigned to
          the community with the highest change in modularity or not moved if no
          change is greater than zero. This is then repeated for every node
          until no node move can further improve modularity - potentially moving
          some nodes many times.
        </p>

        <h3>Community Aggregation</h3>
        <p>
          After the Modularity Optimization is finished, the communities are
          merged into single nodes. The merging is done by adding the weights of
          edges between any pair of nodes inside the community and creating a
          new node for the community with an edge to itself having the sum as
          weight. Analogously, the weights of edges between any pair of nodes of
          two different communities are summed up and an edge with this sum as
          weight is added between the new nodes corresponding to the respective
          communities.
        </p>

        <p>
          With the resulting new graph, the whole process can be repeated
          starting with Modularity Optimization, successively building up a
          hierarchy of communities.
        </p>

        <h2>Visualization</h2>
        <p>
          In the <a href="visualization">visualization</a> you can explore the
          Louvain Method step-by-step with examples. There is a default example
          loaded but you can also generate a random graph or edit and create
          your on graph in a JSON format.
        </p>
        <p>
          The visualization is based on
          <a href="https://js.cytoscape.org/">Cytoscape.js</a> a JavaScript
          graph visualization library introduced in the paper:
        </p>
        <p class="citation">
          Franz, M., Lopes, C. T., Huck, G., Dong, Y., Sumer, O., & Bader, G. D.
          (2015). Cytoscape.js: a graph theory library for visualisation and
          analysis. In Bioinformatics (p. btv557). Oxford University Press
          (OUP). DOI:
          <a href="https://doi.org/10.1093/bioinformatics/btv557"
            >10.1093/bioinformatics/btv557</a
          >
        </p>
      </article>
    `;
  }

  protected firstUpdated() {
    if (window.location.href.endsWith('#explanation')) {
      this._scrollToExplanation();
    }
  }

  private _scrollToExplanation() {
    setTimeout(() => {
      const explanationElement = this.shadowRoot?.getElementById('explanation');

      if (explanationElement) {
        window.scroll({
          top: explanationElement.offsetTop,
          behavior: 'smooth',
        });
      }
    }, 50);
  }
}
