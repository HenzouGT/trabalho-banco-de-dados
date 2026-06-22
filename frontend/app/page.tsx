"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
};

type UsuarioAtivo = Usuario;
type ModoAcesso = "login" | "cadastro";
type CreateUsuarioPayload = {
  nome: string;
  email: string;
  senha: string;
  bio?: string;
};
type LoginUsuarioPayload = {
  email: string;
  senha: string;
};

const STORAGE_KEY = "usuarioAtivo";
const STORAGE_EVENT = "usuarioAtivoChange";

let usuarioAtivoCache: UsuarioAtivo | null = null;
let usuarioAtivoCacheString: string | null = null;

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
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

function emitirMudancaUsuarioAtivo() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function salvarUsuarioAtivo(usuario: UsuarioAtivo) {
  const usuarioSerializado = JSON.stringify(usuario);

  window.localStorage.setItem(STORAGE_KEY, usuarioSerializado);
  usuarioAtivoCache = usuario;
  usuarioAtivoCacheString = usuarioSerializado;
  emitirMudancaUsuarioAtivo();
}

export default function Home() {
  const [modoAcesso, setModoAcesso] = useState<ModoAcesso>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");
  const [cadastroConfirmacao, setCadastroConfirmacao] = useState("");
  const [cadastroBio, setCadastroBio] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const usuarioAtivo = useSyncExternalStore(
    observarUsuarioAtivo,
    lerUsuarioAtivo,
    () => null,
  );
  const cadastroAtivo = modoAcesso === "cadastro";

  const iniciais = useMemo(() => {
    if (!usuarioAtivo?.nome) {
      return "U";
    }

    return usuarioAtivo.nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("");
  }, [usuarioAtivo]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const payload: LoginUsuarioPayload = {
        email: normalizarEmail(email),
        senha,
      };

      const resposta = await fetch("/api/usuario/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel realizar o login."),
        );
      }

      const usuario = (await resposta.json()) as Usuario;
      salvarUsuarioAtivo(usuario);
      setEmail("");
      setSenha("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel realizar o login.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const nome = cadastroNome.trim();
    const emailNormalizado = normalizarEmail(cadastroEmail);
    const bio = cadastroBio.trim();

    if (!nome || !emailNormalizado || !cadastroSenha) {
      setErro("Preencha nome, email e senha para criar o usuario.");
      return;
    }

    if (cadastroSenha !== cadastroConfirmacao) {
      setErro("A senha e a confirmacao precisam ser iguais.");
      return;
    }

    setCarregando(true);

    try {
      const payload: CreateUsuarioPayload = {
        nome,
        email: emailNormalizado,
        senha: cadastroSenha,
      };

      if (bio) {
        payload.bio = bio;
      }

      const resposta = await fetch("/api/usuario", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        throw new Error(
          await lerMensagemErro(resposta, "Nao foi possivel criar o usuario."),
        );
      }

      const usuarioCriado = (await resposta.json()) as Usuario;
      salvarUsuarioAtivo(usuarioCriado);
      setCadastroNome("");
      setCadastroEmail("");
      setCadastroSenha("");
      setCadastroConfirmacao("");
      setCadastroBio("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o usuario.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function alternarModoAcesso(modo: ModoAcesso) {
    setModoAcesso(modo);
    setErro("");
  }

  function handleSair() {
    window.localStorage.removeItem(STORAGE_KEY);
    usuarioAtivoCache = null;
    usuarioAtivoCacheString = null;
    emitirMudancaUsuarioAtivo();
    setErro("");
  }

  if (usuarioAtivo) {
    return (
      <main className="min-h-screen bg-[#f5f3ef] px-6 py-8 text-[#1f2933]">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <header className="flex flex-col justify-between gap-4 border-b border-[#d8d1c5] pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-[#6d7d3f]">
                Sessao ativa
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172026]">
                Bem-vindo, {usuarioAtivo.nome}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleSair}
              className="h-11 rounded-md border border-[#b8b0a3] px-5 text-sm font-semibold text-[#172026] transition hover:border-[#172026] hover:bg-white"
            >
              Sair
            </button>
          </header>

          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {usuarioAtivo.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={usuarioAtivo.avatar}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#23395b] text-xl font-semibold text-white">
                    {iniciais}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">
                    {usuarioAtivo.nome}
                  </p>
                  <p className="truncate text-sm text-[#52616b]">
                    {usuarioAtivo.email}
                  </p>
                </div>
              </div>

              {usuarioAtivo.bio ? (
                <p className="mt-5 text-sm leading-6 text-[#52616b]">
                  {usuarioAtivo.bio}
                </p>
              ) : (
                <p className="mt-5 text-sm leading-6 text-[#52616b]">
                  Este usuario ainda nao possui bio cadastrada.
                </p>
              )}
            </aside>

            <section className="rounded-lg border border-[#d8d1c5] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#172026]">
                Area inicial
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52616b]">
                O usuario ativo ja esta salvo no navegador. As proximas telas de
                filmes, usuarios e avaliacoes podem reutilizar esta sessao local.
              </p>
            </section>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ef] px-6 py-10 text-[#1f2933]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[#d8d1c5] bg-white shadow-sm lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-[520px] flex-col justify-between bg-[#23395b] p-8 text-white sm:p-10">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f3c969]">
              Trabalho Banco de Dados
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-normal">
              {cadastroAtivo
                ? "Crie seu usuario para comecar no catalogo"
                : "Entre para gerenciar seu catalogo de filmes"}
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#dce4ef]">
            {cadastroAtivo
              ? "O cadastro cria um usuario no backend e inicia a sessao local automaticamente."
              : "Esta etapa usa o cadastro de usuarios ja existente no backend e guarda apenas o usuario ativo localmente."}
          </p>
        </div>

        <form
          onSubmit={cadastroAtivo ? handleCriarUsuario : handleLogin}
          className="flex flex-col gap-5 p-8 sm:p-10"
        >
          <div>
            <h2 className="text-2xl font-semibold text-[#172026]">
              {cadastroAtivo ? "Criar usuario" : "Login"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#52616b]">
              {cadastroAtivo
                ? "Preencha os dados basicos do usuario."
                : "Informe email e senha cadastrados na tabela de usuarios."}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-md border border-[#c9c0b4] bg-[#f8f6f2] p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => alternarModoAcesso("login")}
              disabled={carregando}
              className={`h-10 rounded-[4px] transition ${
                !cadastroAtivo
                  ? "bg-white text-[#172026] shadow-sm"
                  : "text-[#52616b] hover:text-[#172026]"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => alternarModoAcesso("cadastro")}
              disabled={carregando}
              className={`h-10 rounded-[4px] transition ${
                cadastroAtivo
                  ? "bg-white text-[#172026] shadow-sm"
                  : "text-[#52616b] hover:text-[#172026]"
              }`}
            >
              Criar usuario
            </button>
          </div>

          {cadastroAtivo ? (
            <>
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Nome
                <input
                  type="text"
                  value={cadastroNome}
                  onChange={(event) => setCadastroNome(event.target.value)}
                  required
                  autoComplete="name"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Nome do usuario"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Email
                <input
                  type="email"
                  value={cadastroEmail}
                  onChange={(event) => setCadastroEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="usuario@example.com"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Senha
                <input
                  type="password"
                  value={cadastroSenha}
                  onChange={(event) => setCadastroSenha(event.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Senha"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Confirmar senha
                <input
                  type="password"
                  value={cadastroConfirmacao}
                  onChange={(event) =>
                    setCadastroConfirmacao(event.target.value)
                  }
                  required
                  autoComplete="new-password"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Repita a senha"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Bio
                <textarea
                  value={cadastroBio}
                  onChange={(event) => setCadastroBio(event.target.value)}
                  rows={4}
                  className="resize-none rounded-md border border-[#c9c0b4] bg-white px-3 py-2 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Bio opcional"
                />
              </label>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="usuario@example.com"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-[#172026]">
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 rounded-md border border-[#c9c0b4] bg-white px-3 text-base outline-none transition focus:border-[#23395b] focus:ring-2 focus:ring-[#23395b]/20"
                  placeholder="Senha"
                />
              </label>
            </>
          )}

          {erro ? (
            <p className="rounded-md border border-[#f1b8a8] bg-[#fff4f0] px-3 py-2 text-sm text-[#9d3018]">
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 h-11 rounded-md bg-[#23395b] px-4 text-sm font-semibold text-white transition hover:bg-[#172844] disabled:cursor-not-allowed disabled:bg-[#8a96a8]"
          >
            {carregando
              ? cadastroAtivo
                ? "Criando..."
                : "Entrando..."
              : cadastroAtivo
                ? "Criar e entrar"
                : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
