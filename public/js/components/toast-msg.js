// Toast Message Web Component
class ToastMsg extends HTMLElement {
    constructor() {
        super();
        this.toasts = [];
        this.maxToasts = 3;
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="toast-container" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: var(--z-toast, 1080);
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
                max-width: 90vw;
                width: 400px;
            ">
                <!-- Toasts will be inserted here -->
            </div>
            
            <style>
                @keyframes toastSlideIn {
                    from {
                        transform: translateY(-100%) scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes toastSlideOut {
                    from {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(-100%) scale(0.8);
                        opacity: 0;
                    }
                }
                
                @keyframes toastProgress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                .toast-item {
                    background: var(--bg-primary, white);
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    padding: 16px 20px;
                    border-left: 4px solid var(--xmum-red, #c41e3a);
                    animation: toastSlideIn 0.3s ease-out;
                    pointer-events: auto;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    max-width: 100%;
                    word-wrap: break-word;
                }
                
                .toast-item.success {
                    border-left-color: var(--success-color, #28a745);
                }
                
                .toast-item.warning {
                    border-left-color: var(--warning-color, #ffc107);
                }
                
                .toast-item.error {
                    border-left-color: var(--danger-color, #dc3545);
                }
                
                .toast-item.info {
                    border-left-color: var(--info-color, #17a2b8);
                }
                
                .toast-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .toast-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .toast-text {
                    flex: 1;
                    color: var(--text-primary, #212529);
                    font-size: 14px;
                    line-height: 1.4;
                    margin: 0;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: var(--text-secondary, #6c757d);
                    cursor: pointer;
                    padding: 0;
                    margin-left: 8px;
                    flex-shrink: 0;
                    transition: color 0.2s ease;
                }
                
                .toast-close:hover {
                    color: var(--text-primary, #212529);
                }
                
                .toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--xmum-red, #c41e3a);
                    animation: toastProgress var(--duration, 3s) linear;
                    border-radius: 0 0 12px 0;
                }
                
                .toast-item.success .toast-progress {
                    background: var(--success-color, #28a745);
                }
                
                .toast-item.warning .toast-progress {
                    background: var(--warning-color, #ffc107);
                }
                
                .toast-item.error .toast-progress {
                    background: var(--danger-color, #dc3545);
                }
                
                .toast-item.info .toast-progress {
                    background: var(--info-color, #17a2b8);
                }
                
                .toast-item.removing {
                    animation: toastSlideOut 0.3s ease-in forwards;
                }
                
                @media (max-width: 576px) {
                    .toast-container {
                        top: 10px;
                        left: 10px;
                        right: 10px;
                        transform: none;
                        width: auto;
                        max-width: none;
                    }
                    
                    .toast-item {
                        padding: 12px 16px;
                        font-size: 13px;
                    }
                    
                    .toast-icon {
                        font-size: 18px;
                    }
                }
            </style>
        `;
    }

    show(message, type = 'default', duration = 3000) {
        const container = this.querySelector('.toast-container');
        const toastId = Date.now() + Math.random();
        
        // Remove oldest toast if at max capacity
        if (this.toasts.length >= this.maxToasts) {
            this.removeToast(this.toasts[0].id);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.dataset.toastId = toastId;
        toast.style.setProperty('--duration', `${duration}ms`);
        
        // Get icon based on type
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️',
            default: '💬'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icons[type] || icons.default}</div>
                <div class="toast-text">${this.escapeHtml(message)}</div>
                <button class="toast-close" onclick="this.closest('toast-msg').removeToast('${toastId}')">&times;</button>
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Add to container
        container.appendChild(toast);
        
        // Track toast
        const toastData = {
            id: toastId,
            element: toast,
            timer: null
        };
        
        this.toasts.push(toastData);
        
        // Auto remove after duration
        if (duration > 0) {
            toastData.timer = setTimeout(() => {
                this.removeToast(toastId);
            }, duration);
        }
        
        // Add click to dismiss
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                this.removeToast(toastId);
            }
        });
        
        return toastId;
    }

    removeToast(toastId) {
        const toastIndex = this.toasts.findIndex(t => t.id == toastId);
        if (toastIndex === -1) return;
        
        const toastData = this.toasts[toastIndex];
        const toast = toastData.element;
        
        // Clear timer
        if (toastData.timer) {
            clearTimeout(toastData.timer);
        }
        
        // Add removing animation
        toast.classList.add('removing');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
        
        // Remove from tracking
        this.toasts.splice(toastIndex, 1);
    }

    clearAll() {
        this.toasts.forEach(toastData => {
            if (toastData.timer) {
                clearTimeout(toastData.timer);
            }
            toastData.element.classList.add('removing');
        });
        
        setTimeout(() => {
            const container = this.querySelector('.toast-container');
            container.innerHTML = '';
            this.toasts = [];
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    // Static methods for global usage
    static show(message, type = 'default', duration = 3000) {
        let toastMsg = document.querySelector('toast-msg');
        if (!toastMsg) {
            toastMsg = document.createElement('toast-msg');
            document.body.appendChild(toastMsg);
        }
        return toastMsg.show(message, type, duration);
    }

    static success(message, duration = 3000) {
        return ToastMsg.show(message, 'success', duration);
    }

    static warning(message, duration = 4000) {
        return ToastMsg.show(message, 'warning', duration);
    }

    static error(message, duration = 5000) {
        return ToastMsg.show(message, 'error', duration);
    }

    static info(message, duration = 3000) {
        return ToastMsg.show(message, 'info', duration);
    }
}

// Register the custom element
customElements.define('toast-msg', ToastMsg);

