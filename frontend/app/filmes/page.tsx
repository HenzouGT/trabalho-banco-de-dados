"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Filme = {
  id: string;
  titulo: string;
  tipo_obra: string;
  ano?: number | null;
  duracao?: number | null;
  poster?: string | null;
};

type Artista = {
  id: string;
  nome: string;
  biografia?: string | null;
  foto?: string | null;
};

type Genero = {
  id: string;
  nome: string;
};

type FuncaoArtista =
  | "Diretor"
  | "Ator"
  | "Roteirista"
  | "Produtor"
  | "Diretor de Fotografia"
  | "Trilha Sonora";

type ObraArtista = {
  id_obra: string;
  id_artista: string;
  funcao: FuncaoArtista;
};

type ObraGenero = {
  id_obra: string;
  id_genero: string;
};

type ArtistaDoFilme = {
  id_artista: string;
  funcao: FuncaoArtista;
};

type FilmePayload = {
  titulo: string;
  tipo_obra: "Filme";
  ano?: number;
  duracao?: number;
  poster?: string;
};

type FilmeForm = {
  titulo: string;
  ano: string;
  duracao: string;
  poster: string;
  artistas: ArtistaDoFilme[];
  generos: string[];
};

const FILME_VAZIO: FilmeForm = {
  titulo: "",
  ano: "",
  duracao: "",
  poster: "",
  artistas: [],
  generos: [],
};

const FUNCOES_ARTISTA: FuncaoArtista[] = [
  "Diretor",
  "Ator",
  "Roteirista",
  "Produtor",
  "Diretor de Fotografia",
  "Trilha Sonora",
];

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

function montarPayload(formulario: FilmeForm): FilmePayload {
  const titulo = formulario.titulo.trim();
  const ano = formulario.ano ? Number(formulario.ano) : undefined;
  const duracao = formulario.duracao ? Number(formulario.duracao) : undefined;
  const poster = formulario.poster.trim();

  if (!titulo) {
    throw new Error("Informe o titulo do filme.");
  }

  if (ano !== undefined && !Number.isInteger(ano)) {
    throw new Error("Informe um ano valido.");
  }

  if (duracao !== undefined && !Number.isInteger(duracao)) {
    throw new Error("Informe a duracao em minutos.");
  }

  return {
    titulo,
    tipo_obra: "Filme",
    ...(ano !== undefined ? { ano } : {}),
    ...(duracao !== undefined ? { duracao } : {}),
    ...(poster ? { poster } : {}),
  };
}

function formatarDetalhes(filme: Filme) {
  const detalhes = [];

  if (filme.ano) {
    detalhes.push(String(filme.ano));
  }

  if (filme.duracao) {
    detalhes.push(`${filme.duracao} min`);
  }

  return detalhes.length ? detalhes.join(" / ") : "Sem ano ou duracao";
}

function chaveObraArtista(relacao: ArtistaDoFilme | ObraArtista) {
  return `${relacao.id_artista}::${relacao.funcao}`;
}

function montarUrlObraArtista(
  idObra: string,
  idArtista: string,
  funcao: FuncaoArtista,
) {
  return `/api/obra_artista/${encodeURIComponent(idObra)}/${encodeURIComponent(
    idArtista,
  )}/${encodeURIComponent(funcao)}`;
}

function montarUrlObraGenero(idObra: string, idGenero: string) {
  return `/api/obra_genero/${encodeURIComponent(idObra)}/${encodeURIComponent(
    idGenero,
  )}`;
}

