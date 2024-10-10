const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { aba1, aba2 } = require("./planilha/xlsx");

const client = new Client({ authStrategy: new LocalAuth() });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED", qr);
});

client.on("authenticated", () => {
  console.log("Client is authenticated!");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failure:", msg);
});

client.on("ready", async () => {
  console.log("Client is ready!");

  try {
    const ctts = await buscaContatosWhatsapp();

    const ids = await buscaIDsolicitacao();
    const pacientes = await buscaOsNomesPaciente();
    const enderecoAtendimento = await buscaEnderecoPaciente();
    const bairroAtendimento = await buscaBairroPaciente();

    const especialidade = await buscaEspecialidadePaciente();
    const frequenciaAtendimento = await buscaFrequenciaPaciente();

    const objSolicitacao = await montaObjetoSolicitacao(
      ids,
      pacientes,
      enderecoAtendimento,
      bairroAtendimento,
      especialidade,
      frequenciaAtendimento
    );
    // console.log("Solicitações:", objSolicitacao);

    const profissionaisFiltrados = await buscaProfissionaisQueAtendemObairro(
      bairroAtendimento
    );

    //logica para processar solicitações
  } catch (error) {
    console.error("Erro durante a inicialização:", error);
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

const buscaContatosWhatsapp = async () => {
  const contatos = await client.getContacts();

  const shortNameList = contatos
    .map((ctts) => ctts.shortName)
    .filter((name) => name !== undefined);

  const uniqueShortNameList = [...new Set(shortNameList)];

  return uniqueShortNameList;
};

const buscaIDsolicitacao = async () => {
  const ids = [];
  for (let i = 5; i < aba2.length && i < 100; i++) {
    const row = aba2[i];
    const idSolicitacao = row[0];
    if (idSolicitacao) {
      ids.push(idSolicitacao);
    }
  }
  return ids;
};

const buscaOsNomesPaciente = async () => {
  console.log("Iniciando busca de pacientes que necessitam de atendimento...");
  const arrPacientesEncontradosParaAtendimento = [];
  for (let i = 5; aba2.length && i < 100; i++) {
    const row = aba2[i];
    const nomePaciente = row[2];
    if (nomePaciente && nomePaciente.trim() !== "") {
      arrPacientesEncontradosParaAtendimento.push(nomePaciente);
    }
  }
  console.log("Busca de pacientes concluída.");
  return arrPacientesEncontradosParaAtendimento;
};

const buscaEnderecoPaciente = async () => {
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

const buscaBairroPaciente = async () => {
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

const buscaEspecialidadePaciente = async () => {
  const arrEspecialidadesEncontradas = [];
  for (let i = 4; i < aba1.length && i < 100; i++) {
    const row = aba1[i];
    const especialidadePaciente = row[5];
    if (especialidadePaciente && especialidadePaciente.trim() !== "") {
      arrEspecialidadesEncontradas.push(especialidadePaciente);
    }
  }

  return arrEspecialidadesEncontradas;
};

const buscaFrequenciaPaciente = async () => {
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

const montaObjetoSolicitacao = async (
  ids,
  pacientes,
  enderecos,
  bairros,
  especialidades,
  frequencias
) => {
  console.log("Iniciando montagem do objeto de solicitação...");
  const solicitacaoObj = pacientes
    .map((paciente, index) => {
      // const profissionais = await buscaProfissionaisQueAtendemObairro(
      //   bairros[index],
      //   EspecialidadesArray
      // );
      // console.log("Profissionais encontrados: ", profissionais);
      if (
        ids[index] &&
        paciente &&
        enderecos[index] &&
        bairros[index] &&
        especialidades[index] &&
        frequencias[index]
      ) {
        return {
          idSolicitacao: ids[index],
          nome: paciente,
          endereco: enderecos[index],
          bairro: bairros[index],
          especialidadesNecessarias: especialidades[index],
          frequenciasNecessarias: frequencias[index],
          // profissionaisEncontrados: profissionais,
        };
      }
    })
    .filter((solicitacao) => solicitacao !== undefined);
  console.log("Montagem do objeto de solicitação concluída.");
  return solicitacaoObj;
};

const buscaProfissionaisQueAtendemObairro = async (bairros) => {
  console.log(
    "Iniciando busca de profissionais no Whatsapp que atendem o bairro..."
  );

  const contatos = await buscaContatosWhatsapp();

  const contatosLower = contatos.map((contato) => contato.toLowerCase());
  console.log("Contatos encontrados: ", contatosLower);

  const bairroLower = bairros.map((bairro) => bairro.toLowerCase());
  console.log("Bairro encontrado: ", bairroLower);

  const profissionaisFiltrados = contatos.filter((profissional) => {
    const profissionalLower = profissional.toLowerCase();
    return bairroLower.some((bairro) => profissionalLower.includes(bairro));
  });
  console.log("Profissionais encontrados: ", profissionaisFiltrados);

  console.log("Busca de profissionais concluída.");
  return profissionaisFiltrados;
};

client.initialize();
