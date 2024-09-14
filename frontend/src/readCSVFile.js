import Papa from 'papaparse';

export const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          complete: (result) => {
            resolve(result.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
  });
};