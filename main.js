/* 
O QUE FAZER ? }
Objetivo 1: Enviar mensagem automaticas em grupo do whatsapp com a solicitação pendente de atendimento
1 - Pegar o endereço [rua e bairro] dos pacientes (na aba Pacientes) na aba Solicitações
2 - Pegar a frequencia pra aquele paciente
3 - Enviar a mensagem personalizada com esses dados nos grupos de whatsapp

Objetivo 2: Enviar mensagem automaticas para cada profissional no whatsapp que atende o bairro daquela solicitação
1 - Pegar o nome do paciente na aba Pacientes
1 - Pegar o endereço [rua e bairro] dos pacientes (na aba Pacientes) na aba Solicitações
2 - Pegar o bairro que o proffional atende pelo contato salvo no whatsapp
3 - Fazer o match do bairro do paciente com o bairro do profissional
4 - Enviar uma mensagem personalizada com a solicitação de atendimento para o profissional
*/

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { aba1, aba2 } = require("./planilha/xlsx");

const client = new Client({ authStrategy: new LocalAuth() });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED", qr);
});

client.on("ready", async () => {
  const pacientes = await buscaOsPacientesQueNecessitamDeAtendimento();

  const enderecoAtendimento =
    await buscaOenderecoDosPacientesQueNecessitamDeAtendimento();

  const bairroAtendimento =
    await buscaOsBairrosDosPacientesQueNecessitamDeAtendimento();

  const contatos = await buscaContatosSalvosPeloCell();

  const frequenciaAtendimento = await buscaAfrequencaiaDeAtendimento();

  const objPaciente = await montaObjetosPacientes(
    pacientes,
    enderecoAtendimento,
    bairroAtendimento,
    frequenciaAtendimento
  );
  console.log("Objetos Pacientes:", objPaciente);
});

const buscaOsPacientesQueNecessitamDeAtendimento = async () => {
  console.log("Iniciando busca de pacientes que necessitam de atendimento...");
  const arrPacientesEncontradosParaAtendimento = [];
  // Itere a partir da quinta linha (índice 2)
  for (let i = 5; aba2.length && i < 100; i++) {
    const row = aba2[i];
    const nomePaciente = row[2];
    if (nomePaciente) {
      arrPacientesEncontradosParaAtendimento.push(nomePaciente);
    }
  }
  console.log("Busca de pacientes concluída.");
  return arrPacientesEncontradosParaAtendimento;
};

const buscaOenderecoDosPacientesQueNecessitamDeAtendimento = async () => {
  console.log("Iniciando busca de endereços dos pacientes...");

  const arrDeEnderecosEncontrados = [];
  for (let i = 4; i < aba1.length && i < 100; i++) {
    const row = aba1[i];
    const enderecoPaciente = row[2];
    if (enderecoPaciente && enderecoPaciente.trim() !== "") {
      arrDeEnderecosEncontrados.push(enderecoPaciente);
    }
  }
  console.log("Busca de endereços concluída.");

  return arrDeEnderecosEncontrados;
};

const buscaOsBairrosDosPacientesQueNecessitamDeAtendimento = async () => {
  const arrBairrosEncontrados = [];
  for (let i = 4; i < aba1.length && i < 100; i++) {
    const row = aba1[i];
    const bairroPaciente = row[3];
    if (bairroPaciente && bairroPaciente.trim() !== "") {
      arrBairrosEncontrados.push(bairroPaciente);
    }
  }

  return arrBairrosEncontrados;
};

const buscaAfrequencaiaDeAtendimento = async () => {
  const arrFrequenciaEncontrada = [];
  for (let i = 4; i < aba1.length && i < 100; i++) {
    const row = aba1[i];
    const frequenciaPaciente = row[7];
    if (frequenciaPaciente && frequenciaPaciente.trim() !== "") {
      arrFrequenciaEncontrada.push(frequenciaPaciente);
    }
  }

  return arrFrequenciaEncontrada;
};

const buscaContatosSalvosPeloCell = async () => {
  const contatos = await client.getContacts();

  const shortNameList = contatos
    .map((ctts) => ctts.shortName)
    .filter((name) => name !== undefined);

  const uniqueShortNameList = [...new Set(shortNameList)];

  return uniqueShortNameList;
};

const montaObjetosPacientes = async (
  pacientes,
  enderecos,
  bairros,
  frequencias
) => {
  const pacientesObj = pacientes.map((paciente, index) => {
    return {
      nome: paciente,
      endereco: enderecos[index],
      bairro: bairros[index],
      frequencia: frequencias[index],
    };
  });

  return pacientesObj;
};

const buscaProfissionaisQueAtendemObairro = async (bairro) => {
  const contatos = await buscaContatosSalvosPeloCell();

  const profissionais = contatos.filter((contato) => {
    return contato.includes(bairro);
  });

  return profissionais;
};

//Se o bairro que o paciente mora for igual ao bairro que o profissional atende, envia a mensagem
// const matchPacienteProfisional = async (pacientes) => {
//   for (const paciente of pacientes) {
//     const profissionais = await buscaProfissionaisQueAtendemObairro(
//       paciente.bairro
//     );
//     if (profissionais) {
//       console.log(
//         `Profissionais que atendem o bairro do paciente ${paciente.nome}`,
//         profissionais
//       );
//     }
//   }
// };
client.initialize();
