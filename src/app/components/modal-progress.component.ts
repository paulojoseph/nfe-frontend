import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Non-blocking Toast positioned at bottom-right -->
    <div *ngIf="isVisible" 
         class="fixed bottom-24 right-6 z-40 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
      
      <!-- Header with gradient accent -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="animate-pulse">⚙️</span>
          {{ title }}
        </h3>
        <button (click)="onCancel()" 
                class="text-white/80 hover:text-white text-lg font-bold transition-colors focus:outline-none"
                title="Cancelar">
          ✕
        </button>
      </div>
      
      <!-- Body -->
      <div class="p-4">
        <p class="text-slate-600 text-sm mb-3">{{ message }}</p>

        <!-- Progress Container -->
        <div class="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          
          <!-- Determinate Bar -->
          <div *ngIf="mode === 'determinate'" 
               class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
               [style.width.%]="progress">
          </div>

          <!-- Indeterminate Bar (Striped/Moving) -->
          <div *ngIf="mode === 'indeterminate'" 
               class="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 background-animate">
          </div>
        </div>

        <!-- Status Text (Determinate only) -->
        <div *ngIf="mode === 'determinate'" class="mt-2 flex justify-between items-center">
          <span class="text-xs text-slate-500">Progresso</span>
          <span class="text-xs font-bold text-indigo-600">{{ progress }}%</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .background-animate {
      background-size: 200% 200%;
      animation: gradientMove 1.5s ease infinite;
    }
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { 
        transform: translateY(20px); 
        opacity: 0; 
      }
      to { 
        transform: translateY(0); 
        opacity: 1; 
      }
    }
  `]
})
export class ModalProgressComponent {
  @Input() isVisible = false;
  @Input() title = 'Processando...';
  @Input() message = 'Aguarde um momento.';
  @Input() progress = 0;
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  
  @Output() cancelled = new EventEmitter<void>();

  onCancel() {
    this.cancelled.emit();
  }
}
