import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/store';

function H2({ children }) {
  return <h2 className="text-base font-semibold mt-6 mb-2 first:mt-0">{children}</h2>;
}

function H3({ children }) {
  return <h3 className="text-sm font-semibold mt-4 mb-1 text-foreground/80">{children}</h3>;
}

function P({ children }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>;
}

function Li({ children }) {
  return <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>;
}

function Code({ children }) {
  return (
    <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{children}</code>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th key={h} className="text-left py-1.5 pr-4 font-medium text-foreground/70 text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-1.5 pr-4 text-muted-foreground text-sm align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ManualDialog() {
  const open = useStore((s) => s.ui.dialogs.manual);
  const closeDialog = useStore((s) => s.closeDialog);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog('manual')}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>User Manual</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 flex-1">

          {/* 1. Interface overview */}
          <H2>1. Interface overview</H2>
          <Table
            headers={['Area', 'Purpose']}
            rows={[
              ['Left sidebar — Data', 'Import and manage datasets'],
              ['Center — Canvas', 'Compose the multi-panel figure'],
              ['Right sidebar — Inspector', 'Edit the selected panel'],
              ['Top bar', 'Session controls, theme, export'],
            ]}
          />
          <P>Click any panel on the canvas to select it. The Inspector on the right updates to show that panel's controls. Click the canvas background to deselect.</P>

          {/* 2. Starting a new figure */}
          <H2>2. Starting a new figure</H2>
          <P>Click <strong>New</strong> (file-plus icon) in the top bar. Choose a canvas preset (A4, Letter, A0, Slide 16:9, Slide 4:3, or Custom) and set the number of rows and columns (1–6 each). A live preview updates as you adjust the settings. Click <strong>Create</strong> to initialize — any existing work is discarded.</P>
          <P>For a custom size, click <strong>Custom</strong> and enter a width, height, and unit (mm, in, or px).</P>

          {/* 3. Loading data */}
          <H2>3. Loading data</H2>
          <H3>From your own files</H3>
          <P>Click the <strong>+</strong> button at the top of the Data sidebar. Accepted formats: <Code>.csv</Code>, <Code>.tsv</Code>, <Code>.json</Code>, <Code>.txt</Code>. You can select multiple files at once. Each dataset appears as a card showing row/column counts and column names — blue badges for numeric columns, gray badges for text columns.</P>
          <H3>From built-in examples</H3>
          <P>Click <strong>Load examples</strong> to add sample datasets: Iris, Hare &amp; Lynx, Darwin's Finches, and Dolphin Social Network.</P>
          <H3>Removing a dataset</H3>
          <P>Click the trash icon on a dataset card. Any plots bound to that dataset will lose their data.</P>

          {/* 4. Building the layout */}
          <H2>4. Building the layout</H2>
          <P>The canvas is a grid of panels. Each panel starts empty and shows a drop zone. Drag a dataset card from the left sidebar onto any empty panel to create a chart there.</P>
          <P>Resize rows and columns by dragging the thin divider lines between them — the cursor changes to a resize arrow when you hover a divider.</P>

          {/* 5. Chart types */}
          <H2>5. Choosing a chart type</H2>
          <P>Click a panel that contains a chart. A row of chart-type buttons appears at the top of the Inspector:</P>
          <Table
            headers={['Type', 'Description']}
            rows={[
              ['Bar', 'Grouped vertical bars'],
              ['Stacked Bar', 'Stacked vertical bars'],
              ['Histogram', 'Distribution of a single numeric column'],
              ['Scatter', 'X/Y scatter with optional size and color encoding'],
              ['Pie', 'Proportional slices'],
              ['Heatmap', '2-D grid colored by value'],
              ['Network', 'Force-directed node-link diagram'],
            ]}
          />
          <P>Switching type updates the column pickers in the Data section below.</P>

          {/* 6. Mapping columns */}
          <H2>6. Mapping data columns</H2>
          <P>The <strong>Data</strong> section in the Inspector has a dropdown for each visual channel. Numeric columns are marked <Code>·№</Code> and text columns <Code>·𝐀</Code>. Channels that require numbers only show numeric columns. Leaving an optional channel blank omits that encoding.</P>
          <P><strong>Network charts</strong> have an additional <strong>Edges dataset</strong> dropdown — select a second loaded dataset that defines edges, then pick source and target columns.</P>

          {/* 7. Styling */}
          <H2>7. Styling a chart</H2>
          <H3>Color palette</H3>
          <P>Choose from four built-in palettes: <strong>viridis</strong> (sequential), <strong>set2</strong> (pastel), <strong>tableau10</strong> (high-contrast), or <strong>grayscale</strong>. Select <strong>Custom</strong> to edit each of the 8 palette colors with individual color pickers.</P>
          <H3>Other style options</H3>
          <P>Depending on the chart type, the Style section also offers: font family, font size, line width, show/hide legend or grid lines, axis scale (linear / log), and bar grouping mode.</P>
          <H3>Draft mode</H3>
          <P>Any unsaved change triggers a sticky <strong>Draft</strong> bar at the bottom of the Inspector. Click <strong>Apply</strong> to commit or <strong>Reset</strong> to discard all pending edits.</P>

          {/* 8. Images */}
          <H2>8. Inserting images</H2>
          <P>Click <strong>Add image</strong> inside an empty panel, or drag an image file onto it. Supported formats: SVG, PNG, JPEG, WebP.</P>
          <P>When an image panel is selected the Inspector shows: <strong>Alt text</strong> (accessibility description), <strong>Background</strong> color (or None for transparent), and <strong>Border</strong> width and color.</P>
          <P>Click <strong>Clear panel</strong> to remove the image and return the panel to the empty state.</P>

          {/* 9. Merge / split */}
          <H2>9. Merging and splitting cells</H2>
          <H3>Merge</H3>
          <P>Click <strong>Merge cells</strong> in the canvas toolbar. Click the first panel, then click a second panel. The two panels — and every cell inside the rectangle they define — merge into one. Merged regions must be rectangular.</P>
          <H3>Split</H3>
          <P>In merge mode, click an already-merged panel to split it back into individual cells.</P>
          <P>Click <strong>Done merging</strong> to exit merge mode.</P>

          {/* 10. Axis linking */}
          <H2>10. Linking axes across panels</H2>
          <P>Click a plot panel and scroll to the <strong>Linking</strong> section in the Inspector:</P>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <Li><strong>Share X with panels in same row</strong> — all plots in that row share the same X-axis range.</Li>
            <Li><strong>Share Y with panels in same column</strong> — all plots in that column share the same Y-axis range.</Li>
          </ul>

          {/* 11. Labels */}
          <H2>11. Panel labels</H2>
          <P>Panels are auto-labeled in reading order (A, B, C…). Global label settings in the top bar control the style (A / a / 1 / (A) / (a) / (1)), position (inside or outside each corner), font size, and bold toggle.</P>
          <P>To override a single panel, select it and uncheck <strong>Auto-label (reading order)</strong> in the Label section — a text input appears for a custom label.</P>

          {/* 12. Themes */}
          <H2>12. Themes</H2>
          <Table
            headers={['Theme', 'Description']}
            rows={[
              ['Light Minimal', 'White background, dark text — default'],
              ['Dark Minimal', 'Dark background, light text'],
              ['Publication', 'White background, black text, Merriweather serif — suited for journals'],
            ]}
          />
          <P>Use the <strong>Theme</strong> dropdown in the top bar. Switching themes updates fonts, colors, and canvas background for the entire figure.</P>

          {/* 13. Export */}
          <H2>13. Exporting the figure</H2>
          <P>Click <strong>Export</strong> (download icon) in the top bar and pick a format:</P>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <Li><strong>SVG</strong> — vector, ideal for publications and Illustrator / Inkscape.</Li>
            <Li><strong>PNG</strong> — raster at 1× (96 ppi), 2× (192 ppi), or 3× (288 ppi).</Li>
            <Li><strong>HTML</strong> — self-contained interactive file; requires the Plotly CDN when opened.</Li>
            <Li><strong>PDF</strong> — print-ready via jsPDF; SVG <Code>{'<foreignObject>'}</Code> is not supported in all viewers.</Li>
          </ul>
          <P>Click <strong>Export [FORMAT]</strong> to download. The filename uses the figure title.</P>

          {/* 14. Save / open session */}
          <H2>14. Saving and opening sessions</H2>
          <H3>Saving</H3>
          <P>Click <strong>Save</strong> (disk icon) in the top bar. The session downloads as a <Code>.figaro.json</Code> file containing the canvas settings, grid layout, all plot configurations, and dataset/image references — but <em>not</em> the raw data files themselves.</P>
          <H3>Opening</H3>
          <P>Click <strong>Open</strong> (folder icon) and select a <Code>.figaro.json</Code> file. If the session references files that have moved, the <strong>Locate Files</strong> dialog opens automatically. Click <strong>Browse</strong> next to each missing file, select its new location, and click <strong>Done</strong>.</P>

        </div>
      </DialogContent>
    </Dialog>
  );
}
