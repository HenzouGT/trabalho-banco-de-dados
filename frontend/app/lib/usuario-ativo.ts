export type FuncaoUsuario = "ADMIN" | "CLIENTE";

export type UsuarioAtivo = {
  id: string;
  nome: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
  funcao?: FuncaoUsuario | null;
};

const STORAGE_KEY = "usuarioAtivo";
const STORAGE_EVENT = "usuarioAtivoChange";

let usuarioAtivoCache: UsuarioAtivo | null = null;
let usuarioAtivoCacheString: string | null = null;

export function lerUsuarioAtivo() {
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

export function observarUsuarioAtivo(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

export function usuarioEhAdmin(usuario: UsuarioAtivo | null) {
  return usuario?.funcao === "ADMIN";
}

export function montarHeadersJson(usuario?: UsuarioAtivo | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (usuario?.id) {
    headers["x-usuario-id"] = usuario.id;
  }

  return headers;
}
