import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importe NgZone
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { NfeService } from './nfe.service';
import { NotaFiscal, DashboardItem } from './nfe.model';
import { Subscription } from 'rxjs';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
  id: number;
}

import { ModalProgressComponent } from './components/modal-progress.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ModalProgressComponent],
  providers: [NfeService], 
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  notas: NotaFiscal[] = [];
  dashboard: DashboardItem[] = [];
  
  novaNota: NotaFiscal = {
    chaveAcesso: '',
    numeroNota: '',
    cnpjEmitente: '12345678000199',
    valorTotal: 0
  };

  // Variáveis de Estado
  // Variáveis de Estado
  processando = false;
  gerandoMassa = false;
  progressoPercentual: number = 0; // Tipagem explicita ajuda
  statusProcessamento: string = '';
  
  // UX States
  isLoading = false;
  toasts: Toast[] = [];
  private toastCounter = 0;

  // Pagination
  currentPage = 0;
  pageSize = 50;
  hasMore = true;
  isLoadingMore = false;
  totalCarregado = 0;

  // Modal State
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalProgress = 0;


  modalMode: 'determinate' | 'indeterminate' = 'indeterminate';
  
  // Subscriptions para controle de cancelamento
  private subMassa: Subscription | null = null;
  private subBatch: Subscription | null = null;
  private pollingInterval: any = null;

