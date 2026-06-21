// Utilitários compartilhados
export function calcularRisco(nota, frequencia) {
  if (nota < 5 || frequencia < 75) return "Alto";
  if (nota <= 7 || frequencia < 85) return "Médio";
  return "Baixo";
}
