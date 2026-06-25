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

type UsuarioAtivo = {
  id: string;
  nome: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
};

type Filme = {
  id: string;
  titulo: string;
  tipo_obra: string;
  ano?: number | null;
  duracao?: number | null;
  poster?: string | null;
};

type Avaliacao = {
  id_usuario: string;
  id_obra: string;
  data?: string | null;
  resenha?: string | null;
  nota: number | string;
  reassistido?: boolean | null;
};

type AvaliacaoForm = {
  id_obra: string;
  nota: string;
  data: string;
  resenha: string;
  reassistido: boolean;
};

type CreateAvaliacaoPayload = {
  id_usuario: string;
  id_obra: string;
  nota: number;
  data?: string;
  resenha?: string;
  reassistido?: boolean;
};

type UpdateAvaliacaoPayload = Omit<
  CreateAvaliacaoPayload,
  "id_usuario" | "id_obra"
>;

const STORAGE_KEY = "usuarioAtivo";
const STORAGE_EVENT = "usuarioAtivoChange";
const AVALIACAO_VAZIA: AvaliacaoForm = {
  id_obra: "",
  nota: "",
  data: "",
  resenha: "",
  reassistido: false,
};

let usuarioAtivoCache: UsuarioAtivo | null = null;
let usuarioAtivoCacheString: string | null = null;

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

function lerUsuarioAtivo() {
  if (typeof window === "undefined") {
    return null;
  }

  const usuarioSalvo = window.localStorage.getItem(STORAGE_KEY);

  if (usuarioSalvo === usuarioAtivoCacheString) {
    return usuarioAtivoCache;
  }

  usuarioAtivoCacheString = usuarioSalvo;

  if (!usuarioSalvo) {
    usuarioAtivoCache = null;
    return null;
  }

  try {
    usuarioAtivoCache = JSON.parse(usuarioSalvo) as UsuarioAtivo;
  } catch {
    usuarioAtivoCache = null;
  }

  return usuarioAtivoCache;
}

function observarUsuarioAtivo(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function montarPayload(formulario: AvaliacaoForm) {
  const nota = Number(formulario.nota);
  const resenha = formulario.resenha.trim();

  if (!formulario.id_obra) {
    throw new Error("Selecione um filme.");
  }

  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    throw new Error("Informe uma nota entre 0 e 10.");
  }

  return {
    nota,
    ...(formulario.data ? { data: formulario.data } : {}),
    ...(resenha ? { resenha } : {}),
    reassistido: formulario.reassistido,
  };
}

