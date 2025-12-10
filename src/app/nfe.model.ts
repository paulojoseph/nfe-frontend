export interface NotaFiscal {
  id?: number;
  chaveAcesso: string;
  numeroNota: string;
  cnpjEmitente: string;
  cnpjDestinatario?: string;
  valorTotal: number;
  dataEmissao?: string;
  status?: string;
}

export interface DashboardItem {
  STATUS: string;
  QTD: number;
  TOTAL: number;
}