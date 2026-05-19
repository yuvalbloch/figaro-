import { useEffect, useRef } from 'react';
import { TopBar } from '@/components/topbar/TopBar';
import { DataManager } from '@/components/data/DataManager';
import { Canvas } from '@/components/editor/Canvas';
import { ControlPanel } from '@/components/controls/ControlPanel';
import { NewSessionDialog } from '@/components/dialogs/NewSessionDialog';
import { LocateFilesDialog } from '@/components/dialogs/LocateFilesDialog';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { ManualDialog } from '@/components/dialogs/ManualDialog';
import { CanvasDndProvider } from '@/components/editor/CanvasDndProvider';
import { useStore } from '@/store';
import { restoreSession } from '@/persistence/idb';
import { validateSession } from '@/persistence/schema';

export default function App() {
  const canvasFitted = useStore((s) => s.ui.canvasFitted);
  const loadSession = useStore((s) => s.loadSession);
  const attachLoaded = useStore((s) => s.attachLoaded);
  const setIdbSavedAt = useStore((s) => s.setIdbSavedAt);
  const requestCanvasFit = useStore((s) => s.requestCanvasFit);
  const appendPanel = useStore((s) => s.appendPanel);
  const addDataset = useStore((s) => s.addDataset);
  const addImageRef = useStore((s) => s.addImageRef);
  const setPlot = useStore((s) => s.setPlot);
  const pollingRef = useRef(null);

  useEffect(() => {
    const injected = window.__FIGARO_INITIAL_SESSION__;
    if (injected) {
      const { session, loaded } = injected;
      loadSession(session);
      for (const [fileId, payload] of Object.entries(loaded || {})) {
        attachLoaded(fileId, payload);
      }
      requestCanvasFit();
      return;
    }

    restoreSession()
      .then((result) => {
        if (!result) return;
        const { ok } = validateSession(result.session);
        if (!ok) return;
        // Only restore if no session is active yet.
        if (useStore.getState().layout.rows > 0) return;
        loadSession(result.session);
        for (const [fileId, payload] of Object.entries(result.loaded)) {
          attachLoaded(fileId, payload);
        }
        setIdbSavedAt(Date.now());
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const rServer = window.__FIGARO_R_SERVER__;
    if (!rServer) return;

    const poll = async () => {
      try {
        const res = await fetch(`${rServer}/pending-panels`);
        if (!res.ok) return;
        const deltas = await res.json();
        if (!Array.isArray(deltas) || deltas.length === 0) return;
        for (const delta of deltas) {
          for (const [dsId, ds] of Object.entries(delta.datasets || {})) {
            const loaded = delta.loaded?.[dsId];
            addDataset(dsId, ds, loaded?.rows ?? []);
          }
          for (const [imgId, ref] of Object.entries(delta.imageRefs || {})) {
            const loaded = delta.loaded?.[imgId];
            addImageRef(imgId, ref, loaded?.blobURL ?? null);
          }
          for (const [plotId, plot] of Object.entries(delta.plots || {})) {
            setPlot(plotId, plot);
          }
          appendPanel({ regionId: delta.regionId, panelDef: delta.panel });
        }
      } catch {
        // server not yet ready or unavailable — ignore
      }
    };

    pollingRef.current = setInterval(poll, 1000);
    return () => clearInterval(pollingRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CanvasDndProvider>
      <div className="h-full w-full flex flex-col bg-background text-foreground">
        <TopBar />
        <div className={`flex-1 flex ${canvasFitted ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <aside className={`w-60 shrink-0 border-r border-border bg-background ${canvasFitted ? 'sticky top-0 max-h-screen overflow-y-auto' : ''}`}>
            <DataManager />
          </aside>
          <main className={`flex-1 ${canvasFitted ? '' : 'overflow-hidden'}`}>
            <Canvas />
          </main>
          <aside className={`w-80 shrink-0 border-l border-border bg-background ${canvasFitted ? 'sticky top-0 max-h-screen overflow-y-auto' : ''}`}>
            <ControlPanel />
          </aside>
        </div>
        <NewSessionDialog />
        <LocateFilesDialog />
        <ExportDialog />
        <ManualDialog />
      </div>
    </CanvasDndProvider>
  );
}
