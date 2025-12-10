import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaFiscal, DashboardItem } from './nfe.model';

@Injectable({
  providedIn: 'root'
})
export class NfeService {
  // ATENÇÃO: Garanta que seu Java está rodando nesta porta
  private readonly API_URL = 'http://localhost:8080/api/nfe';

  constructor(private http: HttpClient) { }

  // Busca lista completa
  listar(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.API_URL);
  }

// Envia nova nota
  criar(nota: NotaFiscal): Observable<NotaFiscal> {
    // REMOVA o "/receber". O endpoint correto é apenas a API_URL
    return this.http.post<NotaFiscal>(this.API_URL, nota);
  }

  // Dispara o processamento pesado (Aquele loop do Java)
  processarBatch(): Observable<string> {
    // O responseType: 'text' é necessário pq o Java retorna uma String simples, não JSON
    return this.http.post(`${this.API_URL}/processar-batch`, {}, { responseType: 'text' });
  }

  gerarMassa(qtd: number): Observable<string> {
    return this.http.post(`${this.API_URL}/seed/${qtd}`, {}, { responseType: 'text' });
  }

  // Busca dados para o gráfico/cards
  getDashboard(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.API_URL}/dashboard`);
  }

  getProgresso(): Observable<any> {
    // Adiciona um timestamp para evitar cache do navegador
    return this.http.get(`${this.API_URL}/progresso?t=${new Date().getTime()}`);
  }
}