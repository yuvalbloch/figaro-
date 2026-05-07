import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';
import { baseLayout } from '../layout';
import { getPalette } from '@/themes/palettes';

// Module-level position cache keyed by plotId.
// Invalidated when layoutVersion, nodeSet, or layoutMode changes.
const layoutCache = new Map();

function circularLayout(nodeIds) {
  const positions = new Map();
  const n = nodeIds.length;
  nodeIds.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions.set(id, { x: Math.cos(angle), y: Math.sin(angle) });
  });
  return positions;
}

function runForceLayout(nodeIds, edges) {
  if (nodeIds.length === 0) return new Map();
  const nodeObjs = nodeIds.map((id) => ({ id }));
  const idxOf = new Map(nodeIds.map((id, i) => [id, i]));
  const links = edges
    .filter((e) => idxOf.has(e.source) && idxOf.has(e.target))
    .map((e) => ({ source: idxOf.get(e.source), target: idxOf.get(e.target) }));

  const sim = forceSimulation(nodeObjs)
    .force('link', forceLink(links).distance(80).strength(0.5))
    .force('charge', forceManyBody().strength(-120))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(12))
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();

  return new Map(nodeObjs.map((n) => [n.id, { x: n.x, y: n.y }]));
}

export const networkChart = {
  type: 'network',
  label: 'Network',
  schema: {
    data: [
      { key: 'edgeSource', kind: 'column', label: 'Source node', required: true },
      { key: 'edgeTarget', kind: 'column', label: 'Target node', required: true },
      { key: 'edgeWeight', kind: 'column', label: 'Edge weight', filter: 'number', optional: true },
      { key: 'nodeColor', kind: 'column', label: 'Color by', optional: true },
      { key: 'nodeSize', kind: 'column', label: 'Size by', filter: 'number', optional: true },
    ],
    style: [
      { key: 'nodeSize', kind: 'number', label: 'Node size', min: 4, max: 40, step: 1 },
      { key: 'showLabels', kind: 'bool', label: 'Show node labels' },
      { key: 'edgeOpacity', kind: 'number', label: 'Edge opacity', min: 0.05, max: 1, step: 0.05 },
      {
        key: 'layoutMode',
        kind: 'select',
        label: 'Layout',
        options: [
          { value: 'force', label: 'Force-directed' },
          { value: 'circular', label: 'Circular' },
        ],
      },
      { key: 'title', kind: 'text', label: 'Title', placeholder: 'Untitled' },
      { key: 'palette', kind: 'palette', label: 'Palette' },
      { key: 'fontFamily', kind: 'font', label: 'Font' },
      { key: 'fontSize', kind: 'number', label: 'Font size', min: 8, max: 24, step: 1 },
      { key: 'showLegend', kind: 'bool', label: 'Show legend' },
    ],
  },
  defaults: {
    params: {},
    style: {
      nodeSize: 10,
      showLabels: true,
      edgeOpacity: 0.5,
      layoutMode: 'force',
      showLegend: true,
    },
  },

  render(plot, rows, ctx) {
    const warnings = [];
    const { nodeColor, nodeSize: nodeSizeCol, edgeSource, edgeTarget, edgeWeight } =
      plot.params || {};

    if (!edgeSource || !edgeTarget) {
      return {
        data: [],
        layout: baseLayout(plot, ctx.theme),
        warnings: ['Pick Source node and Target node columns'],
      };
    }

    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const nodeSizeVal = Number(plot.style?.nodeSize) || 10;
    const edgeOpacity = Number(plot.style?.edgeOpacity) ?? 0.5;
    const showLabels = plot.style?.showLabels ?? true;
    const layoutMode = plot.style?.layoutMode || 'force';
    const layoutVersion = plot.params?.layoutVersion || 0;
    const plotId = ctx.plotId || '__default__';

    // Build edges and collect per-node attributes from the single dataset
    const edges = [];
    const nodeColorMap = new Map();
    const nodeSizeMap = new Map();
    for (const r of rows) {
      const src = String(r[edgeSource] ?? '');
      const tgt = String(r[edgeTarget] ?? '');
      if (!src || !tgt) continue;
      edges.push({ source: src, target: tgt, weight: edgeWeight ? Number(r[edgeWeight]) : 1 });
      if (nodeColor && !nodeColorMap.has(src)) nodeColorMap.set(src, r[nodeColor]);
      if (nodeSizeCol && !nodeSizeMap.has(src)) nodeSizeMap.set(src, Number(r[nodeSizeCol]));
    }

    // Derive unique node set from edge endpoints
    const nodeIdSet = new Set();
    for (const e of edges) { nodeIdSet.add(e.source); nodeIdSet.add(e.target); }
    const nodeIds = [...nodeIdSet];

    const nodeAttrMap = new Map();
    for (const id of nodeIds) {
      nodeAttrMap.set(id, {
        color: nodeColorMap.get(id) ?? null,
        size: nodeSizeMap.get(id) ?? null,
      });
    }

    if (nodeIds.length === 0) {
      return {
        data: [],
        layout: baseLayout(plot, ctx.theme),
        warnings: ['No valid node pairs found in dataset'],
      };
    }
    if (nodeIds.length > 2000) warnings.push(`Large network: ${nodeIds.length} nodes`);

    // Compute or retrieve cached positions
    const nodeSetKey = nodeIds.join('\x00');
    const cached = layoutCache.get(plotId);
    let positions;
    if (
      cached &&
      cached.version === layoutVersion &&
      cached.nodeSet === nodeSetKey &&
      cached.layoutMode === layoutMode
    ) {
      positions = cached.positions;
    } else {
      positions =
        layoutMode === 'circular' ? circularLayout(nodeIds) : runForceLayout(nodeIds, edges);
      layoutCache.set(plotId, { version: layoutVersion, nodeSet: nodeSetKey, layoutMode, positions });
    }

    // Group nodes by color column for multi-trace legend
    const colorGroups = new Map();
    for (const id of nodeIds) {
      const g = nodeColor ? String(nodeAttrMap.get(id)?.color ?? '∅') : '_';
      if (!colorGroups.has(g)) colorGroups.set(g, []);
      colorGroups.get(g).push(id);
    }

    const nodeTraces = [...colorGroups.entries()].map(([g, ids], gi) => {
      const xs = ids.map((id) => positions.get(id)?.x ?? 0);
      const ys = ids.map((id) => positions.get(id)?.y ?? 0);
      const sizes = ids.map((id) => {
        const s = nodeAttrMap.get(id)?.size;
        return s != null && Number.isFinite(s)
          ? Math.max(4, Math.min(40, Math.sqrt(Math.abs(s)) * 2 + 4))
          : nodeSizeVal;
      });
      return {
        type: 'scatter',
        mode: showLabels ? 'markers+text' : 'markers',
        name: nodeColor ? String(g) : 'Nodes',
        x: xs,
        y: ys,
        text: ids,
        textposition: 'top center',
        textfont: { size: 9 },
        marker: {
          size: sizes,
          color: palette[gi % palette.length],
          line: { width: 1, color: 'rgba(255,255,255,0.5)' },
        },
        hovertemplate: '%{text}<extra></extra>',
      };
    });

    // Build edge trace (single polyline with null breaks)
    const edgeX = [];
    const edgeY = [];
    for (const e of edges) {
      const src = positions.get(e.source);
      const tgt = positions.get(e.target);
      if (src && tgt) {
        edgeX.push(src.x, tgt.x, null);
        edgeY.push(src.y, tgt.y, null);
      }
    }

    const traces = [];
    if (edgeX.length > 0) {
      traces.push({
        type: 'scatter',
        mode: 'lines',
        x: edgeX,
        y: edgeY,
        line: { color: `rgba(128,128,128,${edgeOpacity})`, width: 1 },
        hoverinfo: 'none',
        showlegend: false,
      });
    }
    traces.push(...nodeTraces);

    // Compute tight bounds from actual node positions
    const allX = nodeIds.map((id) => positions.get(id)?.x ?? 0);
    const allY = nodeIds.map((id) => positions.get(id)?.y ?? 0);
    const minX = Math.min(...allX), maxX = Math.max(...allX);
    const minY = Math.min(...allY), maxY = Math.max(...allY);
    const padX = (maxX - minX) * 0.08 || 0.5;
    const padY = (maxY - minY) * 0.08 || 0.5;

    const layout = baseLayout(plot, ctx.theme);
    layout.margin = { l: 8, r: 8, t: plot.style?.title ? 36 : 8, b: 8 };
    layout.xaxis = {
      visible: false, showgrid: false, zeroline: false, automargin: false,
      range: [minX - padX, maxX + padX],
    };
    layout.yaxis = {
      visible: false, showgrid: false, zeroline: false, automargin: false,
      range: [minY - padY, maxY + padY],
    };
    layout.hovermode = 'closest';

    return { data: traces, layout, warnings };
  },
};
