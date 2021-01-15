import XLSX from 'xlsx';
import {PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import RNHTMLtoPDF from 'react-native-html-to-pdf-lite';

const dirs = RNFetchBlob.fs.dirs;

export interface ExcelExportInterface {
  data: any;
  columns?: any;
  notificationTitle: string;
  filename?: string;
}

export const exportToExcel = async (options: ExcelExportInterface) => {
  const {data, columns, notificationTitle, filename} = options;

  const ws = XLSX.utils.aoa_to_sheet(data);
  if (columns) {
    ws['!cols'] = columns;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reports');
  const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});

  const dataToExport = wbout.split('').map((x: string) => x.charCodeAt(0));
  const path = `${dirs.DownloadDir}/${filename || 'Shara export'}.xlsx`;
  const mime = 'application/xlsx';
  const encoding = 'ascii';

  await saveToFile({
    data: dataToExport,
    path,
    mime,
    encoding,
    notificationTitle,
  });

  return path;
};

export const saveToFile = async ({
  data,
  path,
  mime,
  encoding,
  notificationTitle,
  notificationDescription,
}: {
  data: string | any;
  path: string;
  mime: string;
  encoding?: string;
  notificationTitle?: string;
  notificationDescription?: string;
}): Promise<Boolean> => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );

  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    return false;
  }
  // @ts-ignore
  await RNFetchBlob.fs.writeFile(path, data, encoding || 'utf8');
  await RNFetchBlob.fs.scanFile([{path, mime}]);
  await RNFetchBlob.android.addCompleteDownload({
    title: notificationTitle || 'Download completed',
    description: notificationDescription || 'Download completed',
    mime,
    path,
    showNotification: true,
  });

  return true;
};

export const exportHTMLToPDF = async (data: {
  html: string;
  fileName: string;
  previewFileName?: string;
}) => {
  const {html, fileName, previewFileName} = data;
  const path = `${dirs.DownloadDir}/${fileName}`;
  const options = {
    html,
    fileName: previewFileName || 'test',
  };
  const file = await RNHTMLtoPDF.convert(options);
  const pdfFilePath = file.filePath;
  const pdfBase64String = await RNFetchBlob.fs.readFile(
    `file://${pdfFilePath}`,
    'base64',
  );

  await saveToFile({
    path,
    encoding: 'base64',
    data: pdfBase64String,
    mime: 'application/pdf',
  });

  return {pdfBase64String, pdfFilePath};
};
