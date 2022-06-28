export const cartesianProduct = (...args: any[][]) =>
  args.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
