export function brl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function priceToCents(value: string): number {
  return Math.round(Number(value.replace(",", ".")) * 100);
}

