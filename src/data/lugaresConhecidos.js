// Coordenadas verificadas de locais comuns em Francisco Beltrão - PR
export const lugaresConhecidos = [
  { nome: 'UNIPAR', latitude: -26.0920, longitude: -53.0516 },
  { nome: 'Unipar', latitude: -26.0920, longitude: -53.0516 },
  { nome: 'Unioeste', latitude: -26.0839, longitude: -53.0521 },
  { nome: 'UTFPR', latitude: -26.0658, longitude: -53.0597 },
  { nome: 'Cesul', latitude: -26.0761, longitude: -53.0480 },
  { nome: 'Terminal Central', latitude: -26.0820, longitude: -53.0572 },
  { nome: 'Terminal Rodoviário', latitude: -26.0820, longitude: -53.0572 },
  { nome: 'Centro', latitude: -26.0786, longitude: -53.0560 },
  { nome: 'Bairro Industrial', latitude: -26.0952, longitude: -53.0663 },
  { nome: 'Industrial', latitude: -26.0952, longitude: -53.0663 },
  { nome: 'Zona Norte', latitude: -26.0700, longitude: -53.0550 },
  { nome: 'Zona Sul', latitude: -26.0950, longitude: -53.0550 },
  { nome: 'Zona Leste', latitude: -26.0800, longitude: -53.0450 },
  { nome: 'Zona Oeste', latitude: -26.0800, longitude: -53.0650 },
  { nome: 'São Francisco', latitude: -26.0900, longitude: -53.0490 },
  { nome: 'Vila Nova', latitude: -26.0810, longitude: -53.0520 },
  { nome: 'Padre Ulrico', latitude: -26.0750, longitude: -53.0620 },
];

export function buscarLugarConhecido(texto) {
  const textoNorm = normalizarTexto(texto);
  return lugaresConhecidos.find(l => normalizarTexto(l.nome) === textoNorm) ?? null;
}

export function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
