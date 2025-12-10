import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-100 transform transition-all animate-scale-in">
        
        <!-- Header -->
        <h3 class="text-xl font-bold text-slate-800 mb-2 text-center">{{ title }}</h3>
        <p class="text-slate-500 text-center text-sm mb-6">{{ message }}</p>

        <!-- Progress Container -->
        <div class="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-6">
          
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
        <div *ngIf="mode === 'determinate'" class="mb-4 flex justify-end">
          <span class="text-xs font-bold text-slate-600">{{ progress }}%</span>
        </div>

        <!-- Cancel Button -->
        <div class="flex justify-center">
            <button (click)="onCancel()" 
                class="px-6 py-2 border border-red-200 text-red-600 rounded-full text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Cancelar
            </button>
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
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
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
