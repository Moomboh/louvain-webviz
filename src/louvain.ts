import { CommunityGraph } from "./graph";

export interface LouvainState {
  graph: CommunityGraph;
  currentNodeIndex: number;
  currentCommunityIndex: number;
  neighbourCommunities: number[];
  deltaModularities: number[];
  communitiesChanged: boolean;
  finished: boolean;
}

function indexOfMaxValue(a: number[]) {
  return a.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
}

function weightSum(graph: CommunityGraph): number {
  let sum = 0;

  for (let i = 0; i < graph.matrix.length; i++) {
    for (let j = i; j < graph.matrix.length; j++) {
      sum += graph.matrix[i][j];
    }
  }

  return sum;
}

function neighbourCommunities(graph: CommunityGraph, node: string): number[] {
  const communities = new Set<number>();
  const nodeIndex = graph.nodes.indexOf(node);

  for (let i = 0; i < graph.nodes.length; i++) {
    if (graph.matrix[i][nodeIndex] > 0) {
      communities.add(graph.communites.findIndex((c) => c.has(graph.nodes[i])));
    }
  }

  communities.delete(graph.communites.findIndex((c) => c.has(node)));

  return Array.from(communities);
}

function modularityContrib(
  a: string,
  b: string,
  graph: CommunityGraph
): number {
  const aIndex = graph.nodes.indexOf(a);
  const bIndex = graph.nodes.indexOf(b);

  return (
    (graph.matrix[aIndex][bIndex] -
      (graph.matrix[aIndex].reduce((acc, w) => acc + w) *
        graph.matrix[bIndex].reduce((acc, w) => acc + w)) /
        (2 * weightSum(graph))) /
    (2 * weightSum(graph))
  );
}

function moveDeltaModularity(
  graph: CommunityGraph,
  moveNode: string,
  fromCommunity: Set<string>,
  toCommunity: Set<string>
): number {
  let deltaRemove = 0;

  for (const node of fromCommunity) {
    if (node === moveNode) {
      continue;
    }

    deltaRemove -= modularityContrib(node, moveNode, graph);
  }

  let deltaAdd = 0;

  for (const node of toCommunity) {
    deltaAdd += modularityContrib(node, moveNode, graph);
  }

  return deltaRemove + deltaAdd;
}

export function louvainStep(state: LouvainState): LouvainState {
  if (state.deltaModularities.length < state.neighbourCommunities.length) {
    state.deltaModularities.push(
      moveDeltaModularity(
        state.graph,
        state.graph.nodes[state.currentNodeIndex],
        state.graph.communites[state.currentCommunityIndex],
        state.graph.communites[
          state.neighbourCommunities[state.deltaModularities.length]
        ]
      )
    );

    return state;
  }

  if (state.deltaModularities.length === state.neighbourCommunities.length) {
    const maxModularityIndex = indexOfMaxValue(state.deltaModularities);
    const maxCommunityIndex = state.neighbourCommunities[maxModularityIndex];

    if (state.deltaModularities[maxModularityIndex] > 0) {
      state.graph.communites[state.currentCommunityIndex].delete(
        state.graph.nodes[state.currentNodeIndex]
      );
      state.graph.communites[maxCommunityIndex].add(
        state.graph.nodes[state.currentNodeIndex]
      );

      state.communitiesChanged = true;
    }

    const nextIndex = state.currentNodeIndex + 1;

    if (nextIndex < state.graph.nodes.length) {
      return initLouvainState(state.graph, nextIndex, state.communitiesChanged);
    }

    if (state.communitiesChanged) {
      return initLouvainState(state.graph, 0);
    }

    return initLouvainState(state.graph, 0, false, true);
  }

  throw new Error("Unexpected state");
}

export function initLouvainState(
  graph: CommunityGraph,
  nodeIndex = 0,
  communitiesChanged = false,
  finished = false
): LouvainState {
  return {
    graph,
    currentNodeIndex: nodeIndex,
    currentCommunityIndex: graph.communites.findIndex((c) =>
      c.has(graph.nodes[nodeIndex])
    ),
    neighbourCommunities: neighbourCommunities(graph, graph.nodes[nodeIndex]),
    deltaModularities: [],
    communitiesChanged,
    finished,
  };
}
