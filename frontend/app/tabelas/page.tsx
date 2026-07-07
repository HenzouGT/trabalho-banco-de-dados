"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  lerUsuarioAtivo,
  montarHeadersJson,
  observarUsuarioAtivo,
  usuarioEhAdmin,
} from "../lib/usuario-ativo";

type ValorCampo = string | number | boolean | null | undefined;
type Registro = Record<string, ValorCampo>;

type TabelaId =
  | "usuario"
  | "obra"
  | "artista"
  | "genero"
  | "lista"
  | "arte"
  | "seguidor"
  | "usuario_salva_lista"
  | "lista_obra"
  | "avaliacao"
  | "watchlist"
  | "usuario_curte_arte"
  | "obra_artista"
  | "obra_genero";

type TipoCampo =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "url"
  | "number"
  | "date"
  | "datetime-local"
  | "checkbox"
  | "select";

type Opcao = {
  valor: string;
  rotulo: string;
};

type CampoConfig = {
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio?: boolean | "create";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  linhas?: number;
  inteiro?: boolean;
  tabelaReferencia?: TabelaId;
  opcoes?: Opcao[];
};

type TabelaConfig = {
  id: TabelaId;
  rota: string;
  titulo: string;
  descricao: string;
  chave: string[];
  campos: CampoConfig[];
  colunas: string[];
  permiteEditar: boolean;
};

type DadosPorTabela = Record<TabelaId, Registro[]>;

const TIPO_OBRA_OPCOES: Opcao[] = [
  { valor: "Filme", rotulo: "Filme" },
  { valor: "Série", rotulo: "Serie" },
  { valor: "Documentário", rotulo: "Documentario" },
  { valor: "Minissérie", rotulo: "Minisserie" },
  { valor: "Curta-metragem", rotulo: "Curta-metragem" },
  { valor: "Animação", rotulo: "Animacao" },
];

const TIPO_ARTE_OPCOES: Opcao[] = [
  { valor: "Pôster", rotulo: "Poster" },
  { valor: "Fanart", rotulo: "Fanart" },
  { valor: "Cena", rotulo: "Cena" },
  { valor: "Bastidores", rotulo: "Bastidores" },
  { valor: "Banner", rotulo: "Banner" },
  { valor: "Edit", rotulo: "Edit" },
];

const FUNCAO_ARTISTA_OPCOES: Opcao[] = [
  { valor: "Diretor", rotulo: "Diretor" },
  { valor: "Ator", rotulo: "Ator" },
  { valor: "Roteirista", rotulo: "Roteirista" },
  { valor: "Produtor", rotulo: "Produtor" },
  {
    valor: "Diretor de Fotografia",
    rotulo: "Diretor de Fotografia",
  },
  { valor: "Trilha Sonora", rotulo: "Trilha Sonora" },
];

const FUNCAO_USUARIO_OPCOES: Opcao[] = [
  { valor: "CLIENTE", rotulo: "Cliente" },
  { valor: "ADMIN", rotulo: "Admin" },
];

const TABELAS_CRIACAO_ADMIN = new Set<TabelaId>([
  "obra",
  "artista",
  "genero",
  "obra_artista",
  "obra_genero",
]);