constructor(
    private service: NfeService, 
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone // <--- 2. Injete aqui
  ) {}

  ngOnInit() {
    console.log('AppComponent initialized');
    this.atualizarDados();
  }

  showToast(type: 'success' | 'error' | 'info', message: string) {
    const id = this.toastCounter++;
    this.toasts.push({ type, message, id });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 4000);
  }

  // --- MÉTODOS DE ATUALIZAÇÃO ---

  atualizarDados() {
    this.atualizarDashboard();
    this.atualizarTabela();
  }

  atualizarDashboard() {
    this.service.getDashboard().subscribe(dados => this.dashboard = dados);
  }

  atualizarTabela() {
    this.isLoading = true;
    this.currentPage = 0;
    this.hasMore = true;
    this.service.listar(0, this.pageSize).subscribe({
        next: (dados) => {
          console.log('Notas carregadas:', dados?.length);
          this.ngZone.run(() => {
            this.notas = dados;
            this.totalCarregado = dados.length;
            this.hasMore = dados.length >= this.pageSize;
            this.isLoading = false;
            this.cdRef.detectChanges();
          });
        },
        error: (err) => {
          console.error('Erro ao carregar notas:', err);
          this.isLoading = false;
          this.showToast('error', 'Erro ao carregar lista de notas.');
        }
    });
  }

  carregarMais() {
    if (this.isLoadingMore || !this.hasMore) return;
    
    this.isLoadingMore = true;
    this.currentPage++;
    
    this.service.listar(this.currentPage, this.pageSize).subscribe({
      next: (dados) => {
        this.ngZone.run(() => {
          this.notas = [...this.notas, ...dados];
          this.totalCarregado = this.notas.length;
          this.hasMore = dados.length >= this.pageSize;
          this.isLoadingMore = false;
          this.cdRef.detectChanges();
        });
      },
      error: () => {
        this.isLoadingMore = false;
        this.showToast('error', 'Erro ao carregar mais notas.');
      }
    });
  }

  // --- AÇÕES DO USUÁRIO ---

  salvar() {
    if (!this.novaNota.chaveAcesso) return;
    
    this.service.criar(this.novaNota).subscribe({
      next: () => {
        this.showToast('success', 'Nota Recebida com Sucesso!');
        this.atualizarDados(); 
        this.novaNota.chaveAcesso = ''; 
        this.novaNota.numeroNota = '';
        this.novaNota.valorTotal = 0;
      },
      error: (err) => this.showToast('error', 'Erro: ' + (err.error || 'Falha ao conectar'))
    });
  }

  onModalCancel() {
    this.modalVisible = false;
    
    // Cancela Massa
    if (this.gerandoMassa) {
      if (this.subMassa) {
        this.subMassa.unsubscribe();
        this.subMassa = null;
      }
      this.gerandoMassa = false;
      this.showToast('info', 'Geração de massa cancelada.');
    }

    // Cancela Batch
    if (this.processando) {
      if (this.subBatch) {
        this.subBatch.unsubscribe();
        this.subBatch = null;
      }
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      this.processando = false;
      this.showToast('info', 'Processamento em lote interrompido.');
    }
  }

  gerarMassaTeste() {
    this.gerandoMassa = true;
    
    // Configura e abre o Modal
    this.modalTitle = 'Gerando Massa de Dados';
    this.modalMessage = 'Isso pode levar alguns segundos. Estamos criando 5.000 registros...';
    this.modalMode = 'indeterminate';
    this.modalVisible = true;

    this.subMassa = this.service.gerarMassa(5000).subscribe({
      next: (msg) => {
        // Delay para garantir que o banco persistiu tudo
        setTimeout(() => {
            this.atualizarDados();
            this.gerandoMassa = false;
            this.modalVisible = false; // Fecha modal
            this.showToast('success', 'Massa de dados gerada!');
        }, 1000);
      },
      error: () => {
        this.gerandoMassa = false;
        this.modalVisible = false; // Fecha modal
        this.showToast('error', 'Erro ao gerar massa.');
      }
    });
  }

  // --- LÓGICA DO BATCH (Async + Polling) ---

  executarProcessamentoEmLote() {
    this.processando = true;
    // Mantemos a tabela visível para o usuário acompanhar em tempo real
    this.progressoPercentual = 0;
    this.statusProcessamento = 'Iniciando...';
    
    // Configura Modal
    this.modalTitle = 'Processamento em Lote';
    this.modalMessage = 'Iniciando processamento no servidor...';
    this.modalMode = 'determinate';
    this.modalProgress = 0;
    this.modalVisible = true;

    // 1. Dispara o start (retorna instantaneamente)
    this.subBatch = this.service.processarBatch().subscribe({
      next: (msg) => {
        console.log("Servidor aceitou o comando:", msg);
        // O servidor respondeu, agora iniciamos o monitoramento
        this.iniciarPolling();
      },
      error: (err) => {
        this.showToast('error', 'Erro ao iniciar batch: ' + err.message);
        this.processando = false;
        this.modalVisible = false;
      }
    });
  }

  iniciarPolling() {
    this.pollingInterval = setInterval(() => {
      
      const sub = this.service.getProgresso().subscribe({
        next: (dados) => {
          // DEBUG: Verifique o que está chegando
          console.log('Dados Progress:', dados);

          // <--- 3. A MÁGICA: OBRIGUE O ANGULAR A RODAR AQUI DENTRO
          this.ngZone.run(() => {
              
              // Lógica segura
              let p = dados.porcentagem || 0;
              if (p < 0) p = 0; 
              if (p > 100) p = 100;

              this.progressoPercentual = Math.floor(p);
              this.statusProcessamento = `Processado ${dados.processados} de ${dados.total}`;

              // Atualiza Modal
              this.modalProgress = this.progressoPercentual;
              this.modalMessage = this.statusProcessamento;

              // Atualiza Dashboard e Tabela em tempo real
              this.atualizarDashboard();
              this.atualizarTabela(); // Mostra notas sendo processadas
              
              // Se quiser ser redundante, mantenha o detectChanges, mas o NgZone já deve resolver
              this.cdRef.detectChanges();

              // Lógica de Fim
              if (!dados.processando && dados.total > 0 && this.progressoPercentual >= 100) {
                if (this.pollingInterval) clearInterval(this.pollingInterval);
                this.processando = false;
                this.progressoPercentual = 100;
                
                // Delay para garantir sincronia
                setTimeout(() => {
                    this.atualizarDados();
                    this.modalVisible = false; // Fecha modal
                    this.showToast('success', 'Processamento em Lote Concluído!');
                }, 1000);
              }
          });
        },
        error: (err) => console.error(err)
      });

    }, 1000);
  }
}