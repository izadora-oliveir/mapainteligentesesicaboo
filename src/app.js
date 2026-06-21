// Ponto de entrada: inicializa auth, carrega dados e conecta UI
import * as auth from './auth.js';
import * as sp from './sharepoint.js';
import * as dash from './dashboard.js';

// Navegação simples
document.querySelectorAll('.sidebar nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
  });
});

async function init() {
  try {
    await auth.initAuth(); // configura MSAL e tenta silente login
    const accessToken = await auth.getToken();

    // Carregar dados do SharePoint
    const [alunos, registros] = await Promise.all([
      sp.carregarAlunos(accessToken),
      sp.carregarRegistrosPedagogicos(accessToken)
    ]);

    // Processar e renderizar dashboard
    dash.init({ alunos, registros });
  } catch (err) {
    console.error('Erro na inicialização:', err);
    // Exibir botão de login se necessário
    const btn = document.createElement('button');
    btn.textContent = 'Entrar';
    btn.addEventListener('click', async () => {
      await auth.login();
      location.reload();
    });
    document.body.appendChild(btn);
  }
}

init();
