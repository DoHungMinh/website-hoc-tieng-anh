// Toast notification utility
export class Toast {
  private static container: HTMLElement | null = null;

  private static createContainer(): HTMLElement {
    if (this.container) return this.container;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(this.container);
    return this.container;
  }

  private static createToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): HTMLElement {
    const toast = document.createElement('div');
    
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500', 
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[type];

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">${message}</span>
        <button class="ml-4 text-white hover:text-gray-200 text-lg font-bold" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;

    return toast;
  }

  public static show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000): void {
    const container = this.createContainer();
    const toast = this.createToast(message, type);
    
    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }

  public static success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  public static error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  public static warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  public static info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
