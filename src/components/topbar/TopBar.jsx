import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { THEME_DATA } from '@/themes/themes';
import { FilePlus2, FolderOpen, Save, Download, CircleHelp, Check } from 'lucide-react';
import { exportSession } from '@/engine/exportSession';
import { importSession } from '@/engine/importSession';

export function TopBar() {
  const openDialog = useStore((s) => s.openDialog);
  const loadSession = useStore((s) => s.loadSession);
  const meta = useStore((s) => s.meta);
  const setMeta = useStore((s) => s.setMeta);
  const hasLayout = useStore((s) => s.layout.rows > 0);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const idbSavedAt = useStore((s) => s.ui.idbSavedAt);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const startEdit = () => {
    setDraft(meta.name || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const name = draft.trim() || 'Untitled Figure';
    setMeta({ name });
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleThemeChange = (e) => {
    const name = e.target.value;
    const t = THEME_DATA[name];
    if (t) setTheme({ name, globalFontFamily: t.fontFamily, baseFontSize: t.baseFontSize });
  };

  const attachLoaded = useStore((s) => s.attachLoaded);

  const handleSave = async () => {
    await exportSession(useStore.getState());
  };

  const handleOpen = async () => {
    try {
      const result = await importSession();
      if (!result) return;
      const { session, loaded } = result;
      loadSession(session);
      for (const [id, payload] of Object.entries(loaded)) {
        attachLoaded(id, payload);
      }
      const unresolvedDatasets = Object.keys(session.datasets).filter((id) => !loaded[id]?.rows?.length);
      const unresolvedImages = Object.keys(session.imageRefs).filter((id) => !loaded[id]?.blobURL);
      if (unresolvedDatasets.length > 0 || unresolvedImages.length > 0) {
        openDialog('locateFiles');
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    }
  };

  return (
    <header className="h-[72px] shrink-0 border-b border-border bg-background flex items-center px-4 gap-4">
      <img
        src={`${import.meta.env.BASE_URL}figaro_logo_v2.png`}
        alt="Figaro"
        className="h-[60px] w-auto shrink-0"
        draggable={false}
      />

      <div className="flex-1 flex items-center justify-center gap-2">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="text-sm text-foreground bg-transparent border-b border-primary outline-none text-center max-w-[40ch] min-w-[12ch]"
          />
        ) : (
          <span
            className="text-sm text-muted-foreground truncate max-w-[40ch] cursor-pointer hover:text-foreground transition-colors"
            title="Click to rename"
            onClick={startEdit}
          >
            {meta.name}
          </span>
        )}
        {idbSavedAt && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground/60 shrink-0"
            title={`Auto-saved at ${new Date(idbSavedAt).toLocaleTimeString()}`}
          >
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
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
