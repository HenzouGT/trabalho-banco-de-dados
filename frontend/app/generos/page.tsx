"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Genero = {
  id: string;
  nome: string;
};

type GeneroPayload = {
  nome: string;
};

const GENERO_VAZIO = "";

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

function montarPayload(nomeGenero: string): GeneroPayload {
  const nome = nomeGenero.trim();

  if (!nome) {
    throw new Error("Informe o nome do genero.");
  }

  return { nome };
}

export default function GenerosPage() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [nome, setNome] = useState(GENERO_VAZIO);
  const [generoEditandoId, setGeneroEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const generoEditando = useMemo(
    () => generos.find((genero) => genero.id === generoEditandoId) ?? null,
    [generoEditandoId, generos],
  );

  const carregarGeneros = useCallback(async () => {
    setCarregandoLista(true);
    setErro("");

    try {
      const resposta = await fetch("/api/genero", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel carregar generos."),
        );
      }

      const dados = (await resposta.json()) as Genero[];
      setGeneros(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar generos.",
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarGeneros();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarGeneros]);

  function atualizarNome(valor: string) {
    setNome(valor);
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setNome(GENERO_VAZIO);
    setGeneroEditandoId(null);
    setErro("");
    setMensagem("");
  }

  function editarGenero(genero: Genero) {
    setGeneroEditandoId(genero.id);
    setNome(genero.nome);
    setErro("");
    setMensagem("");
  }

  async function salvarGenero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    let payload: GeneroPayload;

    try {
      payload = montarPayload(nome);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados invalidos.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        generoEditandoId ? `/api/genero/${generoEditandoId}` : "/api/genero",
        {
          method: generoEditandoId ? "PATCH" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel salvar o genero."),
        );
      }

      await carregarGeneros();
      setMensagem(
        generoEditandoId
          ? "Genero atualizado com sucesso."
          : "Genero cadastrado com sucesso.",
      );
      setNome(GENERO_VAZIO);
      setGeneroEditandoId(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o genero.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirGenero(genero: Genero) {
    const confirmar = window.confirm(`Excluir o genero "${genero.nome}"?`);

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");
    setExcluindoId(genero.id);

    try {
      const resposta = await fetch(`/api/genero/${genero.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel excluir o genero."),
        );
      }

      if (generoEditandoId === genero.id) {
        setNome(GENERO_VAZIO);
        setGeneroEditandoId(null);
      }

      await carregarGeneros();
      setMensagem("Genero excluido com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o genero.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 border-b border-[#d8d1c5] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
              Cadastro de generos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
              Gerenciar generos
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/filmes"
              className="inline-flex h-11 items-center rounded-md bg-[#23395b] px-5 text-sm font-semibold text-white transition hover:bg-[#172844]"
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
              href="/"
              className="inline-flex h-11 items-center rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Inicio
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <form
            onSubmit={salvarGenero}
            className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-semibold text-[#172026]">
                {generoEditando ? "Editar genero" : "Novo genero"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52616b]">
                Cadastre os generos usados nos filmes.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Nome
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => atualizarNome(event.target.value)}
                  required
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Ex.: Drama"
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
                    : generoEditando
                      ? "Atualizar genero"
                      : "Cadastrar genero"}
                </button>

                {generoEditando ? (
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
                  Generos cadastrados
                </h2>
                <p className="mt-1 text-sm text-[#52616b]">
                  {generos.length} {generos.length === 1 ? "genero" : "generos"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void carregarGeneros()}
                disabled={carregandoLista}
                className="h-10 rounded-md border border-[#b8b0a3] px-4 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2] disabled:cursor-not-allowed disabled:text-[#8a96a8]"
              >
                {carregandoLista ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-[#e4ded4]">
              {carregandoLista ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Carregando generos...
                </p>
              ) : generos.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#52616b]">
                  Nenhum genero cadastrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-[#f8f6f2] text-xs uppercase text-[#52616b]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Nome</th>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {generos.map((genero) => (
                        <tr
                          key={genero.id}
                          className="border-t border-[#e4ded4]"
                        >
                          <td className="px-4 py-3 font-semibold text-[#172026]">
                            {genero.nome}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#52616b]">
                            {genero.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editarGenero(genero)}
                                className="h-9 rounded-md border border-[#b8b0a3] px-3 text-xs font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-[#f8f6f2]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void excluirGenero(genero)}
                                disabled={excluindoId === genero.id}
                                className="h-9 rounded-md border border-[#d69a8b] px-3 text-xs font-semibold text-[#9d3018] transition hover:border-[#9d3018] hover:bg-[#fff4f0] disabled:cursor-not-allowed disabled:text-[#c28b7f]"
                              >
                                {excluindoId === genero.id
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
