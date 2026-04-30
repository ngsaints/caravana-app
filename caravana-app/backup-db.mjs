import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'prisma', 'dev.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Criar pasta de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Nome do backup com timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupPath = path.join(BACKUP_DIR, `dev-${timestamp}.db`);

// Copiar banco de dados
if (fs.existsSync(DB_PATH)) {
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ Backup criado: ${backupPath}`);
  
  // Manter apenas os últimos 10 backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  if (backups.length > 10) {
    backups.slice(10).forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Backup antigo removido: ${backup.name}`);
    });
  }
  
  console.log(`📊 Total de backups: ${Math.min(backups.length, 10)}`);
} else {
  console.error('❌ Banco de dados não encontrado!');
  process.exit(1);
}
