// Filter Sheet Web Component
class FilterSheet extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.filters = {
            cuisines: [],
            priceRange: [0, 50],
            distanceRange: [0, 5],
            rating: 0,
            searchText: ''
        };
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="filter-sheet" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-primary, white);
                border-radius: 20px 20px 0 0;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
                transform: translateY(100%);
                transition: transform 0.3s ease;
                z-index: 1001;
                max-height: var(--filter-sheet-height, 60vh);
                overflow: hidden;
            ">
                <!-- Handle -->
                <div class="sheet-handle" style="
                    width: 40px;
                    height: 4px;
                    background: var(--border-color, #dee2e6);
                    border-radius: 2px;
                    margin: 12px auto 8px;
                    cursor: pointer;
                "></div>
                
                <!-- Header -->
                <div class="sheet-header" style="
                    padding: 0 20px 16px;
                    border-bottom: 1px solid var(--border-color, #dee2e6);
                ">
                    <h5 style="margin: 0; color: var(--text-primary, #212529); font-weight: 600;">
                        筛选餐厅
                    </h5>
                </div>
                
                <!-- Content -->
                <div class="sheet-content" style="
                    padding: 20px;
                    overflow-y: auto;
                    max-height: calc(var(--filter-sheet-height, 60vh) - 80px);
                ">
                    <!-- Natural Language Input -->
                    <div class="filter-section" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            margin-bottom: 8px;
                            font-weight: 500;
                            color: var(--text-primary, #212529);
                        ">
                            🤖 智能搜索
                        </label>
                        <div style="position: relative;">
                            <input type="text" 
                                   id="nlpInput" 
                                   placeholder="例如：想吃辣面，别太贵"
                                   style="
                                       width: 100%;
                                       padding: 12px 40px 12px 16px;
                                       border: 1px solid var(--border-color, #dee2e6);
                                       border-radius: 8px;
                                       font-size: 14px;
                                       transition: border-color 0.2s ease;
                                   ">
                            <button id="nlpSubmit" style="
                                position: absolute;
                                right: 8px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: var(--xmum-red, #c41e3a);
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 6px 10px;
                                font-size: 12px;
                                cursor: pointer;
                            ">
                                解析
                            </button>
                        </div>
                    </div>
                    
                    <!-- Cuisine Types -->
                    <div class="filter-section" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            margin-bottom: 12px;
                            font-weight: 500;
                            color: var(--text-primary, #212529);
                        ">
                            🍽️ 菜系类型
                        </label>
                        <div class="cuisine-chips" style="
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;
                        ">
                            ${this.getCuisineChips()}
                        </div>
                    </div>
                    
                    <!-- Price Range -->
                    <div class="filter-section" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            margin-bottom: 12px;
                            font-weight: 500;
                            color: var(--text-primary, #212529);
                        ">
                            💰 价格范围 (RM <span id="priceMin">${this.filters.priceRange[0]}</span> - <span id="priceMax">${this.filters.priceRange[1]}</span>)
                        </label>
                        <div style="padding: 0 8px;">
                            <input type="range" 
                                   id="priceRange" 
                                   min="0" 
                                   max="50" 
                                   value="${this.filters.priceRange[1]}"
                                   style="width: 100%; accent-color: var(--xmum-red, #c41e3a);">
                        </div>
                    </div>
                    
                    <!-- Distance Range -->
                    <div class="filter-section" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            margin-bottom: 12px;
                            font-weight: 500;
                            color: var(--text-primary, #212529);
                        ">
                            📍 距离范围 (<span id="distanceValue">${this.filters.distanceRange[1]}</span> km)
                        </label>
                        <div style="padding: 0 8px;">
                            <input type="range" 
                                   id="distanceRange" 
                                   min="0.5" 
                                   max="5" 
                                   step="0.5"
                                   value="${this.filters.distanceRange[1]}"
                                   style="width: 100%; accent-color: var(--xmum-red, #c41e3a);">
                        </div>
                    </div>
                    
                    <!-- Rating Filter -->
                    <div class="filter-section" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            margin-bottom: 12px;
                            font-weight: 500;
                            color: var(--text-primary, #212529);
                        ">
                            ⭐ 最低评分
                        </label>
                        <div class="rating-stars" style="display: flex; gap: 4px;">
                            ${this.getRatingStars()}
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="filter-actions" style="
                        display: flex;
                        gap: 12px;
                        margin-top: 24px;
                        padding-top: 20px;
                        border-top: 1px solid var(--border-color, #dee2e6);
                    ">
                        <button id="clearFilters" style="
                            flex: 1;
                            padding: 12px;
                            background: var(--bg-secondary, #f8f9fa);
                            color: var(--text-secondary, #6c757d);
                            border: 1px solid var(--border-color, #dee2e6);
                            border-radius: 8px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">
                            清除筛选
                        </button>
                        <button id="applyFilters" style="
                            flex: 2;
                            padding: 12px;
                            background: var(--xmum-red, #c41e3a);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">
                            应用筛选
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Backdrop -->
            <div class="sheet-backdrop" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.3);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
            "></div>
        `;

        this.setupEventListeners();
    }

    getCuisineChips() {
        const cuisines = ['本地', '中式', '马来', '印度', '西式', '泰式', '日式', '韩式', '意式', '素食'];
        return cuisines.map(cuisine => `
            <button class="cuisine-chip" data-cuisine="${cuisine}" style="
                padding: 8px 16px;
                background: var(--bg-secondary, #f8f9fa);
                color: var(--text-primary, #212529);
                border: 1px solid var(--border-color, #dee2e6);
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            ">
                ${cuisine}
            </button>
        `).join('');
    }

    getRatingStars() {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `
                <button class="rating-star" data-rating="${i}" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: ${i <= this.filters.rating ? '#ffc107' : '#dee2e6'};
                    transition: color 0.2s ease;
                ">
                    ⭐
                </button>
            `;
        }
        return stars;
    }

    setupEventListeners() {
        const sheet = this.querySelector('.filter-sheet');
        const backdrop = this.querySelector('.sheet-backdrop');
        const handle = this.querySelector('.sheet-handle');

        // Handle click to toggle
        handle.addEventListener('click', () => this.toggle());

        // Backdrop click to close
        backdrop.addEventListener('click', () => this.close());

        // Cuisine chips
        this.querySelectorAll('.cuisine-chip').forEach(chip => {
            chip.addEventListener('click', () => this.toggleCuisine(chip));
        });

        // Rating stars
        this.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', () => this.setRating(parseInt(star.dataset.rating)));
        });

        // Price range slider
        const priceRange = this.querySelector('#priceRange');
        priceRange.addEventListener('input', (e) => {
            this.filters.priceRange[1] = parseInt(e.target.value);
            this.querySelector('#priceMax').textContent = e.target.value;
        });

        // Distance range slider
        const distanceRange = this.querySelector('#distanceRange');
        distanceRange.addEventListener('input', (e) => {
            this.filters.distanceRange[1] = parseFloat(e.target.value);
            this.querySelector('#distanceValue').textContent = e.target.value;
        });

        // NLP input
        const nlpInput = this.querySelector('#nlpInput');
        const nlpSubmit = this.querySelector('#nlpSubmit');
        
        nlpSubmit.addEventListener('click', () => this.parseNaturalLanguage());
        nlpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.parseNaturalLanguage();
            }
        });

        // Action buttons
        this.querySelector('#clearFilters').addEventListener('click', () => this.clearFilters());
        this.querySelector('#applyFilters').addEventListener('click', () => this.applyFilters());

        // Prevent sheet content clicks from closing
        sheet.addEventListener('click', (e) => e.stopPropagation());
    }

    toggleCuisine(chip) {
        const cuisine = chip.dataset.cuisine;
        const index = this.filters.cuisines.indexOf(cuisine);
        
        if (index === -1) {
            this.filters.cuisines.push(cuisine);
            chip.style.background = 'var(--xmum-red, #c41e3a)';
            chip.style.color = 'white';
            chip.style.borderColor = 'var(--xmum-red, #c41e3a)';
        } else {
            this.filters.cuisines.splice(index, 1);
            chip.style.background = 'var(--bg-secondary, #f8f9fa)';
            chip.style.color = 'var(--text-primary, #212529)';
            chip.style.borderColor = 'var(--border-color, #dee2e6)';
        }
    }

    setRating(rating) {
        this.filters.rating = rating;
        this.querySelectorAll('.rating-star').forEach((star, index) => {
            star.style.color = index < rating ? '#ffc107' : '#dee2e6';
        });
    }

    async parseNaturalLanguage() {
        const input = this.querySelector('#nlpInput').value.trim();
        if (!input) return;

        const submitBtn = this.querySelector('#nlpSubmit');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = '...';
            submitBtn.disabled = true;

            // Dispatch parse event
            const event = new CustomEvent('parse-llm', {
                detail: { text: input },
                bubbles: true
            });
            this.dispatchEvent(event);

            // Simple keyword-based parsing as fallback
            this.parseKeywords(input);

        } catch (error) {
            console.error('NLP parsing error:', error);
            this.showToast('解析失败，请手动选择筛选条件');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    parseKeywords(text) {
        const lowerText = text.toLowerCase();
        
        // Cuisine keywords
        const cuisineMap = {
            '中式': ['中式', '中餐', '中国'],
            '马来': ['马来', '马来西亚', 'malay'],
            '印度': ['印度', 'indian', '咖喱'],
            '西式': ['西式', '西餐', 'western'],
            '泰式': ['泰式', '泰国', 'thai'],
            '日式': ['日式', '日本', 'japanese', '寿司'],
            '韩式': ['韩式', '韩国', 'korean', '烧烤'],
            '意式': ['意式', '意大利', 'italian', '披萨']
        };

        // Clear current cuisines
        this.filters.cuisines = [];
        this.querySelectorAll('.cuisine-chip').forEach(chip => {
            chip.style.background = 'var(--bg-secondary, #f8f9fa)';
            chip.style.color = 'var(--text-primary, #212529)';
            chip.style.borderColor = 'var(--border-color, #dee2e6)';
        });

        // Find matching cuisines
        Object.entries(cuisineMap).forEach(([cuisine, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                this.filters.cuisines.push(cuisine);
                const chip = this.querySelector(`[data-cuisine="${cuisine}"]`);
                if (chip) {
                    chip.style.background = 'var(--xmum-red, #c41e3a)';
                    chip.style.color = 'white';
                    chip.style.borderColor = 'var(--xmum-red, #c41e3a)';
                }
            }
        });

        // Price keywords
        if (lowerText.includes('便宜') || lowerText.includes('不贵') || lowerText.includes('实惠')) {
            this.filters.priceRange[1] = 15;
            this.querySelector('#priceRange').value = 15;
            this.querySelector('#priceMax').textContent = '15';
        } else if (lowerText.includes('贵') || lowerText.includes('高档')) {
            this.filters.priceRange[1] = 50;
            this.querySelector('#priceRange').value = 50;
            this.querySelector('#priceMax').textContent = '50';
        }

        this.showToast('已根据您的描述更新筛选条件');
    }

    clearFilters() {
        // Reset filters
        this.filters = {
            cuisines: [],
            priceRange: [0, 50],
            distanceRange: [0, 5],
            rating: 0,
            searchText: ''
        };

        // Reset UI
        this.querySelectorAll('.cuisine-chip').forEach(chip => {
            chip.style.background = 'var(--bg-secondary, #f8f9fa)';
            chip.style.color = 'var(--text-primary, #212529)';
            chip.style.borderColor = 'var(--border-color, #dee2e6)';
        });

        this.querySelectorAll('.rating-star').forEach(star => {
            star.style.color = '#dee2e6';
        });

        this.querySelector('#priceRange').value = 50;
        this.querySelector('#priceMax').textContent = '50';
        this.querySelector('#distanceRange').value = 5;
        this.querySelector('#distanceValue').textContent = '5';
        this.querySelector('#nlpInput').value = '';

        this.showToast('已清除所有筛选条件');
    }

    applyFilters() {
        // Dispatch filters updated event
        const event = new CustomEvent('filters-updated', {
            detail: { filters: this.filters },
            bubbles: true
        });
        this.dispatchEvent(event);

        this.close();
        this.showToast('筛选条件已应用');
    }

    open() {
        this.isOpen = true;
        const sheet = this.querySelector('.filter-sheet');
        const backdrop = this.querySelector('.sheet-backdrop');
        
        backdrop.style.visibility = 'visible';
        backdrop.style.opacity = '1';
        sheet.style.transform = 'translateY(0)';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        const sheet = this.querySelector('.filter-sheet');
        const backdrop = this.querySelector('.sheet-backdrop');
        
        backdrop.style.opacity = '0';
        backdrop.style.visibility = 'hidden';
        sheet.style.transform = 'translateY(100%)';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Update filter button state
        const fabFilter = document.querySelector('fab-filter');
        if (fabFilter) {
            fabFilter.setActive(false);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    showToast(message) {
        const toastMsg = document.querySelector('toast-msg');
        if (toastMsg) {
            toastMsg.show(message);
        }
    }

    // Public getter for current filters
    get value() {
        return { ...this.filters };
    }

    // Public setter for filters
    set value(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.updateUI();
    }

    updateUI() {
        // Update cuisine chips
        this.querySelectorAll('.cuisine-chip').forEach(chip => {
            const cuisine = chip.dataset.cuisine;
            if (this.filters.cuisines.includes(cuisine)) {
                chip.style.background = 'var(--xmum-red, #c41e3a)';
                chip.style.color = 'white';
                chip.style.borderColor = 'var(--xmum-red, #c41e3a)';
            } else {
                chip.style.background = 'var(--bg-secondary, #f8f9fa)';
                chip.style.color = 'var(--text-primary, #212529)';
                chip.style.borderColor = 'var(--border-color, #dee2e6)';
            }
        });

        // Update rating stars
        this.querySelectorAll('.rating-star').forEach((star, index) => {
            star.style.color = index < this.filters.rating ? '#ffc107' : '#dee2e6';
        });

        // Update sliders
        this.querySelector('#priceRange').value = this.filters.priceRange[1];
        this.querySelector('#priceMax').textContent = this.filters.priceRange[1];
        this.querySelector('#distanceRange').value = this.filters.distanceRange[1];
        this.querySelector('#distanceValue').textContent = this.filters.distanceRange[1];
    }
}

// Register the custom element
customElements.define('filter-sheet', FilterSheet);

