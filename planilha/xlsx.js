const xlsx = require("xlsx");

const workbook = xlsx.readFile("./planilha/bemviver.xlsx");

const sheetName1 = workbook.SheetNames[1];
const sheetName2 = workbook.SheetNames[3];

console.log("Sheet 1 Name:", sheetName1);
console.log("Sheet 2 Name:", sheetName2);

const sheet1 = workbook.Sheets[sheetName1];
const sheet2 = workbook.Sheets[sheetName2];

// Converta a planilha para JSON com cabeçalhos
const aba1 = xlsx.utils.sheet_to_json(sheet1, { header: 1 });
const aba2 = xlsx.utils.sheet_to_json(sheet2, { header: 1 });

module.exports = {
  aba1,
  aba2,
};
