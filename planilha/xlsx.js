/*

1 Pegar o bairro pelo endereço, pesquisar as pessoas com aquele search
2 Pegar a rua e bairro e PAD 
3 Enviar a mensagem personalizada com esses dados 
4 Repetir os passos 2 e 3
*/
const xlsx = require("xlsx");

const workbook = xlsx.readFile("./planilha/bemviver.xlsx");

const sheetName1 = workbook.SheetNames[1];

const shhetName2 = workbook.SheetNames[2];

const sheet1 = workbook.Sheets[sheetName1];
const sheet2 = workbook.Sheets[shhetName2];

const aba1 = xlsx.utils.sheet_to_json(sheet1);
const aba2 = xlsx.utils.sheet_to_json(sheet2);

module.exports = {
  aba1,
  aba2,
};
