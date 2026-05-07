import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { THEME_DATA } from '@/themes/themes';
import { FilePlus2, FolderOpen, Save, Download, CircleHelp } from 'lucide-react';
import { exportSession } from '@/engine/exportSession';
import { importSession } from '@/engine/importSession';

export function TopBar() {
  const openDialog = useStore((s) => s.openDialog);
  const loadSession = useStore((s) => s.loadSession);
  const meta = useStore((s) => s.meta);
  const hasLayout = useStore((s) => s.layout.rows > 0);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const handleThemeChange = (e) => {
    const name = e.target.value;
    const t = THEME_DATA[name];
    if (t) setTheme({ name, globalFontFamily: t.fontFamily, baseFontSize: t.baseFontSize });
  };

  const handleSave = () => {
    exportSession(useStore.getState());
  };

  const handleOpen = async () => {
    try {
      const session = await importSession();
      if (!session) return;
      loadSession(session);
      const hasFiles =
        Object.keys(session.datasets).length > 0 ||
        Object.keys(session.imageRefs).length > 0;
      if (hasFiles) openDialog('locateFiles');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    }
  };

  return (
    <header className="h-12 shrink-0 border-b border-border bg-background flex items-center px-4 gap-4">
      <img
        src="/figaro_logo.svg"
        alt="Figaro"
        className="h-9 w-auto shrink-0"
        draggable={false}
      />

      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground truncate max-w-[40ch]">{meta.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openDialog('manual')}
          title="User manual"
          className="h-8 w-8 text-muted-foreground"
        >
          <CircleHelp className="h-4 w-4" />
        </Button>

        <select
          value={theme.name}
          onChange={handleThemeChange}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
          title="Theme"
        >
          {Object.values(THEME_DATA).map((t) => (
            <option key={t.name} value={t.name}>{t.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openDialog('newSession')}>
            <FilePlus2 className="h-4 w-4" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpen}>
            <FolderOpen className="h-4 w-4" />
            Open
          </Button>
          <Button variant="ghost" size="sm" disabled={!hasLayout} onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="default" size="sm" disabled={!hasLayout} onClick={() => openDialog('export')}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
