import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { FilePlus2, FolderOpen, Save, Download } from 'lucide-react';

export function TopBar() {
  const openDialog = useStore((s) => s.openDialog);
  const meta = useStore((s) => s.meta);
  const hasLayout = useStore((s) => s.layout.rows > 0);

  return (
    <header className="h-12 shrink-0 border-b border-border bg-background flex items-center px-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-sm bg-foreground" />
        <span className="font-semibold tracking-tight">Figaro</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground truncate max-w-[40ch]">{meta.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => openDialog('newSession')}>
          <FilePlus2 className="h-4 w-4" />
          New
        </Button>
        <Button variant="ghost" size="sm" disabled>
          <FolderOpen className="h-4 w-4" />
          Open
        </Button>
        <Button variant="ghost" size="sm" disabled={!hasLayout}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button variant="default" size="sm" disabled={!hasLayout} onClick={() => openDialog('export')}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </header>
  );
}
