import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'prisma', 'dev.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Listar backups disponíveis
if (!fs.existsSync(BACKUP_DIR)) {
  console.error('❌ Pasta de backups não encontrada!');
  process.exit(1);
}

const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.endsWith('.db'))
  .map(f => ({
    name: f,
    path: path.join(BACKUP_DIR, f),
    time: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
    size: fs.statSync(path.join(BACKUP_DIR, f)).size
  }))
  .sort((a, b) => b.time.getTime() - a.time.getTime());

if (backups.length === 0) {
  console.error('❌ Nenhum backup encontrado!');
  process.exit(1);
}

console.log('\n📦 Backups disponíveis:\n');
backups.forEach((backup, i) => {
  const sizeKB = (backup.size / 1024).toFixed(2);
  console.log(`${i + 1}. ${backup.name}`);
  console.log(`   Data: ${backup.time.toLocaleString('pt-BR')}`);
  console.log(`   Tamanho: ${sizeKB} KB\n`);
});

// Restaurar o backup mais recente
const latest = backups[0];
console.log(`🔄 Restaurando backup mais recente: ${latest.name}`);

// Fazer backup do banco atual antes de restaurar
if (fs.existsSync(DB_PATH)) {
  const currentBackup = path.join(BACKUP_DIR, `before-restore-${Date.now()}.db`);
  fs.copyFileSync(DB_PATH, currentBackup);
  console.log(`💾 Backup do banco atual salvo: ${path.basename(currentBackup)}`);
}

// Restaurar
fs.copyFileSync(latest.path, DB_PATH);
console.log(`✅ Banco de dados restaurado com sucesso!`);
console.log(`📊 Tamanho: ${(latest.size / 1024).toFixed(2)} KB`);
