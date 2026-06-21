// Lógica para montar indicadores, tabela de alunos, mapa pedagógico e gráficos
import { calcularRisco as riscoUtil } from './utils.js';

export function init({ alunos, registros }) {
  montarFiltros(alunos, registros);
  renderIndicadores(alunos, registros);
  renderTabelaAlunos(alunos, registros);
  renderMapaPedagogico(registros);
  renderEvolucao(registros);
}

// Monta selects de filtro (simplificado)
function montarFiltros(alunos) {
  const series = new Set(alunos.map(a => a.serie));
  const turmas = new Set(alunos.map(a => a.turma));
  const sSerie = document.getElementById('filtro-serie');
  const sTurma = document.getElementById('filtro-turma');

  series.forEach(s => s && sSerie.appendChild(new Option(s, s)));
  turmas.forEach(t => t && sTurma.appendChild(new Option(t, t)));
}

// Indicadores principais
function renderIndicadores(alunos, registros) {
  const mediaTurma = calcularMediaGeral(registros);
  const qtdAlunos = alunos.length;
  const freqMedia = calcularFrequenciaMedia(registros);
  const taxaDesempenho = calcularTaxaDesempenho(registros);
  const alunosRisco = calcularAlunosRisco(alunos, registros);
  const habilidadesCriticas = identificarHabilidadesCriticas(registros);

  const container = document.getElementById('indicadores-cards');
  container.innerHTML = '';

  const cards = [
    { title: 'Média da turma', value: mediaTurma.toFixed(2) },
    { title: 'Quantidade de alunos', value: qtdAlunos },
    { title: 'Frequência média', value: freqMedia.toFixed(1) + '%' },
    { title: 'Taxa de desempenho', value: (taxaDesempenho*100).toFixed(0)+'%' },
    { title: 'Alunos em risco', value: alunosRisco },
    { title: 'Habilidades críticas', value: habilidadesCriticas.join(', ') || '-' }
  ];

  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h4>${c.title}</h4><p>${c.value}</p>`;
    container.appendChild(card);
  });
}

function calcularMediaGeral(registros) {
  const notas = registros.filter(r => r.nota !== null).map(r => r.nota);
  if (!notas.length) return 0;
  return notas.reduce((a,b)=>a+b,0)/notas.length;
}
function calcularFrequenciaMedia(registros) {
  const freqs = registros.filter(r => r.frequencia !== null).map(r => r.frequencia);
  if (!freqs.length) return 0;
  return freqs.reduce((a,b)=>a+b,0)/freqs.length;
}
function calcularTaxaDesempenho(registros) {
  const notas = registros.filter(r => r.nota !== null).map(r => r.nota);
  if (!notas.length) return 0;
  const acima = notas.filter(n => n >= 7).length;
  return acima / notas.length;
}
function calcularAlunosRisco(alunos, registros) {
  // simplificação: usa último registro por aluno (por exemplo)
  const grupoPorAluno = new Map();
  registros.forEach(r => {
    if (!grupoPorAluno.has(r.alunoId)) grupoPorAluno.set(r.alunoId, []);
    grupoPorAluno.get(r.alunoId).push(r);
  });
  let count = 0;
  alunos.forEach(a => {
    const regs = grupoPorAluno.get(a.id) || [];
    const last = regs[regs.length - 1];
    const nota = last?.nota ?? 10;
    const freq = last?.frequencia ?? 100;
    if (riscoUtil(nota, freq) === 'Alto') count++;
  });
  return count;
}
function identificarHabilidadesCriticas(registros) {
  const porHab = {};
  registros.forEach(r => {
    if (!r.habilidade || r.nota === null) return;
    porHab[r.habilidade] = porHab[r.habilidade] || { soma:0, n:0 };
    porHab[r.habilidade].soma += r.nota;
    porHab[r.habilidade].n += 1;
  });
  const arr = Object.entries(porHab).map(([h,v]) => ({ habilidade:h, media: v.soma/v.n }));
  return arr.filter(a => a.media < 6).sort((a,b)=>a.media-b.media).slice(0,5).map(a => a.habilidade);
}

// Tabela de alunos
function renderTabelaAlunos(alunos, registros) {
  const tbody = document.querySelector('#tabela-alunos tbody');
  tbody.innerHTML = '';
  const ultimoPorAluno = new Map();
  registros.forEach(r => { ultimoPorAluno.set(r.alunoId, r); });

  alunos.forEach(a => {
    const r = ultimoPorAluno.get(a.id) || {};
    const nota = r.nota ?? '-';
    const freq = r.frequencia !== undefined ? (r.frequencia + '%') : '-';
    const risco = riscoUtil(r.nota ?? 10, r.frequencia ?? 100);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.nome}</td><td>${nota}</td><td>${freq}</td><td>${risco}</td>`;
    tbody.appendChild(tr);
  });
}

// Mapa Pedagógico
function renderMapaPedagogico(registros) {
  const porHab = {};
  registros.forEach(r => {
    if (!r.habilidade || r.nota === null) return;
    if (!porHab[r.habilidade]) porHab[r.habilidade] = { soma:0, n:0 };
    porHab[r.habilidade].soma += r.nota;
    porHab[r.habilidade].n += 1;
  });
  const tbody = document.querySelector('#tabela-habilidades tbody');
  tbody.innerHTML = '';
  Object.entries(porHab).forEach(([hab, v]) => {
    const media = v.soma / v.n;
    const status = media >= 8 ? 'Dominada' : media >=5 ? 'Atenção' : 'Crítica';
    const intervencao = status === 'Dominada' ? 'Manter acompanhamento' : status === 'Atenção' ? 'Reforço dirigido' : 'Intervenção imediata';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${hab}</td><td>${media.toFixed(1)}</td><td>${status}</td><td>${intervencao}</td>`;
    tbody.appendChild(tr);
  });
}

// Evolução (exemplo com Chart.js)
function renderEvolucao(registros) {
  const ctx = document.getElementById('chart-evolucao').getContext('2d');
  // exemplo: média por bimestre
  const porBimestre = {};
  registros.forEach(r => {
    if (r.nota === null) return;
    porBimestre[r.bimestre] = porBimestre[r.bimestre] || { soma:0, n:0 };
    porBimestre[r.bimestre].soma += r.nota;
    porBimestre[r.bimestre].n += 1;
  });
  const labels = Object.keys(porBimestre).sort();
  const data = labels.map(l => (porBimestre[l].soma / porBimestre[l].n));
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Média por bimestre', data, borderColor: '#00A88E', fill:false }] },
    options: { responsive:true, plugins: { legend: { display:false } } }
  });
  // leitura inteligente (simples)
  const insight = document.getElementById('leitura-inteligente');
  if (labels.length >= 2 && data[data.length-1] > data[data.length-2]) {
    insight.textContent = 'A turma apresentou crescimento no último bimestre.';
  } else {
    insight.textContent = 'Não houve crescimento significativo no último bimestre.';
  }
}
