// FAB Recommend Web Component
class FabRecommend extends HTMLElement {
    constructor() {
        super();
        this.sortMode = 'random'; // 'random', 'distance', 'rating', 'price'
        this.longPressTimer = null;
        this.isLongPress = false;
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="fab-recommend" style="
                position: fixed;
                bottom: 120px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            ">
                <div class="sort-indicator" style="
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    display: none;
                    white-space: nowrap;
                ">
                    ${this.getSortModeText()}
                </div>
                
                <button class="fab-btn" style="
                    width: var(--fab-size, 56px);
                    height: var(--fab-size, 56px);
                    border-radius: 50%;
                    background: var(--xmum-red, #c41e3a);
                    color: white;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                " title="点击随机推荐，长按切换排序方式">
                    🎲
                    <div class="ripple-effect" style="
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
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
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .fab-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }
                
                .fab-btn:active {
                    transform: translateY(0);
                }
                
                .fab-btn.long-press {
                    animation: pulse 0.5s ease-in-out;
                    background: var(--xmum-blue, #003366);
                }
                
                @media (max-width: 576px) {
                    .fab-recommend {
                        bottom: 100px;
                        right: 16px;
                    }
                }
            </style>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const fabBtn = this.querySelector('.fab-btn');
        const sortIndicator = this.querySelector('.sort-indicator');

        // Mouse events
        fabBtn.addEventListener('mousedown', (e) => this.startLongPress(e));
        fabBtn.addEventListener('mouseup', (e) => this.endLongPress(e));
        fabBtn.addEventListener('mouseleave', (e) => this.cancelLongPress(e));

        // Touch events for mobile
        fabBtn.addEventListener('touchstart', (e) => this.startLongPress(e));
        fabBtn.addEventListener('touchend', (e) => this.endLongPress(e));
        fabBtn.addEventListener('touchcancel', (e) => this.cancelLongPress(e));

        // Click event
        fabBtn.addEventListener('click', (e) => {
            if (!this.isLongPress) {
                this.handleClick(e);
            }
        });

        // Show sort mode on hover
        fabBtn.addEventListener('mouseenter', () => {
            sortIndicator.style.display = 'block';
            sortIndicator.textContent = this.getSortModeText();
        });

        fabBtn.addEventListener('mouseleave', () => {
            if (!this.isLongPress) {
                sortIndicator.style.display = 'none';
            }
        });
    }

    startLongPress(e) {
        this.isLongPress = false;
        this.longPressTimer = setTimeout(() => {
            this.isLongPress = true;
            this.handleLongPress(e);
        }, 800); // 800ms for long press
    }

    endLongPress(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        const fabBtn = this.querySelector('.fab-btn');
        fabBtn.classList.remove('long-press');

        // Reset long press flag after a short delay
        setTimeout(() => {
            this.isLongPress = false;
        }, 100);
    }

    cancelLongPress(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.isLongPress = false;

        const fabBtn = this.querySelector('.fab-btn');
        fabBtn.classList.remove('long-press');
    }

    handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Add ripple effect
        this.addRippleEffect(e);

        // Dispatch recommend event
        const event = new CustomEvent('recommend-click', {
            detail: { sortMode: this.sortMode },
            bubbles: true
        });
        this.dispatchEvent(event);

        // Show toast message
        this.showToast(`正在为您推荐餐厅... (${this.getSortModeText()})`);
    }

    handleLongPress(e) {
        e.preventDefault();
        e.stopPropagation();

        const fabBtn = this.querySelector('.fab-btn');
        const sortIndicator = this.querySelector('.sort-indicator');

        // Add long press visual feedback
        fabBtn.classList.add('long-press');

        // Cycle through sort modes
        this.cycleSortMode();

        // Update indicator
        sortIndicator.textContent = this.getSortModeText();
        sortIndicator.style.display = 'block';

        // Hide indicator after 2 seconds
        setTimeout(() => {
            sortIndicator.style.display = 'none';
        }, 2000);

        // Show toast message
        this.showToast(`排序方式已切换为: ${this.getSortModeText()}`);

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    cycleSortMode() {
        const modes = ['random', 'distance', 'rating', 'price'];
        const currentIndex = modes.indexOf(this.sortMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.sortMode = modes[nextIndex];

        // Update button icon based on sort mode
        const fabBtn = this.querySelector('.fab-btn');
        const icons = {
            'random': '🎲',
            'distance': '📍',
            'rating': '⭐',
            'price': '💰'
        };
        fabBtn.innerHTML = icons[this.sortMode] + fabBtn.querySelector('.ripple-effect').outerHTML;
    }

    getSortModeText() {
        const texts = {
            'random': '随机推荐',
            'distance': '距离优先',
            'rating': '评分优先',
            'price': '价格优先'
        };
        return texts[this.sortMode] || '随机推荐';
    }

    addRippleEffect(e) {
        const fabBtn = this.querySelector('.fab-btn');
        const ripple = fabBtn.querySelector('.ripple-effect');
        
        const rect = fabBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left - size / 2;
        const y = (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        
        setTimeout(() => {
            ripple.style.animation = '';
        }, 600);
    }

    showToast(message) {
        const toastMsg = document.querySelector('toast-msg');
        if (toastMsg) {
            toastMsg.show(message);
        }
    }

    // Public method to get current sort mode
    getSortMode() {
        return this.sortMode;
    }

    // Public method to set sort mode
    setSortMode(mode) {
        if (['random', 'distance', 'rating', 'price'].includes(mode)) {
            this.sortMode = mode;
            
            // Update button icon
            const fabBtn = this.querySelector('.fab-btn');
            const icons = {
                'random': '🎲',
                'distance': '📍',
                'rating': '⭐',
                'price': '💰'
            };
            fabBtn.innerHTML = icons[this.sortMode] + '<div class="ripple-effect" style="position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.3); transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;"></div>';
            
            // Update indicator
            const sortIndicator = this.querySelector('.sort-indicator');
            sortIndicator.textContent = this.getSortModeText();
        }
    }
}

// Register the custom element
customElements.define('fab-recommend', FabRecommend);

