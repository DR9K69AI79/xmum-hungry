// Upload Modal Web Component
import { apiRequest, buildApiUrl } from '../config.js';

class UploadModal extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.currentDishId = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingTimer = null;
        this.recordingTime = 0;
        this.maxRecordingTime = 15; // 15 seconds
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="upload-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            ">
                <div class="modal-content" style="
                    background: var(--bg-primary, white);
                    border-radius: 16px;
                    padding: 24px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    transform: scale(0.8);
                    transition: transform 0.3s ease;
                ">
                    <!-- Header -->
                    <div class="modal-header" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        padding-bottom: 16px;
                        border-bottom: 1px solid var(--border-color, #dee2e6);
                    ">
                        <h5 style="margin: 0; color: var(--text-primary, #212529); font-weight: 600;">
                            添加评价
                        </h5>
                        <button class="close-btn" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            color: var(--text-secondary, #6c757d);
                            cursor: pointer;
                            padding: 0;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                        " onclick="this.closest('upload-modal').close()">
                            ×
                        </button>
                    </div>
                    
                    <!-- Form -->
                    <form id="reviewForm" enctype="multipart/form-data">
                        <!-- Dish Info -->
                        <div class="dish-info" style="
                            background: var(--bg-secondary, #f8f9fa);
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 20px;
                        ">
                            <div style="font-weight: 500; color: var(--text-primary, #212529);" id="selectedDishName">
                                请先选择菜品
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary, #6c757d);" id="selectedDishPrice">
                                -
                            </div>
                        </div>
                        
                        <!-- Rating -->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                font-weight: 500;
                                color: var(--text-primary, #212529);
                            ">
                                评分 <span style="color: var(--danger-color, #dc3545);">*</span>
                            </label>
                            <div class="rating-input" style="display: flex; gap: 4px;">
                                ${this.generateRatingStars()}
                            </div>
                        </div>
                        
                        <!-- Comment -->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                font-weight: 500;
                                color: var(--text-primary, #212529);
                            ">
                                评价内容
                            </label>
                            <textarea 
                                id="commentInput" 
                                placeholder="分享您的用餐体验..."
                                style="
                                    width: 100%;
                                    min-height: 80px;
                                    padding: 12px;
                                    border: 1px solid var(--border-color, #dee2e6);
                                    border-radius: 8px;
                                    resize: vertical;
                                    font-family: inherit;
                                    font-size: 14px;
                                    transition: border-color 0.2s ease;
                                "
                            ></textarea>
                        </div>
                        
                        <!-- Photo Upload -->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                font-weight: 500;
                                color: var(--text-primary, #212529);
                            ">
                                📷 上传照片
                            </label>
                            <div class="photo-upload" style="
                                border: 2px dashed var(--border-color, #dee2e6);
                                border-radius: 8px;
                                padding: 20px;
                                text-align: center;
                                cursor: pointer;
                                transition: all 0.2s ease;
                            " onclick="this.querySelector('#photoInput').click()">
                                <input type="file" id="photoInput" accept="image/*" style="display: none;">
                                <div class="upload-placeholder">
                                    <div style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;">📷</div>
                                    <div style="color: var(--text-secondary, #6c757d); font-size: 14px;">
                                        点击选择照片
                                    </div>
                                </div>
                                <div class="photo-preview" style="display: none;">
                                    <img id="photoPreview" style="
                                        max-width: 100%;
                                        max-height: 200px;
                                        border-radius: 8px;
                                        margin-bottom: 8px;
                                    ">
                                    <div>
                                        <button type="button" onclick="this.closest('upload-modal').removePhoto()" style="
                                            background: var(--danger-color, #dc3545);
                                            color: white;
                                            border: none;
                                            padding: 4px 12px;
                                            border-radius: 4px;
                                            font-size: 12px;
                                            cursor: pointer;
                                        ">
                                            移除照片
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Audio Recording -->
                        <div class="form-group" style="margin-bottom: 24px;">
                            <label style="
                                display: block;
                                margin-bottom: 8px;
                                font-weight: 500;
                                color: var(--text-primary, #212529);
                            ">
                                🎤 语音评价 (最长15秒)
                            </label>
                            
                            <div class="audio-controls" style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                padding: 16px;
                                background: var(--bg-secondary, #f8f9fa);
                                border-radius: 8px;
                            ">
                                <button type="button" id="recordBtn" onclick="this.closest('upload-modal').toggleRecording()" style="
                                    width: 48px;
                                    height: 48px;
                                    border-radius: 50%;
                                    border: none;
                                    background: var(--xmum-red, #c41e3a);
                                    color: white;
                                    font-size: 20px;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    🎤
                                </button>
                                
                                <div class="recording-info" style="flex: 1;">
                                    <div id="recordingStatus" style="
                                        font-weight: 500;
                                        color: var(--text-primary, #212529);
                                        margin-bottom: 2px;
                                    ">
                                        点击开始录音
                                    </div>
                                    <div id="recordingTimer" style="
                                        font-size: 12px;
                                        color: var(--text-secondary, #6c757d);
                                    ">
                                        00:00 / 00:15
                                    </div>
                                </div>
                                
                                <button type="button" id="playBtn" onclick="this.closest('upload-modal').playRecording()" style="
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    border: 1px solid var(--border-color, #dee2e6);
                                    background: var(--bg-primary, white);
                                    color: var(--text-primary, #212529);
                                    font-size: 16px;
                                    cursor: pointer;
                                    display: none;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    ▶️
                                </button>
                                
                                <button type="button" id="deleteAudioBtn" onclick="this.closest('upload-modal').deleteRecording()" style="
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    border: 1px solid var(--danger-color, #dc3545);
                                    background: var(--bg-primary, white);
                                    color: var(--danger-color, #dc3545);
                                    font-size: 16px;
                                    cursor: pointer;
                                    display: none;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        <!-- Submit Button -->
                        <div class="form-actions" style="
                            display: flex;
                            gap: 12px;
                            justify-content: flex-end;
                        ">
                            <button type="button" onclick="this.closest('upload-modal').close()" style="
                                padding: 12px 24px;
                                background: var(--bg-secondary, #f8f9fa);
                                color: var(--text-secondary, #6c757d);
                                border: 1px solid var(--border-color, #dee2e6);
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                                transition: all 0.2s ease;
                            ">
                                取消
                            </button>
                            <button type="submit" id="submitBtn" style="
                                padding: 12px 24px;
                                background: var(--xmum-red, #c41e3a);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                                transition: all 0.2s ease;
                            ">
                                提交评价
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    generateRatingStars() {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `
                <button type="button" class="rating-star" data-rating="${i}" style="
                    background: none;
                    border: none;
                    font-size: 32px;
                    cursor: pointer;
                    color: #dee2e6;
                    transition: color 0.2s ease;
                    padding: 4px;
                ">
                    ⭐
                </button>
            `;
        }
        return stars;
    }

    setupEventListeners() {
        // Rating stars
        this.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', () => this.setRating(parseInt(star.dataset.rating)));
            star.addEventListener('mouseover', () => this.highlightRating(parseInt(star.dataset.rating)));
        });

        this.querySelector('.rating-input').addEventListener('mouseleave', () => {
            this.highlightRating(this.selectedRating || 0);
        });

        // Photo input
        this.querySelector('#photoInput').addEventListener('change', (e) => this.handlePhotoSelect(e));

        // Form submission
        this.querySelector('#reviewForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Close on backdrop click
        this.querySelector('.upload-modal').addEventListener('click', (e) => {
            if (e.target === this.querySelector('.upload-modal')) {
                this.close();
            }
        });

        // Prevent modal content clicks from closing
        this.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    }

    setRating(rating) {
        this.selectedRating = rating;
        this.highlightRating(rating);
    }

    highlightRating(rating) {
        this.querySelectorAll('.rating-star').forEach((star, index) => {
            star.style.color = index < rating ? '#ffc107' : '#dee2e6';
        });
    }

    handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('图片大小不能超过5MB', 'error');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = this.querySelector('#photoPreview');
            const placeholder = this.querySelector('.upload-placeholder');
            const previewContainer = this.querySelector('.photo-preview');

            preview.src = e.target.result;
            placeholder.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removePhoto() {
        const photoInput = this.querySelector('#photoInput');
        const placeholder = this.querySelector('.upload-placeholder');
        const previewContainer = this.querySelector('.photo-preview');

        photoInput.value = '';
        placeholder.style.display = 'block';
        previewContainer.style.display = 'none';
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.audioChunks = [];
            this.recordingTime = 0;
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.recordedAudio = audioBlob;
                this.updateAudioUI('recorded');
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.updateAudioUI('recording');
            
            // Start timer
            this.recordingTimer = setInterval(() => {
                this.recordingTime++;
                this.updateRecordingTimer();
                
                if (this.recordingTime >= this.maxRecordingTime) {
                    this.stopRecording();
                }
            }, 1000);

        } catch (error) {
            console.error('Recording error:', error);
            this.showToast('无法访问麦克风，请检查权限设置', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            if (this.recordingTimer) {
                clearInterval(this.recordingTimer);
                this.recordingTimer = null;
            }
        }
    }

    updateAudioUI(state) {
        const recordBtn = this.querySelector('#recordBtn');
        const playBtn = this.querySelector('#playBtn');
        const deleteBtn = this.querySelector('#deleteAudioBtn');
        const status = this.querySelector('#recordingStatus');

        switch (state) {
            case 'idle':
                recordBtn.innerHTML = '🎤';
                recordBtn.style.background = 'var(--xmum-red, #c41e3a)';
                playBtn.style.display = 'none';
                deleteBtn.style.display = 'none';
                status.textContent = '点击开始录音';
                break;
                
            case 'recording':
                recordBtn.innerHTML = '⏹️';
                recordBtn.style.background = 'var(--danger-color, #dc3545)';
                playBtn.style.display = 'none';
                deleteBtn.style.display = 'none';
                status.textContent = '正在录音...';
                break;
                
            case 'recorded':
                recordBtn.innerHTML = '🎤';
                recordBtn.style.background = 'var(--xmum-red, #c41e3a)';
                playBtn.style.display = 'flex';
                deleteBtn.style.display = 'flex';
                status.textContent = '录音完成';
                break;
        }
    }

    updateRecordingTimer() {
        const timer = this.querySelector('#recordingTimer');
        const current = String(this.recordingTime).padStart(2, '0');
        const max = String(this.maxRecordingTime).padStart(2, '0');
        timer.textContent = `00:${current} / 00:${max}`;
    }

    playRecording() {
        if (this.recordedAudio) {
            const audio = new Audio(URL.createObjectURL(this.recordedAudio));
            audio.play();
        }
    }

    deleteRecording() {
        this.recordedAudio = null;
        this.recordingTime = 0;
        this.updateAudioUI('idle');
        this.updateRecordingTimer();
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.selectedRating) {
            this.showToast('请选择评分', 'warning');
            return;
        }

        if (!this.currentDishId) {
            this.showToast('请先选择菜品', 'warning');
            return;
        }

        const submitBtn = this.querySelector('#submitBtn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span> 提交中...';

            const formData = new FormData();
            formData.append('dish_id', this.currentDishId);
            formData.append('stars', this.selectedRating);
            formData.append('comment', this.querySelector('#commentInput').value.trim());

            // Add photo if selected
            const photoInput = this.querySelector('#photoInput');
            if (photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }

            // Add audio if recorded
            if (this.recordedAudio) {
                formData.append('audio', this.recordedAudio, 'review.webm');
            }

            const result = await apiRequest('/api/api.php?action=addReview', {
                method: 'POST',
                body: formData
            });

            if (result.ok) {
                this.showToast('评价提交成功！', 'success');
                
                // Dispatch event to notify parent
                const event = new CustomEvent('review-added', {
                    detail: { dishId: this.currentDishId },
                    bubbles: true
                });
                this.dispatchEvent(event);
                
                this.close();
                this.reset();
            } else {
                throw new Error(result.error || '提交失败');
            }

        } catch (error) {
            console.error('Submit review error:', error);
            this.showToast('提交失败: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    open(dishId) {
        this.currentDishId = dishId;
        this.isOpen = true;

        // Update dish info if available
        if (window.selectedDish) {
            this.querySelector('#selectedDishName').textContent = window.selectedDish.name;
            this.querySelector('#selectedDishPrice').textContent = `RM ${window.selectedDish.price}`;
        }

        // Show modal
        const modal = this.querySelector('.upload-modal');
        const content = this.querySelector('.modal-content');
        
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        content.style.transform = 'scale(1)';

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;

        // Hide modal
        const modal = this.querySelector('.upload-modal');
        const content = this.querySelector('.modal-content');
        
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        content.style.transform = 'scale(0.8)';

        // Restore body scroll
        document.body.style.overflow = '';

        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording();
        }
    }

    reset() {
        // Reset form
        this.querySelector('#reviewForm').reset();
        this.selectedRating = 0;
        this.highlightRating(0);
        this.querySelector('#commentInput').value = '';
        
        // Reset photo
        this.removePhoto();
        
        // Reset audio
        this.deleteRecording();
        
        // Reset dish selection
        this.currentDishId = null;
        this.querySelector('#selectedDishName').textContent = '请先选择菜品';
        this.querySelector('#selectedDishPrice').textContent = '-';
    }

    showToast(message, type = 'info') {
        if (window.ToastMsg) {
            ToastMsg.show(message, type);
        }
    }
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Register the custom element
customElements.define('upload-modal', UploadModal);

