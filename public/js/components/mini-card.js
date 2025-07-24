// Mini Card Web Component
class MiniCard extends HTMLElement {
    constructor() {
        super();
        this.isVisible = false;
        this.currentRestaurant = null;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="mini-card" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-primary, white);
                border-radius: 20px 20px 0 0;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
                transform: translateY(100%);
                transition: transform 0.3s ease;
                z-index: 1002;
                height: var(--mini-card-height, 40vh);
                overflow: hidden;
                cursor: grab;
            ">
                <!-- Handle -->
                <div class="card-handle" style="
                    width: 40px;
                    height: 4px;
                    background: var(--border-color, #dee2e6);
                    border-radius: 2px;
                    margin: 12px auto 8px;
                    cursor: pointer;
                "></div>
                
                <!-- Content -->
                <div class="card-content" style="
                    padding: 0 20px 20px;
                    height: calc(100% - 28px);
                    overflow-y: auto;
                ">
                    <!-- Restaurant Header -->
                    <div class="restaurant-header" style="
                        display: flex;
                        align-items: center;
                        margin-bottom: 16px;
                        padding-bottom: 16px;
                        border-bottom: 1px solid var(--border-color, #dee2e6);
                    ">
                        <div class="restaurant-image" style="
                            width: 60px;
                            height: 60px;
                            border-radius: 12px;
                            background: var(--bg-secondary, #f8f9fa);
                            margin-right: 16px;
                            overflow: hidden;
                            flex-shrink: 0;
                        ">
                            <img id="restaurantImage" style="
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                display: none;
                            ">
                            <div class="image-placeholder" style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 24px;
                                color: var(--text-secondary, #6c757d);
                            ">
                                🍽️
                            </div>
                        </div>
                        
                        <div class="restaurant-info" style="flex: 1; min-width: 0;">
                            <h6 id="restaurantName" style="
                                margin: 0 0 4px 0;
                                font-weight: 600;
                                color: var(--text-primary, #212529);
                                font-size: 18px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            ">
                                餐厅名称
                            </h6>
                            
                            <div class="restaurant-meta" style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                margin-bottom: 4px;
                            ">
                                <div class="rating" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 2px;
                                ">
                                    <span style="color: #ffc107; font-size: 14px;">⭐</span>
                                    <span id="restaurantRating" style="
                                        font-size: 14px;
                                        color: var(--text-primary, #212529);
                                        font-weight: 500;
                                    ">4.5</span>
                                </div>
                                
                                <div class="distance" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 2px;
                                ">
                                    <span style="color: var(--text-secondary, #6c757d); font-size: 14px;">📍</span>
                                    <span id="restaurantDistance" style="
                                        font-size: 14px;
                                        color: var(--text-secondary, #6c757d);
                                    ">0.5km</span>
                                </div>
                                
                                <div class="price" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 2px;
                                ">
                                    <span style="color: var(--text-secondary, #6c757d); font-size: 14px;">💰</span>
                                    <span id="restaurantPrice" style="
                                        font-size: 14px;
                                        color: var(--text-secondary, #6c757d);
                                    ">RM 8</span>
                                </div>
                            </div>
                            
                            <div class="cuisines" id="restaurantCuisines" style="
                                display: flex;
                                gap: 4px;
                                flex-wrap: wrap;
                            ">
                                <!-- Cuisine tags will be inserted here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="restaurant-description" style="margin-bottom: 16px;">
                        <p id="restaurantDescription" style="
                            margin: 0;
                            color: var(--text-secondary, #6c757d);
                            font-size: 14px;
                            line-height: 1.5;
                        ">
                            餐厅描述信息...
                        </p>
                    </div>
                    
                    <!-- Action Button -->
                    <div class="card-actions" style="
                        margin-top: auto;
                        padding-top: 16px;
                    ">
                        <button id="viewDetailsBtn" style="
                            width: 100%;
                            padding: 12px;
                            background: var(--xmum-red, #c41e3a);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 500;
                            font-size: 16px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        ">
                            查看详情 ↑
                        </button>
                    </div>
                    
                    <!-- Swipe Up Hint -->
                    <div class="swipe-hint" style="
                        text-align: center;
                        margin-top: 12px;
                        color: var(--text-muted, #868e96);
                        font-size: 12px;
                    ">
                        上滑查看更多详情
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const card = this.querySelector('.mini-card');
        const handle = this.querySelector('.card-handle');
        const viewDetailsBtn = this.querySelector('#viewDetailsBtn');

        // Handle click to toggle
        handle.addEventListener('click', () => this.hide());

        // View details button
        viewDetailsBtn.addEventListener('click', () => this.enterDetail());

        // Touch events for swipe up
        card.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        card.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        card.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Mouse events for desktop
        card.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        card.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        card.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Prevent default drag behavior
        card.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
        this.currentY = this.startY;
        this.isDragging = true;
        
        const card = this.querySelector('.mini-card');
        card.style.transition = 'none';
        card.style.cursor = 'grabbing';
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentY = e.touches[0].clientY;
        const deltaY = this.currentY - this.startY;
        
        // Only allow upward swipe and small downward movement
        if (deltaY <= 50) {
            const card = this.querySelector('.mini-card');
            card.style.transform = `translateY(${Math.max(deltaY, -200)}px)`;
            
            // Prevent scrolling when swiping up
            if (deltaY < 0) {
                e.preventDefault();
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const deltaY = this.currentY - this.startY;
        const card = this.querySelector('.mini-card');
        
        card.style.transition = 'transform 0.3s ease';
        card.style.cursor = 'grab';
        
        // Determine action based on swipe distance
        if (deltaY < -100) {
            // Swipe up significantly - enter detail
            this.enterDetail();
        } else if (deltaY > 30) {
            // Swipe down - hide card
            this.hide();
        } else {
            // Return to original position
            card.style.transform = 'translateY(0)';
        }
        
        this.isDragging = false;
    }

    handleMouseDown(e) {
        // Only handle if clicking on handle or empty areas
        if (e.target.closest('button') || e.target.closest('a')) return;
        
        this.startY = e.clientY;
        this.currentY = this.startY;
        this.isDragging = true;
        
        const card = this.querySelector('.mini-card');
        card.style.transition = 'none';
        card.style.cursor = 'grabbing';
        
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.currentY = e.clientY;
        const deltaY = this.currentY - this.startY;
        
        // Only allow upward drag and small downward movement
        if (deltaY <= 50) {
            const card = this.querySelector('.mini-card');
            card.style.transform = `translateY(${Math.max(deltaY, -200)}px)`;
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const deltaY = this.currentY - this.startY;
        const card = this.querySelector('.mini-card');
        
        card.style.transition = 'transform 0.3s ease';
        card.style.cursor = 'grab';
        
        // Determine action based on drag distance
        if (deltaY < -100) {
            // Drag up significantly - enter detail
            this.enterDetail();
        } else if (deltaY > 30) {
            // Drag down - hide card
            this.hide();
        } else {
            // Return to original position
            card.style.transform = 'translateY(0)';
        }
        
        this.isDragging = false;
    }

    show(restaurant) {
        this.currentRestaurant = restaurant;
        this.isVisible = true;
        
        // Update content
        this.updateContent(restaurant);
        
        // Show card
        const card = this.querySelector('.mini-card');
        card.style.transform = 'translateY(0)';
        
        // Add entrance animation
        setTimeout(() => {
            card.style.animation = 'slideUpBounce 0.4s ease-out';
        }, 50);
    }

    hide() {
        this.isVisible = false;
        const card = this.querySelector('.mini-card');
        card.style.transform = 'translateY(100%)';
        card.style.animation = '';
    }

    updateContent(restaurant) {
        // Update restaurant name
        this.querySelector('#restaurantName').textContent = restaurant.name || '未知餐厅';
        
        // Update rating
        const rating = restaurant.rating || 4.0 + Math.random();
        this.querySelector('#restaurantRating').textContent = rating.toFixed(1);
        
        // Update distance
        const distance = restaurant.distance || this.calculateDistance(restaurant);
        this.querySelector('#restaurantDistance').textContent = distance.toFixed(1) + 'km';
        
        // Update price
        const avgPrice = restaurant.avg_price || 10;
        this.querySelector('#restaurantPrice').textContent = `RM ${avgPrice}`;
        
        // Update description
        const description = restaurant.description || '这家餐厅提供美味的食物和优质的服务。';
        this.querySelector('#restaurantDescription').textContent = description;
        
        // Update cuisines
        const cuisinesContainer = this.querySelector('#restaurantCuisines');
        cuisinesContainer.innerHTML = '';
        
        if (restaurant.cuisines) {
            const cuisines = restaurant.cuisines.split(',');
            cuisines.forEach(cuisine => {
                const tag = document.createElement('span');
                tag.style.cssText = `
                    background: var(--xmum-red, #c41e3a);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    white-space: nowrap;
                `;
                tag.textContent = cuisine.trim();
                cuisinesContainer.appendChild(tag);
            });
        }
        
        // Update image if available
        const img = this.querySelector('#restaurantImage');
        const placeholder = this.querySelector('.image-placeholder');
        
        if (restaurant.photo_url) {
            img.src = restaurant.photo_url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            img.onerror = () => {
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    calculateDistance(restaurant) {
        // Simple distance calculation (placeholder)
        // In real app, this would use user's location
        const baseDistance = 0.3;
        const randomOffset = Math.random() * 1.5;
        return baseDistance + randomOffset;
    }

    enterDetail() {
        if (!this.currentRestaurant) return;
        
        // Dispatch enter detail event
        const event = new CustomEvent('enter-detail', {
            detail: { restaurant: this.currentRestaurant },
            bubbles: true
        });
        this.dispatchEvent(event);
        
        // Navigate to detail page
        window.location.href = `detail.html?id=${this.currentRestaurant.id}`;
    }

    // Public methods
    isShowing() {
        return this.isVisible;
    }

    getCurrentRestaurant() {
        return this.currentRestaurant;
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUpBounce {
        0% {
            transform: translateY(100%);
        }
        70% {
            transform: translateY(-10px);
        }
        100% {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Register the custom element
customElements.define('mini-card', MiniCard);

