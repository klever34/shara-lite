import csvParser from 'csv-parser';
import fs from 'fs';
import _ from 'lodash';
import {writeSync as copyToClipboard} from 'clipboardy';
import offlineTranslations from '.';

const generateCSV = (object: {[key: string]: any}, prefix = '') => {
  let file = '';
  Object.keys(object).forEach((name) => {
    const key = `${prefix}${prefix ? '.' : ''}${name}`;
    let value = object[name];
    if (typeof value === 'string') {
      if (value.includes(',')) {
        value = `"${value}"`;
      }
      file += `${key},`;
      file += `${value}\n`;
    } else if (typeof value === 'object') {
      file += generateCSV(value, key);
    }
  });
  return file;
};

const readCSV = (filename: string): Promise<{[key: string]: string}[]> => {
  const result: {[key: string]: string}[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(csvParser())
      .on('data', (data) => {
        result.push(data);
      })
      .on('error', reject)
      .on('end', () => {
        resolve(result);
      });
  });
};

const writeToFile = (filename: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

let offlineTranslationsFile = 'key,';
Object.keys(offlineTranslations).forEach((langCode) => {
  offlineTranslationsFile += langCode;
});
offlineTranslationsFile += '\n';
offlineTranslationsFile += generateCSV(offlineTranslations.en);

writeToFile('offline-translations.json', JSON.stringify(offlineTranslations));
writeToFile('offline-translations.csv', offlineTranslationsFile);

const transactions: {[key: string]: any} = {};

readCSV('translations.csv').then((data) => {
  data.forEach(({key, ...translations}) => {
    Object.keys(translations).forEach((language) => {
      const [languageCode] = language.split(' ');
      if (!(languageCode in transactions)) {
        transactions[languageCode] = {};
      }
      _.set(transactions[languageCode], key, translations[language]);
    });
  });
  copyToClipboard(JSON.stringify(transactions));
  writeToFile('translations.json', JSON.stringify(transactions));
});
