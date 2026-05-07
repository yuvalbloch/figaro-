import { useEffect } from 'react';
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

  useEffect(() => {
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
