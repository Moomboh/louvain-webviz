import {
  renderGraph,
  Graph,
  graphToCommunityGraph,
  communityGraphToGraph,
} from "./graph";
import { initLouvainState, louvainStep } from "./louvain";

const nodes = ["A", "B", "C", "D", "E", "F"];

const graph: Graph = {
  nodes: nodes,
  edges: [
    { source: "A", target: "B", weight: 8 },
    { source: "A", target: "C", weight: 3 },
    { source: "B", target: "D", weight: 5 },
    { source: "C", target: "D", weight: 1 },
    { source: "C", target: "E", weight: 7 },
    { source: "D", target: "E", weight: 2 },
    { source: "D", target: "F", weight: 6 },
    { source: "E", target: "F", weight: 4 },
  ],
};

const communityGraph = graphToCommunityGraph(graph);

renderGraph(
  communityGraphToGraph(communityGraph),
  document.getElementById("graph")
);

let louvainState = initLouvainState(communityGraph);

const button = document.createElement("button");
button.innerText = "Step";
button.addEventListener("click", () => {
  louvainState = louvainStep(louvainState);

  renderGraph(
    communityGraphToGraph(louvainState.graph),
    document.getElementById("graph")
  );

  if (louvainState.finished) {
    button.innerText = "Finished";
    button.disabled = true;
  }
});

const controls = document.getElementById("controls");
controls.appendChild(button);