function formatarNota(nota: number | string) {
  return Number(nota).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

function formatarData(data?: string | null) {
  if (!data) {
    return "Sem data";
  }

  return data.slice(0, 10).split("-").reverse().join("/");
}

export default function AvaliacoesPage() {
  const usuarioAtivo = useSyncExternalStore(
    observarUsuarioAtivo,
    lerUsuarioAtivo,
    () => null,
  );
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [formulario, setFormulario] =
    useState<AvaliacaoForm>(AVALIACAO_VAZIA);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindoObraId, setExcluindoObraId] = useState<string | null>(null);

  const avaliacaoAtual = useMemo(
    () =>
      avaliacoes.find(
        (avaliacao) => avaliacao.id_obra === formulario.id_obra,
      ) ?? null,
    [avaliacoes, formulario.id_obra],
  );

  const filmesAvaliados = useMemo(
    () =>
      avaliacoes
        .map((avaliacao) => ({
          avaliacao,
          filme: filmes.find((filme) => filme.id === avaliacao.id_obra),
        }))
        .filter(
          (item): item is { avaliacao: Avaliacao; filme: Filme } =>
            item.filme !== undefined,
        ),
    [avaliacoes, filmes],
  );

  const carregarDados = useCallback(async () => {
    if (!usuarioAtivo) {
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const [obrasResposta, avaliacoesResposta] = await Promise.all([
        fetch("/api/obra", {
          headers: {
            Accept: "application/json",
          },
        }),
        fetch("/api/avaliacao", {
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

      if (!avaliacoesResposta.ok) {
        throw new Error(
          await lerMensagemErro(
            avaliacoesResposta,
            "Nao foi possivel carregar avaliacoes.",
          ),
        );
      }

      const obras = (await obrasResposta.json()) as Filme[];
      const todasAvaliacoes = (await avaliacoesResposta.json()) as Avaliacao[];

      setFilmes(obras.filter((obra) => obra.tipo_obra === "Filme"));
      setAvaliacoes(
        todasAvaliacoes.filter(
          (avaliacao) => avaliacao.id_usuario === usuarioAtivo.id,
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar a pagina.",
      );
    } finally {
      setCarregando(false);
    }
  }, [usuarioAtivo]);

  useEffect(() => {
    if (!usuarioAtivo) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDados, usuarioAtivo]);

  function atualizarCampo(
    campo: keyof AvaliacaoForm,
    valor: string | boolean,
  ) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
    setErro("");
    setMensagem("");
  }

  function selecionarFilme(idObra: string) {
    const avaliacao = avaliacoes.find(
      (item) => item.id_obra === idObra,
    );

    setFormulario({
      id_obra: idObra,
      nota: avaliacao ? String(avaliacao.nota) : "",
      data: avaliacao?.data ? avaliacao.data.slice(0, 10) : "",
      resenha: avaliacao?.resenha ?? "",
      reassistido: avaliacao?.reassistido ?? false,
    });
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setFormulario(AVALIACAO_VAZIA);
    setErro("");
    setMensagem("");
  }

  async function salvarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usuarioAtivo) {
      setErro("Entre com um usuario antes de avaliar filmes.");
      return;
    }

    setErro("");
    setMensagem("");

    let dados: UpdateAvaliacaoPayload;

    try {
      dados = montarPayload(formulario);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados invalidos.");
      return;
    }

    setSalvando(true);

    try {
      const criando = !avaliacaoAtual;
      const payload: CreateAvaliacaoPayload | UpdateAvaliacaoPayload = criando
        ? {
            id_usuario: usuarioAtivo.id,
            id_obra: formulario.id_obra,
            ...dados,
          }
        : dados;

      const resposta = await fetch(
        criando
          ? "/api/avaliacao"
          : `/api/avaliacao/${usuarioAtivo.id}/${formulario.id_obra}`,
        {
          method: criando ? "POST" : "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(
            resposta,
            "Nao foi possivel salvar a avaliacao.",
          ),
        );
      }

      await carregarDados();
      setMensagem(
        criando
          ? "Avaliacao cadastrada com sucesso."
          : "Avaliacao atualizada com sucesso.",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar a avaliacao.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAvaliacao(avaliacao: Avaliacao) {
    if (!usuarioAtivo) {
      return;
    }

    const filme = filmes.find((item) => item.id === avaliacao.id_obra);
    const confirmar = window.confirm(
      `Excluir a avaliacao de "${filme?.titulo ?? "filme"}"?`,
    );

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindoObraId(avaliacao.id_obra);

    try {
      const resposta = await fetch(
        `/api/avaliacao/${usuarioAtivo.id}/${avaliacao.id_obra}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(
            resposta,
            "Nao foi possivel excluir a avaliacao.",
          ),
        );
      }

      if (formulario.id_obra === avaliacao.id_obra) {
        limparFormulario();
      }

      await carregarDados();
      setMensagem("Avaliacao excluida com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir a avaliacao.",
      );
    } finally {
      setExcluindoObraId(null);
    }
  }

  if (!usuarioAtivo) {
    return (
      <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-lg border border-[#d8d1c5] bg-white p-8 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
              Avaliacoes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Entre para avaliar filmes
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#52616b]">
              A avaliacao precisa do usuario ativo para gravar o par usuario e
              filme no backend.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 w-fit items-center rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844]"
          >
            Ir para login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-[#d8d1c5] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
              Avaliacoes de filmes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Avaliar filme
            </h1>
            <p className="mt-2 text-sm text-[#52616b]">
              Usuario ativo: {usuarioAtivo.nome}
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
              Inicio
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={salvarAvaliacao}
            className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#172026]">
                {avaliacaoAtual ? "Editar avaliacao" : "Nova avaliacao"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52616b]">
                Cada usuario pode manter uma avaliacao por filme.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Filme
                <select
                  value={formulario.id_obra}
                  onChange={(event) => selecionarFilme(event.target.value)}
                  required
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                >
                  <option value="">Selecione um filme</option>
                  {filmes.map((filme) => (
                    <option key={filme.id} value={filme.id}>
                      {filme.titulo}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                  Nota
                  <input
                    type="number"
                    value={formulario.nota}
                    onChange={(event) =>
                      atualizarCampo("nota", event.target.value)
                    }
                    min="0"
                    max="10"
                    step="0.5"
                    required
                    className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                    placeholder="0 a 10"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                  Data
                  <input
                    type="date"
                    value={formulario.data}
                    onChange={(event) =>
                      atualizarCampo("data", event.target.value)
                    }
                    className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-[#172026]">
                <input
                  type="checkbox"
                  checked={formulario.reassistido}
                  onChange={(event) =>
                    atualizarCampo("reassistido", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#23395b]"
                />
                Reassistido
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Resenha
                <textarea
                  value={formulario.resenha}
                  onChange={(event) =>
                    atualizarCampo("resenha", event.target.value)
                  }
                  rows={5}
                  className="resize-none rounded-md border border-[#c9c0b4] bg-white px-3 py-2 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Comentario opcional sobre o filme"
                />
              </label>

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
                  disabled={salvando || carregando}
                  className="h-11 rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844] disabled:cursor-not-allowed disabled:bg-[#8a96a8]"
                >
                  {salvando
                    ? "Salvando..."
                    : avaliacaoAtual
                      ? "Atualizar avaliacao"
                      : "Salvar avaliacao"}
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
                  Minhas avaliacoes
                </h2>
                <p className="mt-1 text-sm text-[#52616b]">
                  {filmesAvaliados.length}{" "}
                  {filmesAvaliados.length === 1 ? "avaliacao" : "avaliacoes"}
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
                  Carregando avaliacoes...
                </p>
              ) : filmes.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Nenhum filme cadastrado para avaliar.
                </p>
              ) : filmesAvaliados.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Voce ainda nao avaliou nenhum filme.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead className="bg-[#f8f6f2] text-xs uppercase text-[#52616b]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Filme</th>
                        <th className="px-4 py-3 font-semibold">Nota</th>
                        <th className="px-4 py-3 font-semibold">Data</th>
                        <th className="px-4 py-3 font-semibold">Resenha</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filmesAvaliados.map(({ avaliacao, filme }) => (
                        <tr
                          key={`${avaliacao.id_usuario}-${avaliacao.id_obra}`}
                          className="border-t border-[#e4ded4] align-top"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#172026]">
                              {filme.titulo}
                            </p>
                            <p className="mt-1 text-xs text-[#52616b]">
                              {avaliacao.reassistido
                                ? "Reassistido"
                                : "Primeira avaliacao"}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#172026]">
                            {formatarNota(avaliacao.nota)}
                          </td>
                          <td className="px-4 py-3 text-[#52616b]">
                            {formatarData(avaliacao.data)}
                          </td>
                          <td className="max-w-[260px] px-4 py-3 text-[#52616b]">
                            <p className="line-clamp-3">
                              {avaliacao.resenha || "Sem resenha"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => selecionarFilme(filme.id)}
                                className="h-9 rounded-md border border-[#b8b0a3] px-3 text-xs font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void excluirAvaliacao(avaliacao)
                                }
                                disabled={excluindoObraId === avaliacao.id_obra}
                                className="h-9 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:text-[#c28b7f]"
                              >
                                {excluindoObraId === avaliacao.id_obra
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
