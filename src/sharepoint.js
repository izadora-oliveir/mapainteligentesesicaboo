// Funções para buscar listas do SharePoint via Microsoft Graph.
// Substitua SITE_ID e nomes das listas por valores reais (ou usar env vars).
const SITE_ID = window.__ENV?.SHAREPOINT_SITE_ID || 'SEU_SITE_ID_AQUI';

// nome das listas conforme especificado
const LIST_ALUNOS = 'Alunos';
const LIST_REGISTROS = 'RegistrosPedagogicos';

async function fetchListItems(accessToken, listName) {
  const url = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${listName}/items?expand=fields&top=500`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro Graph: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.value;
}

export async function carregarAlunos(accessToken) {
  const items = await fetchListItems(accessToken, LIST_ALUNOS);
  return items.map(it => ({
    id: it.id,
    nome: it.fields.Nome,
    serie: it.fields.Serie,
    turma: it.fields.Turma,
    matricula: it.fields.Matricula,
    status: it.fields.Status
  }));
}

export async function carregarRegistrosPedagogicos(accessToken) {
  const items = await fetchListItems(accessToken, LIST_REGISTROS);
  return items.map(it => ({
    id: it.id,
    alunoId: it.fields.AlunoID,
    disciplina: it.fields.Disciplina,
    nota: it.fields.Nota !== undefined ? Number(it.fields.Nota) : null,
    frequencia: it.fields.Frequencia !== undefined ? Number(it.fields.Frequencia) : null,
    habilidade: it.fields.Habilidade,
    bimestre: it.fields.Bimestre,
    dataRegistro: it.fields.DataRegistro,
    observacao: it.fields.Observacao
  }));
}
