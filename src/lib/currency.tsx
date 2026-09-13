"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Devise = "USD" | "CDF";
interface CurrencyCtx {
  devise: Devise;
  setDevise: (d: Devise) => void;
  taux: { bcc: number; parallele: number };
  format: (usd: number) => string;
}

const Ctx = createContext<CurrencyCtx>({
  devise: "USD",
  setDevise: () => {},
  taux: { bcc: 2855, parallele: 2950 },
  format: (n) => `$${n.toLocaleString("fr-FR")}`,
});

export function CurrencyProvider({ children, rates }: { children: ReactNode; rates?: { bcc: number; parallele: number } }) {
  const [devise, setDevise] = useState<Devise>("USD");
  const taux = rates ?? { bcc: 2855, parallele: 2950 };

  const format = (usd: number) => {
    if (devise === "USD") return `$${usd.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}`;
    return `${Math.round(usd * taux.bcc).toLocaleString("fr-FR")} FC`;
  };

  return <Ctx.Provider value={{ devise, setDevise, taux, format }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);
