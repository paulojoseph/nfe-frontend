import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaFiscal, DashboardItem } from './nfe.model';
// IMPORTANTE: Importe sempre do arquivo GENÉRICO (sem .prod)
// O Angular troca automaticamente pelo .prod quando faz o build
import { environment } from '../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class NfeService {
  
  // CORREÇÃO: Agora ele pega a URL dinâmica (Local ou Prod)
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listar(page: number = 0, size: number = 50): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(`${this.API_URL}?page=${page}&size=${size}`);
  }

  listarTodas(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.API_URL);
  }

  criar(nota: NotaFiscal): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.API_URL, nota);
  }

  processarBatch(): Observable<string> {
    return this.http.post(`${this.API_URL}/processar-batch`, {}, { responseType: 'text' });
  }

  gerarMassa(qtd: number): Observable<string> {
    return this.http.post(`${this.API_URL}/seed/${qtd}`, {}, { responseType: 'text' });
  }

  getDashboard(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.API_URL}/dashboard`);
  }

  getProgresso(): Observable<any> {
    return this.http.get(`${this.API_URL}/progresso?t=${new Date().getTime()}`);
  }
}