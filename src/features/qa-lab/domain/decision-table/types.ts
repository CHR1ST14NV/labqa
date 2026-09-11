// QA LAB — dominio puro de Tabla de Decisiones (caso académico: motor de
// descuentos de una tienda). Módulo standalone, sin conexión a ningún
// sistema de cotizaciones/facturación real.

export interface DecisionConditions {
  vip: boolean; // C1 ¿Cliente VIP?
  amountGte500: boolean; // C2 ¿Compra >= Q500?
  couponValid: boolean; // C3 ¿Cupón válido?
  allowsPromotions: boolean; // C4 ¿Producto permite promociones?
}

export const CONDITION_LABELS: Record<keyof DecisionConditions, string> = {
  vip: "Cliente VIP",
  amountGte500: "Compra >= Q500",
  couponValid: "Cupón válido",
  allowsPromotions: "Permite promociones",
};

export interface DecisionActions {
  discountPercent: 0 | 5 | 10 | 15 | 20;
  rejectCoupon: boolean;
}

export const ACTION_ROW_KEYS = [
  "discount0",
  "discount5",
  "discount10",
  "discount15",
  "discount20",
  "rejectCoupon",
] as const;

export type ActionRowKey = (typeof ACTION_ROW_KEYS)[number];

export const ACTION_ROW_LABELS: Record<ActionRowKey, string> = {
  discount0: "Sin descuento",
  discount5: "5%",
  discount10: "10%",
  discount15: "15%",
  discount20: "20%",
  rejectCoupon: "Rechazar cupón",
};

export interface DecisionRule {
  id: string; // R01..R16
  conditions: DecisionConditions;
  actions: DecisionActions;
}
