import { CommunityGraph, Graph, graphToCommunityGraph } from './graph.js';
import { cartesianProduct } from './util.js';

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

  for (let i = 0; i < graph.matrix.length; i += 1) {
    for (let j = i; j < graph.matrix.length; j += 1) {
      sum += graph.matrix[i][j];
    }
  }

  return sum;
}

function neighbourCommunities(graph: CommunityGraph, node: string): number[] {
  const communities = new Set<number>();
  const nodeIndex = graph.nodes.indexOf(node);

  for (let i = 0; i < graph.nodes.length; i += 1) {
    if (graph.matrix[i][nodeIndex] > 0) {
      communities.add(graph.communities.findIndex(c => c.has(graph.nodes[i])));
    }
  }

  communities.delete(graph.communities.findIndex(c => c.has(node)));

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
      // eslint-disable-next-line no-continue
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

export function initLouvainState(
  graph: CommunityGraph,
  nodeIndex = 0,
  communitiesChanged = false,
  finished = false
): LouvainState {
  return {
    graph,
    currentNodeIndex: nodeIndex,
    currentCommunityIndex: graph.communities.findIndex(c =>
      c.has(graph.nodes[nodeIndex])
    ),
    neighbourCommunities: neighbourCommunities(graph, graph.nodes[nodeIndex]),
    deltaModularities: [],
    communitiesChanged,
    finished,
  };
}

export function louvainStep(state: LouvainState): LouvainState {
  if (state.deltaModularities.length < state.neighbourCommunities.length) {
    while (state.deltaModularities.length < state.neighbourCommunities.length) {
      state.deltaModularities.push(
        moveDeltaModularity(
          state.graph,
          state.graph.nodes[state.currentNodeIndex],
          state.graph.communities[state.currentCommunityIndex],
          state.graph.communities[
            state.neighbourCommunities[state.deltaModularities.length]
          ]
        )
      );
    }

    return state;
  }

  if (state.deltaModularities.length === state.neighbourCommunities.length) {
    const maxModularityIndex = indexOfMaxValue(state.deltaModularities);
    const maxCommunityIndex = state.neighbourCommunities[maxModularityIndex];

    if (state.deltaModularities[maxModularityIndex] > 0) {
      state.graph.communities[state.currentCommunityIndex].delete(
        state.graph.nodes[state.currentNodeIndex]
      );
      state.graph.communities[maxCommunityIndex].add(
        state.graph.nodes[state.currentNodeIndex]
      );

      // eslint-disable-next-line no-param-reassign
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

  throw new Error('Unexpected state');
}

export function communityAggregation(graph: CommunityGraph): CommunityGraph {
  const newGraph: Graph = {
    nodes: [],
    edges: [],
  };

  for (const [i, community] of graph.communities.entries()) {
    if (community.size > 0) {
      newGraph.nodes.push(`ac${i}`);
    }
  }

  const communityEntries = [...graph.communities.entries()];

  for (const [cai, ca, cbi, cb] of cartesianProduct(
    communityEntries,
    communityEntries
  )) {
    let weight = cartesianProduct([...ca], [...cb]).reduce(
      (acc, [a, b]) =>
        acc + graph.matrix[graph.nodes.indexOf(a)][graph.nodes.indexOf(b)],
      0
    );

    if (cai === cbi) {
      for (const node of ca) {
        const nodeIndex = graph.nodes.indexOf(node);
        weight += graph.matrix[nodeIndex][nodeIndex];
      }
      weight /= 2;
    }

    if (weight > 0) {
      newGraph.edges.push({
        source: `ac${cai}`,
        target: `ac${cbi}`,
        weight,
      });
    }
  }

  return graphToCommunityGraph(newGraph);
}