export default function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [relacoesObraArtista, setRelacoesObraArtista] = useState<ObraArtista[]>(
    [],
  );
  const [relacoesObraGenero, setRelacoesObraGenero] = useState<ObraGenero[]>(
    [],
  );
  const [formulario, setFormulario] = useState<FilmeForm>(FILME_VAZIO);
  const [artistaSelecionadoId, setArtistaSelecionadoId] = useState("");
  const [funcaoSelecionada, setFuncaoSelecionada] =
    useState<FuncaoArtista>("Diretor");
  const [generoSelecionadoId, setGeneroSelecionadoId] = useState("");
  const [filmeEditandoId, setFilmeEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const filmeEditando = useMemo(
    () => filmes.find((filme) => filme.id === filmeEditandoId) ?? null,
    [filmeEditandoId, filmes],
  );

  const carregarFilmes = useCallback(async () => {
    setCarregandoLista(true);
    setErro("");

    try {
      const [
        obrasResposta,
        artistasResposta,
        generosResposta,
        relacoesArtistaResposta,
        relacoesGeneroResposta,
      ] = await Promise.all([
        fetch("/api/obra", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch("/api/artista", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch("/api/genero", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch("/api/obra_artista", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch("/api/obra_genero", {
          headers: {
            Accept: "application/json",
          },
        }),
      ]);

      if (!obrasResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            obrasResposta,
            "Nao foi possivel carregar filmes.",
          ),
        );
      }

      if (!artistasResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            artistasResposta,
            "Nao foi possivel carregar artistas.",
          ),
        );
      }

      if (!generosResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            generosResposta,
            "Nao foi possivel carregar generos.",
          ),
        );
      }

      if (!relacoesArtistaResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            relacoesArtistaResposta,
            "Nao foi possivel carregar artistas dos filmes.",
          ),
        );
      }

      if (!relacoesGeneroResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            relacoesGeneroResposta,
            "Nao foi possivel carregar generos dos filmes.",
          ),
        );
      }

      const obras = (await obrasResposta.json()) as Filme[];
      const artistasCarregados = (await artistasResposta.json()) as Artista[];
      const generosCarregados = (await generosResposta.json()) as Genero[];
      const relacoesArtista =
        (await relacoesArtistaResposta.json()) as ObraArtista[];
      const relacoesGenero =
        (await relacoesGeneroResposta.json()) as ObraGenero[];

      setFilmes(obras.filter((obra) => obra.tipo_obra === "Filme"));
      setArtistas(artistasCarregados);
      setGeneros(generosCarregados);
      setRelacoesObraArtista(relacoesArtista);
      setRelacoesObraGenero(relacoesGenero);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar filmes.",
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarFilmes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarFilmes]);

  function atualizarCampo(campo: keyof FilmeForm, valor: string) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setFormulario(FILME_VAZIO);
    setFilmeEditandoId(null);
    setArtistaSelecionadoId("");
    setFuncaoSelecionada("Diretor");
    setGeneroSelecionadoId("");
  }

  function editarFilme(filme: Filme) {
    const artistasDoFilme = relacoesObraArtista
      .filter((relacao) => relacao.id_obra === filme.id)
      .map((relacao) => ({
        id_artista: relacao.id_artista,
        funcao: relacao.funcao,
      }));
    const generosDoFilme = relacoesObraGenero
      .filter((relacao) => relacao.id_obra === filme.id)
      .map((relacao) => relacao.id_genero);

    setFilmeEditandoId(filme.id);
    setFormulario({
      titulo: filme.titulo,
      ano: filme.ano ? String(filme.ano) : "",
      duracao: filme.duracao ? String(filme.duracao) : "",
      poster: filme.poster ?? "",
      artistas: artistasDoFilme,
      generos: generosDoFilme,
    });
    setArtistaSelecionadoId("");
    setFuncaoSelecionada("Diretor");
    setGeneroSelecionadoId("");
    setErro("");
    setMensagem("");
  }

  function obterNomeArtista(idArtista: string) {
    return (
      artistas.find((artista) => artista.id === idArtista)?.nome ??
      "Artista nao encontrado"
    );
  }

  function obterArtistasDoFilme(idObra: string) {
    return relacoesObraArtista
      .filter((relacao) => relacao.id_obra === idObra)
      .map((relacao) => ({
        ...relacao,
        nome: obterNomeArtista(relacao.id_artista),
      }));
  }

  function obterNomeGenero(idGenero: string) {
    return (
      generos.find((genero) => genero.id === idGenero)?.nome ??
      "Genero nao encontrado"
    );
  }

  function obterGenerosDoFilme(idObra: string) {
    return relacoesObraGenero
      .filter((relacao) => relacao.id_obra === idObra)
      .map((relacao) => ({
        ...relacao,
        nome: obterNomeGenero(relacao.id_genero),
      }));
  }

  function adicionarArtistaAoFormulario() {
    setErro("");
    setMensagem("");

    if (!artistaSelecionadoId) {
      setErro("Selecione um artista para adicionar ao filme.");
      return;
    }

    const novaRelacao: ArtistaDoFilme = {
      id_artista: artistaSelecionadoId,
      funcao: funcaoSelecionada,
    };

    const jaExiste = formulario.artistas.some(
      (relacao) => chaveObraArtista(relacao) === chaveObraArtista(novaRelacao),
    );

    if (jaExiste) {
      setErro("Este artista ja foi adicionado com essa funcao.");
      return;
    }

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      artistas: [...formularioAtual.artistas, novaRelacao],
    }));
    setArtistaSelecionadoId("");
    setFuncaoSelecionada("Diretor");
  }

  function removerArtistaDoFormulario(relacaoRemovida: ArtistaDoFilme) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      artistas: formularioAtual.artistas.filter(
        (relacao) =>
          chaveObraArtista(relacao) !== chaveObraArtista(relacaoRemovida),
      ),
    }));
    setErro("");
    setMensagem("");
  }

  function adicionarGeneroAoFormulario() {
    setErro("");
    setMensagem("");

    if (!generoSelecionadoId) {
      setErro("Selecione um genero para adicionar ao filme.");
      return;
    }

    if (formulario.generos.includes(generoSelecionadoId)) {
      setErro("Este genero ja foi adicionado ao filme.");
      return;
    }

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      generos: [...formularioAtual.generos, generoSelecionadoId],
    }));
    setGeneroSelecionadoId("");
  }

  function removerGeneroDoFormulario(idGenero: string) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      generos: formularioAtual.generos.filter((genero) => genero !== idGenero),
    }));
    setErro("");
    setMensagem("");
  }

  async function sincronizarArtistasDoFilme(
    idObra: string,
    artistasDoFormulario: ArtistaDoFilme[],
  ) {
    const relacoesAtuais = relacoesObraArtista.filter(
      (relacao) => relacao.id_obra === idObra,
    );
    const chavesDesejadas = new Set(
      artistasDoFormulario.map((relacao) => chaveObraArtista(relacao)),
    );
    const chavesAtuais = new Set(
      relacoesAtuais.map((relacao) => chaveObraArtista(relacao)),
    );

    const relacoesParaCriar = artistasDoFormulario.filter(
      (relacao) => !chavesAtuais.has(chaveObraArtista(relacao)),
    );
    const relacoesParaRemover = relacoesAtuais.filter(
      (relacao) => !chavesDesejadas.has(chaveObraArtista(relacao)),
    );

    const respostas = await Promise.all([
      ...relacoesParaCriar.map((relacao) =>
        fetch("/api/obra_artista", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_obra: idObra,
            id_artista: relacao.id_artista,
            funcao: relacao.funcao,
          }),
        }),
      ),
      ...relacoesParaRemover.map((relacao) =>
        fetch(
          montarUrlObraArtista(idObra, relacao.id_artista, relacao.funcao),
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          },
        ),
      ),
    ]);

    const respostaComErro = respostas.find((resposta) => !resposta.ok);

    if (respostaComErro) {
      throw new Error(
        await lerMensagemErro(
          respostaComErro,
          "Nao foi possivel salvar os artistas do filme.",
        ),
      );
    }
  }

  async function sincronizarGenerosDoFilme(
    idObra: string,
    generosDoFormulario: string[],
  ) {
    const relacoesAtuais = relacoesObraGenero.filter(
      (relacao) => relacao.id_obra === idObra,
    );
    const generosDesejados = new Set(generosDoFormulario);
    const generosAtuais = new Set(
      relacoesAtuais.map((relacao) => relacao.id_genero),
    );

    const generosParaCriar = generosDoFormulario.filter(
      (idGenero) => !generosAtuais.has(idGenero),
    );
    const relacoesParaRemover = relacoesAtuais.filter(
      (relacao) => !generosDesejados.has(relacao.id_genero),
    );

    const respostas = await Promise.all([
      ...generosParaCriar.map((idGenero) =>
        fetch("/api/obra_genero", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_obra: idObra,
            id_genero: idGenero,
          }),
        }),
      ),
      ...relacoesParaRemover.map((relacao) =>
        fetch(montarUrlObraGenero(idObra, relacao.id_genero), {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }),
      ),
    ]);

    const respostaComErro = respostas.find((resposta) => !resposta.ok);

    if (respostaComErro) {
      throw new Error(
        await lerMensagemErro(
          respostaComErro,
          "Nao foi possivel salvar os generos do filme.",
        ),
      );
    }
  }

  async function salvarFilme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    let payload: FilmePayload;

    try {
      payload = montarPayload(formulario);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados invalidos.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        filmeEditandoId ? `/api/obra/${filmeEditandoId}` : "/api/obra",
        {
          method: filmeEditandoId ? "PATCH" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel salvar o filme."),
        );
      }

      const filmeSalvo = (await resposta.json()) as Filme;
      await sincronizarArtistasDoFilme(filmeSalvo.id, formulario.artistas);
      await sincronizarGenerosDoFilme(filmeSalvo.id, formulario.generos);
      await carregarFilmes();
      setMensagem(
        filmeEditandoId
          ? "Filme atualizado com sucesso."
          : "Filme cadastrado com sucesso.",
      );
      limparFormulario();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o filme.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirFilme(filme: Filme) {
    const confirmar = window.confirm(`Excluir o filme "${filme.titulo}"?`);

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindoId(filme.id);

    try {
      const resposta = await fetch(`/api/obra/${filme.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel excluir o filme."),
        );
      }

      if (filmeEditandoId === filme.id) {
        limparFormulario();
      }

      await carregarFilmes();
      setMensagem("Filme excluido com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o filme.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-[#d8d1c5] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
              Cadastro de filmes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Gerenciar filmes
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/avaliacoes"
              className="inline-flex h-11 items-center rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844]"
            >
              Avaliar filmes
            </Link>
            <Link
              href="/artistas"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Artistas
            </Link>
            <Link
              href="/generos"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Generos
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Voltar
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={salvarFilme}
            className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#172026]">
                {filmeEditando ? "Editar filme" : "Novo filme"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52616b]">
                O backend recebera este registro como uma obra do tipo Filme.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Titulo
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(event) =>
                    atualizarCampo("titulo", event.target.value)
                  }
                  required
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Ex.: Central do Brasil"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                  Ano
                  <input
                    type="number"
                    value={formulario.ano}
                    onChange={(event) =>
                      atualizarCampo("ano", event.target.value)
                    }
                    min="1888"
                    max="2100"
                    className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                    placeholder="1998"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                  Duracao
                  <input
                    type="number"
                    value={formulario.duracao}
                    onChange={(event) =>
                      atualizarCampo("duracao", event.target.value)
                    }
                    min="1"
                    className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                    placeholder="Minutos"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Poster
                <input
                  type="url"
                  value={formulario.poster}
                  onChange={(event) =>
                    atualizarCampo("poster", event.target.value)
                  }
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="https://example.com/poster.jpg"
                />
              </label>

              <section className="rounded-md border border-[#e4ded4] bg-[#f8f6f2] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#172026]">
                    Artistas do filme
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#52616b]">
                    Adicione um artista cadastrado e informe sua funcao na obra.
                  </p>
                </div>

                {artistas.length === 0 ? (
                  <div className="mt-4 rounded-md border border-[#d8d1c5] bg-white px-3 py-3 text-sm text-[#52616b]">
                    Nenhum artista cadastrado.{" "}
                    <Link
                      href="/artistas"
                      className="font-semibold text-[#23395b] underline-offset-2 hover:underline"
                    >
                      Cadastrar artista
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                      Artista
                      <select
                        value={artistaSelecionadoId}
                        onChange={(event) =>
                          setArtistaSelecionadoId(event.target.value)
                        }
                        className="h-11 w-60 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                      >
                        <option value="">Selecione um artista</option>
                        {artistas.map((artista) => (
                          <option key={artista.id} value={artista.id}>
                            {artista.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                        Funcao
                        <select
                          value={funcaoSelecionada}
                          onChange={(event) =>
                            setFuncaoSelecionada(
                              event.target.value as FuncaoArtista,
                            )
                          }
                          className="h-11 w-60 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                        >
                          {FUNCOES_ARTISTA.map((funcao) => (
                            <option key={funcao} value={funcao}>
                              {funcao}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={adicionarArtistaAoFormulario}
                      className="w-60 self-end rounded-md bg-[#23395b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172844]"
                    >
                      Adicionar
                    </button>
                  </div>
                )}

                {formulario.artistas.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-2">
                    {formulario.artistas.map((relacao) => (
                      <div
                        key={chaveObraArtista(relacao)}
                        className="flex items-center justify-between gap-3 rounded-md border border-[#d8d1c5] bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172026]">
                            {obterNomeArtista(relacao.id_artista)}
                          </p>
                          <p className="text-xs text-[#52616b]">
                            {relacao.funcao}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArtistaDoFormulario(relacao)}
                          className="h-8 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#52616b]">
                    Nenhum artista adicionado a este filme.
                  </p>
                )}
              </section>

              <section className="rounded-md border border-[#e4ded4] bg-[#f8f6f2] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#172026]">
                    Generos do filme
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#52616b]">
                    Adicione um ou mais generos cadastrados ao filme.
                  </p>
                </div>

                {generos.length === 0 ? (
                  <div className="mt-4 rounded-md border border-[#d8d1c5] bg-white px-3 py-3 text-sm text-[#52616b]">
                    Nenhum genero cadastrado.{" "}
                    <Link
                      href="/generos"
                      className="font-semibold text-[#23395b] underline-offset-2 hover:underline"
                    >
                      Cadastrar genero
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                      Genero
                      <select
                        value={generoSelecionadoId}
                        onChange={(event) =>
                          setGeneroSelecionadoId(event.target.value)
                        }
                        className="h-11 w-60 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                      >
                        <option value="">Selecione um genero</option>
                        {generos.map((genero) => (
                          <option key={genero.id} value={genero.id}>
                            {genero.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                    <br />
                    <button
                      type="button"
                      onClick={adicionarGeneroAoFormulario}
                      className="w-60 self-end rounded-md bg-[#23395b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172844]"
                    >
                      Adicionar
                    </button>
                  </div>
                )}

                {formulario.generos.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formulario.generos.map((idGenero) => (
                      <div
                        key={idGenero}
                        className="flex items-center gap-2 rounded-md border border-[#d8d1c5] bg-white px-3 py-2"
                      >
                        <span className="text-sm font-semibold text-[#172026]">
                          {obterNomeGenero(idGenero)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removerGeneroDoFormulario(idGenero)}
                          className="text-xs font-semibold text-[#9d3018] transition hover:text-[#6f1f11]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#52616b]">
                    Nenhum genero adicionado a este filme.
                  </p>
                )}
              </section>

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
                  disabled={salvando}
                  className="h-11 rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844] disabled:cursor-not-allowed disabled:bg-[#8a96a8]"
                >
                  {salvando
                    ? "Salvando..."
                    : filmeEditando
                      ? "Atualizar filme"
                      : "Cadastrar filme"}
                </button>

                {filmeEditando ? (
                  <button
                    type="button"
                    onClick={limparFormulario}
                    disabled={salvando}
                    className="h-11 rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <section className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#172026]">
                  Filmes cadastrados
                </h2>
                <p className="mt-1 text-sm text-[#52616b]">
                  {filmes.length} {filmes.length === 1 ? "filme" : "filmes"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void carregarFilmes()}
                disabled={carregandoLista}
                className="h-10 rounded-md border border-[#b8b0a3] px-4 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:text-[#8a96a8]"
              >
                {carregandoLista ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-[#e4ded4]">
              {carregandoLista ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Carregando filmes...
                </p>
              ) : filmes.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Nenhum filme cadastrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead className="bg-[#f8f6f2] text-xs uppercase text-[#52616b]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Titulo</th>
                        <th className="px-4 py-3 font-semibold">Detalhes</th>
                        <th className="px-4 py-3 font-semibold">Generos</th>
                        <th className="px-4 py-3 font-semibold">Artistas</th>
                        <th className="px-4 py-3 font-semibold">Poster</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filmes.map((filme) => (
                        <tr
                          key={filme.id}
                          className="border-t border-[#e4ded4] align-top"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#172026]">
                              {filme.titulo}
                            </p>
                            <p className="mt-1 text-xs text-[#52616b]">
                              ID: {filme.id}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-[#52616b]">
                            {formatarDetalhes(filme)}
                          </td>
                          <td className="max-w-[220px] px-4 py-3 text-[#52616b]">
                            {obterGenerosDoFilme(filme.id).length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {obterGenerosDoFilme(filme.id).map(
                                  (relacao) => (
                                    <span
                                      key={relacao.id_genero}
                                      className="rounded-md bg-[#f8f6f2] px-2 py-1 text-xs font-semibold text-[#172026]"
                                    >
                                      {relacao.nome}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              "Sem generos"
                            )}
                          </td>
                          <td className="max-w-[260px] px-4 py-3 text-[#52616b]">
                            {obterArtistasDoFilme(filme.id).length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {obterArtistasDoFilme(filme.id).map(
                                  (relacao) => (
                                    <p
                                      key={chaveObraArtista(relacao)}
                                      className="truncate"
                                    >
                                      <span className="font-semibold text-[#172026]">
                                        {relacao.nome}
                                      </span>{" "}
                                      <span className="text-xs">
                                        ({relacao.funcao})
                                      </span>
                                    </p>
                                  ),
                                )}
                              </div>
                            ) : (
                              "Sem artistas"
                            )}
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-[#52616b]">
                            {filme.poster || "Sem poster"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editarFilme(filme)}
                                className="h-9 rounded-md border border-[#b8b0a3] px-3 text-xs font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void excluirFilme(filme)}
                                disabled={excluindoId === filme.id}
                                className="h-9 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:text-[#c28b7f]"
                              >
                                {excluindoId === filme.id
                                  ? "Excluindo..."
                                  : "Excluir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
