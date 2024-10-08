/* 
O QUE FAZER ? }
Objetivo 1: Enviar mensagem automaticas em grupo do whatsapp com a solicitação pendente de atendimento
1 - Pegar o endereço [rua e bairro] dos pacientes (na aba Pacientes) na aba Solicitações
2 - Pegar a frequencia pra aquele paciente
3 - Enviar a mensagem personalizada com esses dados nos grupos de whatsapp

Objetivo 2: Enviar mensagem automaticas para cada profissional no whatsapp que atende o bairro daquela solicitação
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
  const contatos = await client.getContacts();
  //pega os dados de contatos pelos nomes salvos no celular
  await buscaContatosSalvosPeloCell();

  //pega os dados do bairro e busca profissionais no whatsapp
  await buscaOsProfissionaisSalvosPeloBairro();

  //pega o nome do profissional e manda uma mensagem com a rua e bairro e o PAD
  await enviaMensagemProProfissional();
});

buscaContatosSalvosPeloCell = async () => {
  const contatos = await client.getContacts();

  const shortNameList = contatos
    .map((ctts) => ctts.shortName)
    .filter((name) => name !== undefined);

  return shortNameList;
};

const buscaOsProfissionaisSalvosPeloBairro = async () => {
  const contatosSalvosPeloCell = await buscaContatosSalvosPeloCell();
  const arrDeProfissionaisParaAtendimento = [];

  const extrairBairro = () => {
    const nomeProfissional = row["Nome"];
    console.log("Nome do profissional:", nomeProfissional);

    return nomeProfissional;
  };

  enviaMensagemProProfissional = async () => {};

  const buscaDadosSolicitações = () => {};
  // Iterar sobre os dados da primeira aba da tabela para obter os nomes dos pacientes
  for (const row of aba1) {
    const pacienteNome = row["NOME DO PACIENTE"];
    console.log("Nome:", pacienteNome);

    //verificar se existe endereço
    if (enderecoPaciente) {
      //extrai o bairro do endereço

      // console.log(`Endereço: ${enderecoPaciente}, Bairro: ${pacienteBairro}`);

      // Verificar se o nome salvo pelo celular contém algum profissional buscando pelo bairro na tabela
      matchPacienteProfisional();
    } else {
      console.log("Paciente sem endereço na tabela");
    }

    // function matchPacienteProfisional() {
    //   const pacienteBairro = extrairBairro(enderecoPaciente);

    //   const profissionaisEncontrados = contatosSalvosPeloCell.filter((ctt) => {
    //     const regex = new RegExp(`\\b${pacienteBairro}\\b`, "i");
    //     return regex.test(ctt);
    //   });
    //   // console.log(profissionaisEncontrados);

    //   if (profissionaisEncontrados.length > 0) {
    //     arrDeProfissionaisParaAtendimento.push(...profissionaisEncontrados);
    //   }
    // }
  }

  // console.log(
  //   "Profissionais encontrados para atendimento:",
  //   arrDeProfissionaisParaAtendimento
  // );

  return arrDeProfissionaisParaAtendimento;
};

client.initialize();
