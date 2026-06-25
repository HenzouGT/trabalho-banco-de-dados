"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Artista = {
  id: string;
  nome: string;
  biografia?: string | null;
  foto?: string | null;
};

type ArtistaPayload = {
  nome: string;
  biografia?: string;
  foto?: string;
};

type ArtistaForm = {
  nome: string;
  biografia: string;
  foto: string;
};

const ARTISTA_VAZIO: ArtistaForm = {
  nome: "",
  biografia: "",
  foto: "",
};

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

function montarPayload(formulario: ArtistaForm): ArtistaPayload {
  const nome = formulario.nome.trim();
  const biografia = formulario.biografia.trim();
  const foto = formulario.foto.trim();

  if (!nome) {
    throw new Error("Informe o nome do artista.");
  }

  return {
    nome,
    ...(biografia ? { biografia } : {}),
    ...(foto ? { foto } : {}),
  };
}

function obterIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default function ArtistasPage() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [formulario, setFormulario] = useState<ArtistaForm>(ARTISTA_VAZIO);
  const [artistaEditandoId, setArtistaEditandoId] = useState<string | null>(
    null,
  );
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const artistaEditando = useMemo(
    () =>
      artistas.find((artista) => artista.id === artistaEditandoId) ?? null,
    [artistaEditandoId, artistas],
  );

  const carregarArtistas = useCallback(async () => {
    setCarregandoLista(true);
    setErro("");

    try {
      const resposta = await fetch("/api/artista", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(
            resposta,
            "Nao foi possivel carregar artistas.",
          ),
        );
      }

      const dados = (await resposta.json()) as Artista[];
      setArtistas(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar artistas.",
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarArtistas();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarArtistas]);

  function atualizarCampo(campo: keyof ArtistaForm, valor: string) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setFormulario(ARTISTA_VAZIO);
    setArtistaEditandoId(null);
    setErro("");
    setMensagem("");
  }

  function editarArtista(artista: Artista) {
    setArtistaEditandoId(artista.id);
    setFormulario({
      nome: artista.nome,
      biografia: artista.biografia ?? "",
      foto: artista.foto ?? "",
    });
    setErro("");
    setMensagem("");
  }

  async function salvarArtista(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    let payload: ArtistaPayload;

    try {
      payload = montarPayload(formulario);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados invalidos.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        artistaEditandoId
          ? `/api/artista/${artistaEditandoId}`
          : "/api/artista",
        {
          method: artistaEditandoId ? "PATCH" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel salvar o artista."),
        );
      }

      await carregarArtistas();
      setMensagem(
        artistaEditandoId
          ? "Artista atualizado com sucesso."
          : "Artista cadastrado com sucesso.",
      );
      setFormulario(ARTISTA_VAZIO);
      setArtistaEditandoId(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o artista.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirArtista(artista: Artista) {
    const confirmar = window.confirm(`Excluir o artista "${artista.nome}"?`);

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindoId(artista.id);

    try {
      const resposta = await fetch(`/api/artista/${artista.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(
            resposta,
            "Nao foi possivel excluir o artista.",
          ),
        );
      }

      if (artistaEditandoId === artista.id) {
        setFormulario(ARTISTA_VAZIO);
        setArtistaEditandoId(null);
      }

      await carregarArtistas();
      setMensagem("Artista excluido com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o artista.",
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
              Cadastro de artistas
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Gerenciar artistas
            </h1>
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
            onSubmit={salvarArtista}
            className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#172026]">
                {artistaEditando ? "Editar artista" : "Novo artista"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52616b]">
                Informe os dados basicos do artista conforme o backend.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Nome
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    atualizarCampo("nome", event.target.value)
                  }
                  required
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Ex.: Fernanda Montenegro"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Foto
                <input
                  type="url"
                  value={formulario.foto}
                  onChange={(event) =>
                    atualizarCampo("foto", event.target.value)
                  }
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="https://example.com/foto.jpg"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Biografia
                <textarea
                  value={formulario.biografia}
                  onChange={(event) =>
                    atualizarCampo("biografia", event.target.value)
                  }
                  rows={5}
                  className="resize-none rounded-md border border-[#c9c0b4] bg-white px-3 py-2 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Biografia opcional"
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
                  disabled={salvando}
                  className="h-11 rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844] disabled:cursor-not-allowed disabled:bg-[#8a96a8]"
                >
                  {salvando
                    ? "Salvando..."
                    : artistaEditando
                      ? "Atualizar artista"
                      : "Cadastrar artista"}
                </button>

                {artistaEditando ? (
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
                  Artistas cadastrados
                </h2>
                <p className="mt-1 text-sm text-[#52616b]">
                  {artistas.length}{" "}
                  {artistas.length === 1 ? "artista" : "artistas"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void carregarArtistas()}
                disabled={carregandoLista}
                className="h-10 rounded-md border border-[#b8b0a3] px-4 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:text-[#8a96a8]"
              >
                {carregandoLista ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-[#e4ded4]">
              {carregandoLista ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Carregando artistas...
                </p>
              ) : artistas.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Nenhum artista cadastrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead className="bg-[#f8f6f2] text-xs uppercase text-[#52616b]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Artista</th>
                        <th className="px-4 py-3 font-semibold">Biografia</th>
                        <th className="px-4 py-3 font-semibold">Foto</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {artistas.map((artista) => (
                        <tr
                          key={artista.id}
                          className="border-t border-[#e4ded4] align-top"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#23395b] text-sm font-semibold text-white">
                                {obterIniciais(artista.nome) || "A"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[#172026]">
                                  {artista.nome}
                                </p>
                                <p className="mt-1 text-xs text-[#52616b]">
                                  ID: {artista.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[280px] px-4 py-3 text-[#52616b]">
                            <p className="line-clamp-3">
                              {artista.biografia || "Sem biografia"}
                            </p>
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-[#52616b]">
                            {artista.foto || "Sem foto"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editarArtista(artista)}
                                className="h-9 rounded-md border border-[#b8b0a3] px-3 text-xs font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void excluirArtista(artista)}
                                disabled={excluindoId === artista.id}
                                className="h-9 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:text-[#c28b7f]"
                              >
                                {excluindoId === artista.id
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
