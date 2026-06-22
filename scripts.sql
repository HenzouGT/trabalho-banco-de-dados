-- ============================================================================
-- 1. TABELAS PRINCIPAIS (ENTIDADES)
-- ============================================================================

CREATE TABLE usuario (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(128) NOT NULL,
    bio TEXT,
    email VARCHAR(128) NOT NULL UNIQUE,
    hash_senha VARCHAR(60) NOT NULL,
    avatar TEXT     -- link para o MinIO
);

CREATE TYPE tipo_obra AS ENUM (
    'Filme', 
    'Série', 
    'Documentário', 
    'Minissérie', 
    'Curta-metragem', 
    'Animação'
);

CREATE TABLE obra (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(128) NOT NULL,
    ano INTEGER, 
    duracao INTEGER, -- em minutos
    poster TEXT,     -- link para o MinIO
    tipo_obra tipo_obra NOT NULL
);

CREATE TABLE artista (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(128) NOT NULL,
    biografia TEXT,
    foto TEXT        -- link para o MinIO
);

CREATE TABLE genero (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================================
-- 2. TABELAS COM DEPENDÊNCIAS DE ENTIDADES (1:N)
-- ============================================================================

CREATE TABLE lista (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(128) NOT NULL,
    descricao TEXT,
    publica BOOLEAN DEFAULT TRUE,
    id_usuario VARCHAR(36) NOT NULL,
    CONSTRAINT fk_lista_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TYPE tipo_arte AS ENUM (
    'Pôster', 
    'Fanart', 
    'Cena', 
    'Bastidores', 
    'Banner', 
    'Edit'
);

CREATE TABLE arte (
    id VARCHAR(36) PRIMARY KEY,
    tipo_arte tipo_arte NOT NULL,
    link TEXT NOT NULL,             -- link para o MinIO
    data DATE DEFAULT CURRENT_DATE,
    id_usuario VARCHAR(36) NOT NULL,
    id_obra VARCHAR(36) NOT NULL,
    CONSTRAINT fk_arte_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_arte_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. TABELAS ASSOCIATIVAS (RELACIONAMENTOS N:N)
-- ============================================================================

CREATE TABLE seguidor (
    id_seguidor VARCHAR(36),
    id_seguido VARCHAR(36),
    data_follow TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_seguidor, id_seguido),
    CONSTRAINT fk_seguidor_usuario FOREIGN KEY (id_seguidor) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_seguido_usuario FOREIGN KEY (id_seguido) 
        REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE usuario_salva_lista (
    id_usuario VARCHAR(36),
    id_lista VARCHAR(36),
    PRIMARY KEY (id_usuario, id_lista),
    CONSTRAINT fk_salva_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_salva_lista FOREIGN KEY (id_lista) 
        REFERENCES lista(id) ON DELETE CASCADE
);

CREATE TABLE lista_obra (
    id_lista VARCHAR(36),
    id_obra VARCHAR(36),
    ordem INTEGER NOT NULL, -- define a posição do filme na lista
    PRIMARY KEY (id_lista, id_obra),
    CONSTRAINT fk_lista_obra_lista FOREIGN KEY (id_lista) 
        REFERENCES lista(id) ON DELETE CASCADE,
    CONSTRAINT fk_lista_obra_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE
);

CREATE TABLE avaliacao (
    id_usuario VARCHAR(36),
    id_obra VARCHAR(36),
    data DATE DEFAULT CURRENT_DATE,
    resenha TEXT,
    nota NUMERIC(4, 2) NOT NULL,
    reassistido BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_usuario, id_obra),
    CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE,
    CONSTRAINT chk_nota CHECK (nota >= 0.00 AND nota <= 10.00)
);

CREATE TABLE watchlist (
    id_usuario VARCHAR(36),
    id_obra VARCHAR(36),
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_obra),
    CONSTRAINT fk_watchlist_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlist_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE
);

CREATE TABLE usuario_curte_arte (
    id_usuario VARCHAR(36),
    id_arte VARCHAR(36),
    PRIMARY KEY (id_usuario, id_arte),
    CONSTRAINT fk_curte_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_curte_arte FOREIGN KEY (id_arte) 
        REFERENCES arte(id) ON DELETE CASCADE
);

CREATE TYPE funcao_artista AS ENUM (
    'Diretor', 
    'Ator', 
    'Roteirista', 
    'Produtor', 
    'Diretor de Fotografia', 
    'Trilha Sonora'
);

CREATE TABLE obra_artista (
    id_obra VARCHAR(36),
    id_artista VARCHAR(36),
    funcao funcao_artista NOT NULL,
    PRIMARY KEY (id_obra, id_artista, funcao),
    CONSTRAINT fk_obra_artista_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE,
    CONSTRAINT fk_obra_artista_artista FOREIGN KEY (id_artista) 
        REFERENCES artista(id) ON DELETE CASCADE
);

CREATE TABLE obra_genero (
    id_obra VARCHAR(36),
    id_genero VARCHAR(36),
    PRIMARY KEY (id_obra, id_genero),
    CONSTRAINT fk_obra_genero_obra FOREIGN KEY (id_obra) 
        REFERENCES obra(id) ON DELETE CASCADE,
    CONSTRAINT fk_obra_genero_genero FOREIGN KEY (id_genero) 
        REFERENCES genero(id) ON DELETE CASCADE
);
