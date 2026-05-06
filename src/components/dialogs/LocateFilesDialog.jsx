import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { parseCsv, parseJson } from '@/lib/csv';
import { FileText, Image, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

async function parseDataFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    const result = await parseCsv(file);
    return result.data;
  }
  if (ext === 'json') {
    return parseJson(await file.text());
  }
  throw new Error(`Unsupported file type .${ext}`);
}

function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export function LocateFilesDialog() {
  const open = useStore((s) => s.ui.dialogs.locateFiles);
  const closeDialog = useStore((s) => s.closeDialog);
  const datasets = useStore((s) => s.datasets);
  const imageRefs = useStore((s) => s.imageRefs);
  const loaded = useStore((s) => s._loaded);
  const attachLoaded = useStore((s) => s.attachLoaded);

  const [errors, setErrors] = useState({});

  const isDatasetLoaded = (dsId) => !!(loaded[dsId]?.rows?.length);
  const isImageLoaded = (imgId) => !!(loaded[imgId]?.blobURL);

  const allDatasets = Object.entries(datasets);
  const allImages = Object.entries(imageRefs);
  const pendingCount =
    allDatasets.filter(([id]) => !isDatasetLoaded(id)).length +
    allImages.filter(([id]) => !isImageLoaded(id)).length;

  const handleDatasetPick = async (dsId) => {
    const file = await pickFile('.csv,.tsv,.txt,.json');
    if (!file) return;
    try {
      const rows = await parseDataFile(file);
      attachLoaded(dsId, { rows, blobURL: null });
      setErrors((e) => { const next = { ...e }; delete next[dsId]; return next; });
    } catch (err) {
      setErrors((e) => ({ ...e, [dsId]: err.message }));
    }
  };

  const handleImagePick = async (imgId) => {
    const file = await pickFile('image/*');
    if (!file) return;
    const blobURL = URL.createObjectURL(file);
    attachLoaded(imgId, { rows: null, blobURL });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog('locateFiles')}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Locate files</DialogTitle>
          <DialogDescription>
            Re-link the source files referenced by this session. You can skip any file
            and locate it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {allDatasets.map(([dsId, ds]) => {
            const done = isDatasetLoaded(dsId);
            return (
              <div
                key={dsId}
                className="flex items-center gap-3 rounded-md border border-input p-2"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{ds.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{ds.sourceFile}</div>
                  {errors[dsId] && (
                    <div className="text-xs text-destructive mt-0.5">{errors[dsId]}</div>
                  )}
                </div>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleDatasetPick(dsId)}>
                    Browse
                  </Button>
                )}
              </div>
            );
          })}

          {allImages.map(([imgId, img]) => {
            const done = isImageLoaded(imgId);
            return (
              <div
                key={imgId}
                className="flex items-center gap-3 rounded-md border border-input p-2"
              >
                <Image className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{img.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{img.sourceFile}</div>
                </div>
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleImagePick(imgId)}>
                    Browse
                  </Button>
                )}
              </div>
            );
          })}

          {allDatasets.length === 0 && allImages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No files to locate.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => closeDialog('locateFiles')}>
            {pendingCount === 0 ? 'Done' : 'Skip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
