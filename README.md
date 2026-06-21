# Mapa Inteligente do Aluno

Projeto front-end que consome dados do SharePoint via Microsoft Graph e apresenta indicadores pedagógicos.

## Estrutura do repositório

- index.html
- privacidade.html
- README.md
- .gitignore
- .env.example
- src/ (código JS/CSS)
- assets/ (logo)

## Como configurar (resumo):

1. Registrar app no Azure AD (App registrations):
   - Redirect URI: https://SEU_DOMINIO/
   - Permissões (delegadas): Sites.Read.All ou outras conforme necessidade.
   - Usar MSAL.js v2 (recomendado).

2. Criar listas no SharePoint:
   - Lista `Alunos` com colunas: Nome, Serie, Turma, Matricula, Status.
   - Lista `RegistrosPedagogicos` com colunas: AlunoID (Lookup), Disciplina, Nota, Frequencia, Habilidade, Bimestre, DataRegistro, Observacao.

3. Variáveis de ambiente (definir no Netlify/GitHub Actions):
   - AZURE_CLIENT_ID
   - AZURE_TENANT_ID
   - SHAREPOINT_SITE_ID
   - GRAPH_SCOPE (ex: Sites.Read.All)

4. Deploy:
   - Criar repositório no GitHub (privado) e push.
   - Conectar repo no Netlify e configurar variáveis de ambiente.

## Segurança
- Nunca comitar tokens/client secrets.
- Use variáveis de ambiente do provedor de hosting.
- Mantenha dados dos alunos apenas no SharePoint.

## Testes locais
- Sirva os arquivos estáticos com um servidor simples (ex.: `npx http-server .` ou `python -m http.server 8080`).

## Licença
Escolha uma licença apropriada para seu projeto. Atualmente o repositório contém exemplos e código de demonstração.
