// Armazenamento compartilhado das linhas de tubulação (localStorage)
const STORE_KEY = 'portalTubulacao_linhas';

const STATUS_COLOR = { pendente: '#5a6a80', liberado: '#1e5fa8', aprovado: '#2a7a5a', reprovado: '#a83a3a' };
const STATUS_LABEL = { pendente: '⏳ Pendente', liberado: '🔄 Liberado', aprovado: '✅ Aprovado', reprovado: '❌ Reprovado' };
const STATUS_CYCLE = ['pendente', 'liberado', 'aprovado', 'reprovado'];

function loadLinhas() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch (e) { return []; }
}

function saveLinhas(linhas) {
  localStorage.setItem(STORE_KEY, JSON.stringify(linhas));
}

function getLinha(id) {
  return loadLinhas().find(l => l.id === id);
}

function upsertLinha(linha) {
  const linhas = loadLinhas();
  const idx = linhas.findIndex(l => l.id === linha.id);
  if (idx >= 0) linhas[idx] = linha; else linhas.push(linha);
  saveLinhas(linhas);
  return linha;
}

function deleteLinha(id) {
  saveLinhas(loadLinhas().filter(l => l.id !== id));
}

// Escapa valores para uso seguro dentro de atributos HTML (ex: DN/isométrico contêm aspas de polegada)
function escAttr(s) {
  return (s || '').toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function lineStats(linha) {
  const total = linha.spools.length;
  const count = st => linha.spools.filter(s => s.status === st).length;
  const aprovado = count('aprovado'), liberado = count('liberado'), pendente = count('pendente'), reprovado = count('reprovado');
  const pct = total ? Math.round(aprovado / total * 100) : 0;
  return { total, aprovado, liberado, pendente, reprovado, pct };
}

// Linha AMR-1006916-06-ATK-CP000602-0415-PI-11-00470 (isométrico 14"-PG-0415-091-X16), se ainda não estiver cadastrada
function seedSecondLine() {
  const ID = 'AMR-1006916-06-ATK-CP000602-0415-PI-11-00470';
  if (getLinha(ID)) return;

  const SEED = [
    ['SP-0415-00470-001','1/4'],['SP-0415-00470-002','1/4'],['SP-0415-00470-003','1/4'],['SP-0415-00470-027','1/4'],
    ['SP-0415-00470-004-AJ','2/4'],['SP-0415-00470-005','2/4'],['SP-0415-00470-006','2/4'],['SP-0415-00470-007','2/4'],
    ['SP-0415-00470-008','3/4'],['SP-0415-00470-009','3/4'],['SP-0415-00470-010','3/4'],['SP-0415-00470-011','3/4'],
    ['SP-0415-00470-012','3/4'],['SP-0415-00470-013','3/4'],['SP-0415-00470-014','3/4'],['SP-0415-00470-015','3/4'],
    ['SP-0415-00470-017-AJ','3/4'],['SP-0415-00470-018','3/4'],['SP-0415-00470-028','3/4'],['SP-0415-00470-029','3/4'],
    ['SP-0415-00470-019','4/4'],['SP-0415-00470-020','4/4'],['SP-0415-00470-021-AJ','4/4'],['SP-0415-00470-022','4/4'],
    ['SP-0415-00470-023','4/4'],['SP-0415-00470-024-AJ','4/4'],['SP-0415-00470-025','4/4'],['SP-0415-00470-026','4/4'],
  ];

  upsertLinha({
    id: ID,
    cwa: 'CWA-16',
    isometrico: '14"-PG-0415-091-X16',
    titulo: 'Flotação em Colunas — Projeto Flotação Recleaner',
    revisao: '2',
    folhas: '4',
    holdNota: 'HOLD 1 ativo nesta revisão: projeto desenvolvido antes do recebimento dos DFs certificados da FLS (nota 9).',
    spools: SEED.map(([id, folha]) => ({ id, folha, dn: '', status: 'pendente', inspetor: '', obs: '', updatedAt: '' }))
  });
}