const TABELAS: TabelaConfig[] = [
  {
    id: "usuario",
    rota: "usuario",
    titulo: "Usuarios",
    descricao: "Cadastro completo da tabela usuario, sem expor hash_senha.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "nome",
        rotulo: "Nome",
        tipo: "text",
        obrigatorio: true,
        placeholder: "Nome do usuario",
      },
      {
        nome: "email",
        rotulo: "Email",
        tipo: "email",
        obrigatorio: true,
        placeholder: "usuario@example.com",
      },
      {
        nome: "senha",
        rotulo: "Senha",
        tipo: "password",
        obrigatorio: "create",
        placeholder: "Obrigatoria no cadastro",
      },
      {
        nome: "bio",
        rotulo: "Bio",
        tipo: "textarea",
        linhas: 4,
        placeholder: "Bio opcional",
      },
      {
        nome: "avatar",
        rotulo: "Avatar",
        tipo: "url",
        placeholder: "https://example.com/avatar.jpg",
      },
      {
        nome: "funcao",
        rotulo: "Funcao",
        tipo: "select",
        opcoes: FUNCAO_USUARIO_OPCOES,
      },
    ],
    colunas: ["id", "nome", "email", "bio", "avatar", "funcao"],
  },
  {
    id: "obra",
    rota: "obra",
    titulo: "Obras",
    descricao: "Cadastro geral da tabela obra com todos os tipos do enum.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "titulo",
        rotulo: "Titulo",
        tipo: "text",
        obrigatorio: true,
        placeholder: "Titulo da obra",
      },
      {
        nome: "tipo_obra",
        rotulo: "Tipo",
        tipo: "select",
        obrigatorio: true,
        opcoes: TIPO_OBRA_OPCOES,
      },
      {
        nome: "ano",
        rotulo: "Ano",
        tipo: "number",
        inteiro: true,
        min: 1888,
        max: 2100,
        placeholder: "2026",
      },
      {
        nome: "duracao",
        rotulo: "Duracao",
        tipo: "number",
        inteiro: true,
        min: 1,
        placeholder: "Minutos",
      },
      {
        nome: "poster",
        rotulo: "Poster",
        tipo: "url",
        placeholder: "https://example.com/poster.jpg",
      },
    ],
    colunas: ["id", "titulo", "tipo_obra", "ano", "duracao", "poster"],
  },
  {
    id: "artista",
    rota: "artista",
    titulo: "Artistas",
    descricao: "Cadastro da tabela artista.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "nome",
        rotulo: "Nome",
        tipo: "text",
        obrigatorio: true,
        placeholder: "Nome do artista",
      },
      {
        nome: "biografia",
        rotulo: "Biografia",
        tipo: "textarea",
        linhas: 5,
        placeholder: "Biografia opcional",
      },
      {
        nome: "foto",
        rotulo: "Foto",
        tipo: "url",
        placeholder: "https://example.com/foto.jpg",
      },
    ],
    colunas: ["id", "nome", "biografia", "foto"],
  },
  {
    id: "genero",
    rota: "genero",
    titulo: "Generos",
    descricao: "Cadastro da tabela genero.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "nome",
        rotulo: "Nome",
        tipo: "text",
        obrigatorio: true,
        placeholder: "Ex.: Drama",
      },
    ],
    colunas: ["id", "nome"],
  },
  {
    id: "lista",
    rota: "lista",
    titulo: "Listas",
    descricao: "Listas criadas por usuarios.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "titulo",
        rotulo: "Titulo",
        tipo: "text",
        obrigatorio: true,
        placeholder: "Titulo da lista",
      },
      {
        nome: "descricao",
        rotulo: "Descricao",
        tipo: "textarea",
        linhas: 4,
        placeholder: "Descricao opcional",
      },
      {
        nome: "publica",
        rotulo: "Publica",
        tipo: "checkbox",
      },
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
    ],
    colunas: ["id", "titulo", "descricao", "publica", "id_usuario"],
  },
  {
    id: "arte",
    rota: "arte",
    titulo: "Artes",
    descricao: "Artes enviadas por usuarios para obras.",
    chave: ["id"],
    permiteEditar: true,
    campos: [
      {
        nome: "tipo_arte",
        rotulo: "Tipo",
        tipo: "select",
        obrigatorio: true,
        opcoes: TIPO_ARTE_OPCOES,
      },
      {
        nome: "link",
        rotulo: "Link",
        tipo: "url",
        obrigatorio: true,
        placeholder: "https://example.com/arte.jpg",
      },
      {
        nome: "data",
        rotulo: "Data",
        tipo: "date",
      },
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
    ],
    colunas: ["id", "tipo_arte", "link", "data", "id_usuario", "id_obra"],
  },
  {
    id: "seguidor",
    rota: "seguidor",
    titulo: "Seguidores",
    descricao: "Relacionamento usuario segue usuario.",
    chave: ["id_seguidor", "id_seguido"],
    permiteEditar: true,
    campos: [
      {
        nome: "id_seguidor",
        rotulo: "Seguidor",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_seguido",
        rotulo: "Seguido",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "data_follow",
        rotulo: "Data do follow",
        tipo: "datetime-local",
      },
    ],
    colunas: ["id_seguidor", "id_seguido", "data_follow"],
  },
  {
    id: "usuario_salva_lista",
    rota: "usuario_salva_lista",
    titulo: "Listas salvas",
    descricao: "Relacionamento usuario salva lista.",
    chave: ["id_usuario", "id_lista"],
    permiteEditar: false,
    campos: [
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_lista",
        rotulo: "Lista",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "lista",
      },
    ],
    colunas: ["id_usuario", "id_lista"],
  },
  {
    id: "lista_obra",
    rota: "lista_obra",
    titulo: "Obras em listas",
    descricao: "Relacionamento lista contem obra com ordem.",
    chave: ["id_lista", "id_obra"],
    permiteEditar: true,
    campos: [
      {
        nome: "id_lista",
        rotulo: "Lista",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "lista",
      },
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
      {
        nome: "ordem",
        rotulo: "Ordem",
        tipo: "number",
        obrigatorio: true,
        inteiro: true,
        min: 1,
        placeholder: "1",
      },
    ],
    colunas: ["id_lista", "id_obra", "ordem"],
  },
  {
    id: "avaliacao",
    rota: "avaliacao",
    titulo: "Avaliacoes",
    descricao: "Avaliacoes de usuarios por obra.",
    chave: ["id_usuario", "id_obra"],
    permiteEditar: true,
    campos: [
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
      {
        nome: "data",
        rotulo: "Data",
        tipo: "date",
      },
      {
        nome: "nota",
        rotulo: "Nota",
        tipo: "number",
        obrigatorio: true,
        min: 0,
        max: 10,
        step: "0.01",
        placeholder: "0 a 10",
      },
      {
        nome: "reassistido",
        rotulo: "Reassistido",
        tipo: "checkbox",
      },
      {
        nome: "resenha",
        rotulo: "Resenha",
        tipo: "textarea",
        linhas: 5,
        placeholder: "Resenha opcional",
      },
    ],
    colunas: ["id_usuario", "id_obra", "data", "nota", "reassistido", "resenha"],
  },
  {
    id: "watchlist",
    rota: "watchlist",
    titulo: "Watchlist",
    descricao: "Obras adicionadas a watchlists de usuarios.",
    chave: ["id_usuario", "id_obra"],
    permiteEditar: true,
    campos: [
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
      {
        nome: "data_adicao",
        rotulo: "Data de adicao",
        tipo: "datetime-local",
      },
    ],
    colunas: ["id_usuario", "id_obra", "data_adicao"],
  },
  {
    id: "usuario_curte_arte",
    rota: "usuario_curte_arte",
    titulo: "Curtidas de arte",
    descricao: "Relacionamento usuario curte arte.",
    chave: ["id_usuario", "id_arte"],
    permiteEditar: false,
    campos: [
      {
        nome: "id_usuario",
        rotulo: "Usuario",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "usuario",
      },
      {
        nome: "id_arte",
        rotulo: "Arte",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "arte",
      },
    ],
    colunas: ["id_usuario", "id_arte"],
  },
  {
    id: "obra_artista",
    rota: "obra_artista",
    titulo: "Artistas por obra",
    descricao: "Relacionamento obra artista com funcao.",
    chave: ["id_obra", "id_artista", "funcao"],
    permiteEditar: false,
    campos: [
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
      {
        nome: "id_artista",
        rotulo: "Artista",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "artista",
      },
      {
        nome: "funcao",
        rotulo: "Funcao",
        tipo: "select",
        obrigatorio: true,
        opcoes: FUNCAO_ARTISTA_OPCOES,
      },
    ],
    colunas: ["id_obra", "id_artista", "funcao"],
  },
  {
    id: "obra_genero",
    rota: "obra_genero",
    titulo: "Generos por obra",
    descricao: "Relacionamento obra genero.",
    chave: ["id_obra", "id_genero"],
    permiteEditar: false,
    campos: [
      {
        nome: "id_obra",
        rotulo: "Obra",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "obra",
      },
      {
        nome: "id_genero",
        rotulo: "Genero",
        tipo: "select",
        obrigatorio: true,
        tabelaReferencia: "genero",
      },
    ],
    colunas: ["id_obra", "id_genero"],
  },
];

