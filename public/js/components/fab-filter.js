// FAB Filter Web Component
class FabFilter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="fab-filter" style="
                position: fixed;
                bottom: 60px;
                right: 20px;
                z-index: 1000;
            ">
                <button class="fab-btn" style="
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--bg-primary, white);
                    color: var(--xmum-red, #c41e3a);
                    border: 2px solid var(--xmum-red, #c41e3a);
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                " title="筛选餐厅">
                    🔍
                    <div class="ripple-effect" style="
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(196, 30, 58, 0.2);
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        pointer-events: none;
                    "></div>
                </button>
            </div>
            
            <style>
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                .fab-filter .fab-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    background: var(--xmum-red, #c41e3a);
                    color: white;
                }
                
                .fab-filter .fab-btn:active {
                    transform: translateY(0);
                }
                
                .fab-filter .fab-btn.active {
                    background: var(--xmum-red, #c41e3a);
                    color: white;
                    box-shadow: 0 4px 12px rgba(196, 30, 58, 0.4);
                }
                
                @media (max-width: 576px) {
                    .fab-filter {
                        bottom: 50px;
                        right: 16px;
                    }
                    
                    .fab-filter .fab-btn {
                        width: 44px;
                        height: 44px;
                        font-size: 18px;
                    }
                }
            </style>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const fabBtn = this.querySelector('.fab-btn');

        fabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Add ripple effect
            this.addRippleEffect(e);

            // Toggle active state
            fabBtn.classList.toggle('active');

            // Dispatch open filter event
            const event = new CustomEvent('open-filter', {
                detail: { isOpen: fabBtn.classList.contains('active') },
                bubbles: true
            });
            this.dispatchEvent(event);

            // Update icon based on state
            if (fabBtn.classList.contains('active')) {
                fabBtn.innerHTML = '✕<div class="ripple-effect" style="position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.3); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;"></div>';
                fabBtn.title = '关闭筛选';
            } else {
                fabBtn.innerHTML = '🔍<div class="ripple-effect" style="position: absolute; border-radius: 50%; background: rgba(196, 30, 58, 0.2); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;"></div>';
                fabBtn.title = '筛选餐厅';
            }
        });
    }

    addRippleEffect(e) {
        const fabBtn = this.querySelector('.fab-btn');
        const ripple = fabBtn.querySelector('.ripple-effect');
        
        const rect = fabBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (e.clientX || e.touches[0].clientX) - rect.left - size / 2;
        const y = (e.clientY || e.touches[0].clientY) - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        
        setTimeout(() => {
            ripple.style.animation = '';
        }, 600);
    }

    // Public method to set active state
    setActive(isActive) {
        const fabBtn = this.querySelector('.fab-btn');
        
        if (isActive) {
            fabBtn.classList.add('active');
            fabBtn.innerHTML = '✕<div class="ripple-effect" style="position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.3); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;"></div>';
            fabBtn.title = '关闭筛选';
        } else {
            fabBtn.classList.remove('active');
            fabBtn.innerHTML = '🔍<div class="ripple-effect" style="position: absolute; border-radius: 50%; background: rgba(196, 30, 58, 0.2); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;"></div>';
            fabBtn.title = '筛选餐厅';
        }
    }

    // Public method to check if active
    isActive() {
        const fabBtn = this.querySelector('.fab-btn');
        return fabBtn.classList.contains('active');
    }
}

// Register the custom element
customElements.define('fab-filter', FabFilter);

