import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('steticcar.db');
  }
  const db = await databasePromise;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      celular TEXT NOT NULL UNIQUE,
      endereco TEXT NOT NULL,
      placa TEXT NOT NULL UNIQUE,
      foto_perfil TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try { await db.execAsync('ALTER TABLE clientes ADD COLUMN foto_perfil TEXT;'); } catch { /* coluna já existe */ }
  return db;
}

export interface Cliente {
  id: number;
  nome: string;
  celular: string;
  endereco: string;
  placa: string;
  foto_perfil?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function inicializarBanco() {
  await getDatabase();
}

export async function criarCliente(dados: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO clientes (nome, celular, endereco, placa, foto_perfil) VALUES (?, ?, ?, ?, ?)',
    dados.nome,
    dados.celular,
    dados.endereco,
    dados.placa,
    dados.foto_perfil ?? null,
  );
  return Number(result.lastInsertRowId);
}

export async function buscarClientePorId(id: number) {
  const db = await getDatabase();
  return db.getFirstAsync<Cliente>('SELECT * FROM clientes WHERE id = ?', id);
}

export async function buscarClientePorCelular(celular: string) {
  const db = await getDatabase();
  return db.getFirstAsync<Cliente>('SELECT * FROM clientes WHERE celular = ?', celular);
}

export async function buscarClientePorPlaca(placa: string) {
  const db = await getDatabase();
  return db.getFirstAsync<Cliente>('SELECT * FROM clientes WHERE placa = ?', placa);
}

export async function atualizarCliente(id: number, dados: Pick<Cliente, 'nome' | 'celular' | 'endereco' | 'placa' | 'foto_perfil'>) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE clientes SET nome = ?, celular = ?, endereco = ?, placa = ?, foto_perfil = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    dados.nome, dados.celular, dados.endereco, dados.placa, dados.foto_perfil ?? null, id,
  );
}
