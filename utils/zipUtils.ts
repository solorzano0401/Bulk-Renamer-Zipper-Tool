import JSZip from 'jszip';

export const generateAndDownloadZip = async (
  file: File,
  names: string[],
  originalExtension: string,
  onProgress?: (percent: number) => void
): Promise<void> => {
  const zip = new JSZip();
  const folderName = file.name.split('.')[0] + '_variaciones';
  const folder = zip.folder(folderName);

  if (!folder) {
    throw new Error("No se pudo crear la carpeta ZIP");
  }

  // Deduplicate names to prevent overwriting in the zip
  const uniqueNames = new Map<string, number>();

  names.forEach((name) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    let finalName = cleanName;

    // Handle accidental duplicates across the whole set by appending a counter if needed
    if (uniqueNames.has(finalName)) {
      const count = uniqueNames.get(finalName)! + 1;
      uniqueNames.set(finalName, count);
      finalName = `${finalName}_${count}`;
    } else {
      uniqueNames.set(finalName, 1);
    }

    // Ensure extension is present
    const fileName = finalName.toLowerCase().endsWith(`.${originalExtension}`) 
      ? finalName 
      : `${finalName}.${originalExtension}`;

    folder.file(fileName, file);
  });

  const content = await zip.generateAsync(
    { 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(metadata.percent);
      }
    }
  );
  
  // Native download method - no external dependency needed
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};