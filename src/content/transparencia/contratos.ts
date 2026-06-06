/**
 * Portal de Transparencia — registro estático de colaboraciones sin
 * contraprestación económica directa.
 *
 * Cada entrada de este arreglo representa un contrato real ya publicado y
 * referencia un PDF físico ubicado en:
 *
 *   public/transparencia/contratos/<archivo>.pdf
 *
 * El renderizado se realiza desde:
 *
 *   src/app/portal-transparencia/page.tsx
 *
 * No incluir datos ficticios. El arreglo permanece vacío hasta que exista
 * un contrato real formalizado y su PDF correspondiente colocado en la
 * carpeta pública indicada.
 */

export type ContratoTransparencia = {
  fecha: string;
  colaboracion: string;
  tipo: string;
  documento: string;
  estado: "Publicado" | "Pendiente";
};

// Ejemplo de entrada futura (NO descomentar hasta disponer del contrato real
// y de su PDF en public/transparencia/contratos/):
//
// {
//   fecha: "2026-01-15",
//   colaboracion: "Nombre de la entidad colaboradora",
//   tipo: "Identidad visual",
//   documento: "/transparencia/contratos/nombre-del-contrato.pdf",
//   estado: "Publicado",
// },

export const contratosTransparencia: ContratoTransparencia[] = [];
