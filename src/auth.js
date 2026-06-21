// Autenticação com MSAL (Microsoft Authentication Library)
// NÃO colocar client secrets aqui; use variáveis de ambiente no Netlify
import { PublicClientApplication } from "https://cdn.jsdelivr.net/npm/@azure/msal-browser/dist/msal-browser.min.js";

// Configurar via variáveis de ambiente (definir no deploy)
const MSAL_CONFIG = {
  auth: {
    clientId: window.__ENV?.AZURE_CLIENT_ID || 'SEU_CLIENT_ID_AQUI',
    authority: `https://login.microsoftonline.com/${window.__ENV?.AZURE_TENANT_ID || 'SEU_TENANT_ID'}`,
    redirectUri: window.location.origin
  }
};

const SCOPES = [ (window.__ENV?.GRAPH_SCOPE) || 'Sites.Read.All' ];

let msalInstance;

export async function initAuth() {
  msalInstance = new PublicClientApplication(MSAL_CONFIG);
  // tenta login silente
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) return;
    msalInstance.setActiveAccount(accounts[0]);
  } catch (e) {
    console.log('initAuth:', e);
  }
}

export async function login() {
  return msalInstance.loginPopup({ scopes: SCOPES });
}

export async function getToken() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    await login();
  }
  try {
    const result = await msalInstance.acquireTokenSilent({
      account: msalInstance.getActiveAccount(),
      scopes: SCOPES
    });
    return result.accessToken;
  } catch (err) {
    // fallback para popup
    const result = await msalInstance.acquireTokenPopup({ scopes: SCOPES });
    return result.accessToken;
  }
}