const TABELA_INICIAL = TABELAS[0];

const NOMES_TABELAS = TABELAS.reduce(
  (nomes, tabela) => ({
    ...nomes,
    [tabela.id]: tabela.titulo,
  }),
  {} as Record<TabelaId, string>,
);

function criarDadosVazios(): DadosPorTabela {
  return TABELAS.reduce(
    (dados, tabela) => ({
      ...dados,
      [tabela.id]: [],
    }),
    {} as DadosPorTabela,
  );
}

function criarFormularioVazio(tabela: TabelaConfig): Registro {
  return tabela.campos.reduce((formulario, campo) => {
    formulario[campo.nome] = campo.tipo === "checkbox" ? false : "";
    return formulario;
  }, {} as Registro);
}

async function lerMensagemErro(resposta: Response, fallback: string) {
  try {
    const corpo = (await resposta.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(corpo.message)) {
      return corpo.message.join(" ");
    }

    if (corpo.message) {
      return corpo.message;
    }

    if (corpo.error) {
      return corpo.error;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function obterCampo(tabela: TabelaConfig, nomeCampo: string) {
  return tabela.campos.find((campo) => campo.nome === nomeCampo);
}

function obterRotuloColuna(tabela: TabelaConfig, nomeCampo: string) {
  if (nomeCampo === "id") {
    return "ID";
  }

  return (
    obterCampo(tabela, nomeCampo)?.rotulo ??
    nomeCampo
      .split("_")
      .map((parte) => parte[0]?.toUpperCase() + parte.slice(1))
      .join(" ")
  );
}

function formatarData(data: string) {
  return data.slice(0, 10).split("-").reverse().join("/");
}

function formatarDataHora(data: string) {
  const normalizada = data.replace("T", " ");
  return normalizada.slice(0, 16);
}

function formatarValorParaInput(campo: CampoConfig, valor: ValorCampo) {
  if (campo.tipo === "checkbox") {
    return Boolean(valor);
  }

  if (valor === null || valor === undefined) {
    return "";
  }

  if (campo.tipo === "date") {
    return String(valor).slice(0, 10);
  }

  if (campo.tipo === "datetime-local") {
    return String(valor).replace(" ", "T").slice(0, 16);
  }

  return String(valor);
}

function montarFormularioDeRegistro(
  tabela: TabelaConfig,
  registro: Registro,
) {
  return tabela.campos.reduce((formulario, campo) => {
    formulario[campo.nome] =
      campo.tipo === "password"
        ? ""
        : formatarValorParaInput(campo, registro[campo.nome]);
    return formulario;
  }, {} as Registro);
}

function campoObrigatorio(campo: CampoConfig, criando: boolean) {
  return campo.obrigatorio === true || (campo.obrigatorio === "create" && criando);
}

function parseCampo(
  campo: CampoConfig,
  valor: ValorCampo,
  criando: boolean,
) {
  const obrigatorio = campoObrigatorio(campo, criando);

  if (campo.tipo === "checkbox") {
    return Boolean(valor);
  }

  const texto = String(valor ?? "").trim();

  if (!texto) {
    if (obrigatorio) {
      throw new Error(`Preencha o campo ${campo.rotulo}.`);
    }

    return undefined;
  }

  if (campo.tipo === "number") {
    const numero = Number(texto);

    if (!Number.isFinite(numero)) {
      throw new Error(`Informe um numero valido em ${campo.rotulo}.`);
    }

    if (campo.inteiro && !Number.isInteger(numero)) {
      throw new Error(`Informe um numero inteiro em ${campo.rotulo}.`);
    }

    if (campo.min !== undefined && numero < campo.min) {
      throw new Error(`${campo.rotulo} deve ser maior ou igual a ${campo.min}.`);
    }

    if (campo.max !== undefined && numero > campo.max) {
      throw new Error(`${campo.rotulo} deve ser menor ou igual a ${campo.max}.`);
    }

    return numero;
  }

  return texto;
}

function montarPayload(
  tabela: TabelaConfig,
  formulario: Registro,
  criando: boolean,
) {
  return tabela.campos.reduce((payload, campo) => {
    if (!criando && tabela.chave.includes(campo.nome)) {
      return payload;
    }

    const valor = parseCampo(campo, formulario[campo.nome], criando);

    if (valor !== undefined) {
      payload[campo.nome] = valor;
    }

    return payload;
  }, {} as Registro);
}

function montarCaminhoRegistro(tabela: TabelaConfig, registro: Registro) {
  return tabela.chave
    .map((campo) => encodeURIComponent(String(registro[campo] ?? "")))
    .join("/");
}

function obterRotuloRegistro(tabelaId: TabelaId, registro: Registro) {
  switch (tabelaId) {
    case "usuario":
      return `${registro.nome ?? "Usuario"} (${registro.email ?? registro.id})`;
    case "obra":
      return `${registro.titulo ?? "Obra"} (${registro.tipo_obra ?? registro.id})`;
    case "artista":
      return String(registro.nome ?? registro.id ?? "Artista");
    case "genero":
      return String(registro.nome ?? registro.id ?? "Genero");
    case "lista":
      return `${registro.titulo ?? "Lista"} (${registro.id ?? ""})`;
    case "arte":
      return `${registro.tipo_arte ?? "Arte"} (${registro.id ?? ""})`;
    default:
      return Object.values(registro)
        .filter((valor) => valor !== null && valor !== undefined && valor !== "")
        .slice(0, 3)
        .join(" / ");
  }
}

function obterOpcoesCampo(campo: CampoConfig, dados: DadosPorTabela) {
  if (campo.opcoes) {
    return campo.opcoes;
  }

  if (!campo.tabelaReferencia) {
    return [];
  }

  return dados[campo.tabelaReferencia].map((registro) => ({
    valor: String(registro.id ?? ""),
    rotulo: obterRotuloRegistro(campo.tabelaReferencia as TabelaId, registro),
  }));
}

function formatarValorCampo(
  tabela: TabelaConfig,
  nomeCampo: string,
  valor: ValorCampo,
  dados: DadosPorTabela,
) {
  const campo = obterCampo(tabela, nomeCampo);

  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }

  if (campo?.tipo === "checkbox") {
    return valor ? "Sim" : "Nao";
  }

  if (campo?.tipo === "date") {
    return formatarData(String(valor));
  }

  if (campo?.tipo === "datetime-local") {
    return formatarDataHora(String(valor));
  }

  if (campo?.tipo === "select") {
    const opcoes = obterOpcoesCampo(campo, dados);
    const opcao = opcoes.find((item) => item.valor === String(valor));
    return opcao ? opcao.rotulo : String(valor);
  }

  return String(valor);
}

function pluralizarRegistro(total: number) {
  return total === 1 ? "registro" : "registros";
}

export default function TabelasPage() {
  const usuarioAtivo = useSyncExternalStore(
    observarUsuarioAtivo,
    lerUsuarioAtivo,
    () => null,
  );
  const [tabelaSelecionadaId, setTabelaSelecionadaId] = useState<TabelaId>(
    TABELA_INICIAL.id,
  );
  const [dados, setDados] = useState<DadosPorTabela>(() => criarDadosVazios());
  const [formulario, setFormulario] = useState<Registro>(() =>
    criarFormularioVazio(TABELA_INICIAL),
  );
  const [registroEditando, setRegistroEditando] = useState<Registro | null>(
    null,
  );
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoChave, setExcluindoChave] = useState<string | null>(null);

  const tabelaSelecionada = useMemo(
    () =>
      TABELAS.find((tabela) => tabela.id === tabelaSelecionadaId) ??
      TABELA_INICIAL,
    [tabelaSelecionadaId],
  );
  const registros = dados[tabelaSelecionada.id];
  const usuarioAdministrador = usuarioEhAdmin(usuarioAtivo);
  const criacaoAdminObrigatoria =
    !registroEditando && TABELAS_CRIACAO_ADMIN.has(tabelaSelecionada.id);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const respostas = await Promise.all(
        TABELAS.map((tabela) =>
          fetch(`/api/${tabela.rota}`, {
            headers: {
              Accept: "application/json",
            },
          }),
        ),
      );

      const respostaComErro = respostas.find((resposta) => !resposta.ok);

      if (respostaComErro) {
        throw new Error(
          await lerMensagemErro(
            respostaComErro,
            "Nao foi possivel carregar as tabelas.",
          ),
        );
      }

      const dadosCarregados = await Promise.all(
        respostas.map((resposta) => resposta.json() as Promise<Registro[]>),
      );

      setDados(
        TABELAS.reduce((dadosAtualizados, tabela, indice) => {
          dadosAtualizados[tabela.id] = dadosCarregados[indice] ?? [];
          return dadosAtualizados;
        }, criarDadosVazios()),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar as tabelas.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDados]);

  function selecionarTabela(tabelaId: TabelaId) {
    const tabela = TABELAS.find((item) => item.id === tabelaId) ?? TABELA_INICIAL;

    setTabelaSelecionadaId(tabela.id);
    setFormulario(criarFormularioVazio(tabela));
    setRegistroEditando(null);
    setErro("");
    setMensagem("");
    setExcluindoChave(null);
  }

  function atualizarCampo(campo: string, valor: ValorCampo) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setFormulario(criarFormularioVazio(tabelaSelecionada));
    setRegistroEditando(null);
    setErro("");
    setMensagem("");
  }

  function editarRegistro(registro: Registro) {
    setRegistroEditando(registro);
    setFormulario(montarFormularioDeRegistro(tabelaSelecionada, registro));
    setErro("");
    setMensagem("");
  }

  async function salvarRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const criando = !registroEditando;
    let payload: Registro;

    if (criando && TABELAS_CRIACAO_ADMIN.has(tabelaSelecionada.id)) {
      if (!usuarioAdministrador) {
        setErro("Apenas usuarios ADMIN podem inserir registros nesta tabela.");
        return;
      }
    }

    try {
      payload = montarPayload(tabelaSelecionada, formulario, criando);

      if (tabelaSelecionada.id === "usuario" && !usuarioAdministrador) {
        delete payload.funcao;
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados invalidos.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        criando
          ? `/api/${tabelaSelecionada.rota}`
          : `/api/${tabelaSelecionada.rota}/${montarCaminhoRegistro(
              tabelaSelecionada,
              registroEditando,
            )}`,
        {
          method: criando ? "POST" : "PATCH",
          headers: montarHeadersJson(usuarioAtivo),
          body: JSON.stringify(payload),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel salvar o registro."),
        );
      }

      await carregarDados();
      setMensagem(
        criando
          ? "Registro cadastrado com sucesso."
          : "Registro atualizado com sucesso.",
      );
      limparFormulario();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o registro.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirRegistro(registro: Registro) {
    const chave = montarCaminhoRegistro(tabelaSelecionada, registro);
    const confirmar = window.confirm(
      `Excluir este registro de ${tabelaSelecionada.titulo}?`,
    );

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindoChave(chave);

    try {
      const resposta = await fetch(`/api/${tabelaSelecionada.rota}/${chave}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(
            resposta,
            "Nao foi possivel excluir o registro.",
          ),
        );
      }

      if (
        registroEditando &&
        montarCaminhoRegistro(tabelaSelecionada, registroEditando) === chave
      ) {
        limparFormulario();
      }

      await carregarDados();
      setMensagem("Registro excluido com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o registro.",
      );
    } finally {
      setExcluindoChave(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-[#d8d1c5] pb-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
              Painel administrativo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Tabelas do banco
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52616b]">
              CRUD das tabelas declaradas em scripts.sql, incluindo as tabelas
              associativas com chaves compostas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/filmes"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Filmes
            </Link>
            <Link
              href="/avaliacoes"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Avaliacoes
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844]"
            >
              Inicio
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-[#d8d1c5] bg-white p-4 shadow-sm">
            <h2 className="px-2 text-sm font-semibold uppercase text-[#52616b]">
              Tabelas
            </h2>
            <div className="mt-3 flex flex-col gap-1">
              {TABELAS.map((tabela) => (
                <button
                  key={tabela.id}
                  type="button"
                  onClick={() => selecionarTabela(tabela.id)}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                    tabelaSelecionada.id === tabela.id
                      ? "bg-[#23395b] font-semibold text-white"
                      : "text-[#172026] hover:bg-[#f8f6f2]"
                  }`}
                >
                  <span>{NOMES_TABELAS[tabela.id]}</span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      tabelaSelecionada.id === tabela.id
                        ? "bg-white/15 text-white"
                        : "bg-[#f8f6f2] text-[#52616b]"
                    }`}
                  >
                    {dados[tabela.id].length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <form
              onSubmit={salvarRegistro}
              className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
                  {tabelaSelecionada.id}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#172026]">
                  {registroEditando ? "Editar registro" : "Novo registro"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#52616b]">
                  {tabelaSelecionada.descricao}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {tabelaSelecionada.campos.map((campo) => {
                  const valor = formulario[campo.nome];
                  const desabilitado =
                    Boolean(registroEditando) &&
                    tabelaSelecionada.chave.includes(campo.nome);
                  const funcaoUsuarioBloqueada =
                    tabelaSelecionada.id === "usuario" &&
                    campo.nome === "funcao" &&
                    !usuarioAdministrador;
                  const obrigatorio = campoObrigatorio(campo, !registroEditando);

                  if (campo.tipo === "textarea") {
                    return (
                      <label
                        key={campo.nome}
                        className="flex flex-col gap-2 text-sm font-medium text-[#172026]"
                      >
                        {campo.rotulo}
                        <textarea
                          value={String(valor ?? "")}
                          onChange={(event) =>
                            atualizarCampo(campo.nome, event.target.value)
                          }
                          rows={campo.linhas ?? 4}
                          required={obrigatorio}
                          disabled={
                            desabilitado || funcaoUsuarioBloqueada || salvando
                          }
                          className="resize-none rounded-md border border-[#c9c0b4] bg-white px-3 py-2 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20 disabled:bg-[#f3f0eb] disabled:text-[#8a96a8]"
                          placeholder={campo.placeholder}
                        />
                      </label>
                    );
                  }

                  if (campo.tipo === "select") {
                    const opcoes = obterOpcoesCampo(campo, dados);

                    return (
                      <label
                        key={campo.nome}
                        className="flex flex-col gap-2 text-sm font-medium text-[#172026]"
                      >
                        {campo.rotulo}
                        <select
                          value={String(valor ?? "")}
                          onChange={(event) =>
                            atualizarCampo(campo.nome, event.target.value)
                          }
                          required={obrigatorio}
                          disabled={
                            desabilitado || funcaoUsuarioBloqueada || salvando
                          }
                          className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20 disabled:bg-[#f3f0eb] disabled:text-[#8a96a8]"
                        >
                          <option value="">Selecione</option>
                          {opcoes.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>
                              {opcao.rotulo}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  if (campo.tipo === "checkbox") {
                    return (
                      <label
                        key={campo.nome}
                        className="flex items-center gap-3 text-sm font-medium text-[#172026]"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(valor)}
                          onChange={(event) =>
                            atualizarCampo(campo.nome, event.target.checked)
                          }
                          disabled={
                            desabilitado || funcaoUsuarioBloqueada || salvando
                          }
                          className="h-4 w-4 accent-[#23395b]"
                        />
                        {campo.rotulo}
                      </label>
                    );
                  }

                  return (
                    <label
                      key={campo.nome}
                      className="flex flex-col gap-2 text-sm font-medium text-[#172026]"
                    >
                      {campo.rotulo}
                      <input
                        type={campo.tipo}
                        value={String(valor ?? "")}
                        onChange={(event) =>
                          atualizarCampo(campo.nome, event.target.value)
                        }
                        required={obrigatorio}
                        disabled={
                          desabilitado || funcaoUsuarioBloqueada || salvando
                        }
                        min={campo.min}
                        max={campo.max}
                        step={campo.step}
                        className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20 disabled:bg-[#f3f0eb] disabled:text-[#8a96a8]"
                        placeholder={campo.placeholder}
                      />
                    </label>
                  );
                })}

                {!tabelaSelecionada.permiteEditar ? (
                  <p className="rounded-md border border-[#e4ded4] bg-[#f8f6f2] px-3 py-2 text-xs leading-5 text-[#52616b]">
                    Esta tabela associativa nao possui campos atualizaveis no
                    backend; use cadastrar e excluir.
                  </p>
                ) : null}

                {criacaoAdminObrigatoria && !usuarioAdministrador ? (
                  <p className="rounded-md border border-[#e4ded4] bg-[#f8f6f2] px-3 py-2 text-xs leading-5 text-[#52616b]">
                    Entre com um usuario ADMIN para inserir registros nesta
                    tabela.
                  </p>
                ) : null}

                {tabelaSelecionada.id === "usuario" &&
                !usuarioAdministrador ? (
                  <p className="rounded-md border border-[#e4ded4] bg-[#f8f6f2] px-3 py-2 text-xs leading-5 text-[#52616b]">
                    Apenas usuarios ADMIN podem definir a funcao de outro
                    usuario. Sem funcao informada, o banco usa CLIENTE.
                  </p>
                ) : null}

                {erro ? (
                  <p className="rounded-md border border-[#f1b8a8] bg-[#fff4f0] px-3 py-2 text-sm text-[#9d3018]">
                    {erro}
                  </p>
                ) : null}

                {mensagem ? (
                  <p className="rounded-md border border-[#b9d8c2] bg-[#f0fff4] px-3 py-2 text-sm text-[#1f6b35]">
                    {mensagem}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={
                      salvando ||
                      carregando ||
                      (criacaoAdminObrigatoria && !usuarioAdministrador)
                    }
                    className="h-11 rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844] disabled:cursor-not-allowed disabled:bg-[#8a96a8]"
                  >
                    {salvando
                      ? "Salvando..."
                      : registroEditando
                        ? "Atualizar"
                        : "Cadastrar"}
                  </button>
                  <button
                    type="button"
                    onClick={limparFormulario}
                    disabled={salvando}
                    className="h-11 rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </form>

            <section className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-[#172026]">
                    {tabelaSelecionada.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-[#52616b]">
                    {registros.length} {pluralizarRegistro(registros.length)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void carregarDados()}
                  disabled={carregando}
                  className="h-10 rounded-md border border-[#b8b0a3] px-4 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:text-[#8a96a8]"
                >
                  {carregando ? "Carregando..." : "Atualizar"}
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-md border border-[#e4ded4]">
                {carregando ? (
                  <p className="px-4 py-5 text-sm text-[#52616b]">
                    Carregando registros...
                  </p>
                ) : registros.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-[#52616b]">
                    Nenhum registro encontrado nesta tabela.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                      <thead className="bg-[#f8f6f2] text-xs uppercase text-[#52616b]">
                        <tr>
                          {tabelaSelecionada.colunas.map((coluna) => (
                            <th key={coluna} className="px-4 py-3 font-semibold">
                              {obterRotuloColuna(tabelaSelecionada, coluna)}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right font-semibold">
                            Acoes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {registros.map((registro) => {
                          const chave = montarCaminhoRegistro(
                            tabelaSelecionada,
                            registro,
                          );

                          return (
                            <tr
                              key={chave}
                              className="border-t border-[#e4ded4] align-top"
                            >
                              {tabelaSelecionada.colunas.map((coluna) => (
                                <td
                                  key={coluna}
                                  className="max-w-[260px] px-4 py-3 text-[#52616b]"
                                >
                                  <p className="line-clamp-3 break-words">
                                    {formatarValorCampo(
                                      tabelaSelecionada,
                                      coluna,
                                      registro[coluna],
                                      dados,
                                    )}
                                  </p>
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  {tabelaSelecionada.permiteEditar ? (
                                    <button
                                      type="button"
                                      onClick={() => editarRegistro(registro)}
                                      className="h-9 rounded-md border border-[#b8b0a3] px-3 text-xs font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                                    >
                                      Editar
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => void excluirRegistro(registro)}
                                    disabled={excluindoChave === chave}
                                    className="h-9 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:text-[#c28b7f]"
                                  >
                                    {excluindoChave === chave
                                      ? "Excluindo..."
                                      : "Excluir"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}
