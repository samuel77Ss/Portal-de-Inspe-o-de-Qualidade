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

// Migra o exemplo original (isométrico AngloAmerican) se ainda não estiver no armazenamento novo
function seedExampleLine() {
  const ID = 'AMR-1006916-06-ATK-CP00-0416-PI-11-00062';
  if (getLinha(ID)) return;

  const LEGACY_KEY = 'cartaoCampo_' + ID;
  let spools = null;
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (Array.isArray(legacy) && legacy.length) spools = legacy;
  } catch (e) {}

  const SEED = [
    ['SP-0416-00062-001','1/6'],['SP-0416-00062-002-AJ','1/6'],
    ['SP-0416-00062-003','2/6'],['SP-0416-00062-004','2/6'],['SP-0416-00062-005','2/6'],
    ['SP-0416-00062-006','2/6'],['SP-0416-00062-007','2/6'],['SP-0416-00062-008','2/6'],
    ['SP-0416-00062-009-AJ','2/6'],['SP-0416-00062-010','2/6'],['SP-0416-00062-011','2/6'],['SP-0416-00062-012','2/6'],
    ['SP-0416-00062-013','3/6'],['SP-0416-00062-014','3/6'],['SP-0416-00062-015','3/6'],['SP-0416-00062-016','3/6'],
    ['SP-0416-00062-017','3/6'],['SP-0416-00062-018','3/6'],['SP-0416-00062-019','3/6'],['SP-0416-00062-020','3/6'],
    ['SP-0416-00062-021','3/6'],['SP-0416-00062-022','3/6'],['SP-0416-00062-023','3/6'],['SP-0416-00062-024','3/6'],
    ['SP-0416-00062-025','3/6'],['SP-0416-00062-026','3/6'],['SP-0416-00062-027','3/6'],['SP-0416-00062-028','3/6'],
    ['SP-0416-00062-029','3/6'],['SP-0416-00062-030','3/6'],['SP-0416-00062-031-AJ','3/6'],
    ['SP-0416-00062-032','4/6'],['SP-0416-00062-033','4/6'],['SP-0416-00062-034-AJ','4/6'],['SP-0416-00062-035-AJ','4/6'],
    ['SP-0416-00062-036','4/6'],['SP-0416-00062-037','4/6'],['SP-0416-00062-038','4/6'],['SP-0416-00062-039','4/6'],
    ['SP-0416-00062-040-AJ','4/6'],['SP-0416-00062-041','4/6'],['SP-0416-00062-042','4/6'],['SP-0416-00062-043','4/6'],
    ['SP-0416-00062-044','4/6'],['SP-0416-00062-045','4/6'],['SP-0416-00062-046-AJ','4/6'],
    ['SP-0416-00062-047','5/6'],['SP-0416-00062-048','5/6'],['SP-0416-00062-049','5/6'],
    ['SP-0416-00062-050-AJ','5/6'],['SP-0416-00062-051','5/6'],['SP-0416-00062-058','5/6'],
    ['SP-0416-00062-052','6/6'],['SP-0416-00062-053-AJ','6/6'],['SP-0416-00062-054','6/6'],
    ['SP-0416-00062-055','6/6'],['SP-0416-00062-056','6/6'],['SP-0416-00062-057','6/6'],
  ];

  upsertLinha({
    id: ID,
    cwa: 'CWA-06',
    isometrico: '22"-PP-0416-602-X15',
    titulo: 'Flotação Recleaner — Remoagem',
    revisao: '1',
    folhas: '6',
    holdNota: 'HOLD 1 ativo nesta revisão: projeto emitido antes do recebimento dos DFs certificados da bomba, amostrador e válvulas instrumentadas. Confirmar liberação do HOLD antes de aprovar os spools/itens afetados por ele.',
    spools: spools || SEED.map(([id, folha]) => ({ id, folha, dn: '', status: 'pendente', inspetor: '', obs: '', updatedAt: '' }))
  });
}

// Segunda linha de exemplo (isométrico 14"-PG-0415-091-X16), se ainda não estiver cadastrada
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
