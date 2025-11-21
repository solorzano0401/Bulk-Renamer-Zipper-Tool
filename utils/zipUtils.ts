import JSZip from 'jszip';
import FileSaver from 'file-saver';

export const generateAndDownloadZip = async (
  file: File,
  names: string[],
  originalExtension: string
): Promise<void> => {
  const zip = new JSZip();
  const folderName = file.name.split('.')[0] + '_variations';
  const folder = zip.folder(folderName);

  if (!folder) {
    throw new Error("Failed to create zip folder");
  }

  // Deduplicate names to prevent overwriting in the zip
  const uniqueNames = new Map<string, number>();

  names.forEach((name) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    let finalName = cleanName;
    
    // Handle duplicates by appending a counter
    if (uniqueNames.has(cleanName)) {
      const count = uniqueNames.get(cleanName)! + 1;
      uniqueNames.set(cleanName, count);
      finalName = `${cleanName}_${count}`;
    } else {
      uniqueNames.set(cleanName, 1);
    }

    // Ensure extension is present
    const fileName = finalName.toLowerCase().endsWith(`.${originalExtension}`) 
      ? finalName 
      : `${finalName}.${originalExtension}`;

    folder.file(fileName, file);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  
  // Handle variations in file-saver export (default function vs object)
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(content, `${folderName}.zip`);
};