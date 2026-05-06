import { TopBar } from '@/components/topbar/TopBar';
import { DataManager } from '@/components/data/DataManager';
import { Canvas } from '@/components/editor/Canvas';
import { ControlPanel } from '@/components/controls/ControlPanel';
import { NewSessionDialog } from '@/components/dialogs/NewSessionDialog';
import { LocateFilesDialog } from '@/components/dialogs/LocateFilesDialog';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { CanvasDndProvider } from '@/components/editor/CanvasDndProvider';

export default function App() {
  return (
    <CanvasDndProvider>
      <div className="h-full w-full flex flex-col bg-background text-foreground">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-60 shrink-0 border-r border-border bg-background">
            <DataManager />
          </aside>
          <main className="flex-1 overflow-hidden">
            <Canvas />
          </main>
          <aside className="w-80 shrink-0 border-l border-border bg-background">
            <ControlPanel />
          </aside>
        </div>
        <NewSessionDialog />
        <LocateFilesDialog />
        <ExportDialog />
      </div>
    </CanvasDndProvider>
  );
}
