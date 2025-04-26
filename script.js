document.addEventListener('DOMContentLoaded', () => {
    // Global state
    const state = {
        currentStep: 'template-selection',
        selectedTemplate: null,
        stream: null,
        videoTrack: null,
        facingMode: 'user',
        isMirrored: true,
        isPaused: false,
        capturedPhotos: [],
        selectedPhotos: [],
        selectedOrder: [],
        countdown: null,
        countdownValue: 5,
        photoInterval: null,
        customText: '',
        frameColor: '#000000'
    };

    // DOM Elements
    const elements = {
        steps: {
            templateSelection: document.getElementById('template-selection'),
            cameraSection: document.getElementById('camera-section'),
            photoSelection: document.getElementById('photo-selection'),
            compositionSection: document.getElementById('composition-section')
        },
        templateOptions: document.querySelectorAll('.template-option'),
        cameraFeed: document.getElementById('camera-feed'),
        photoCanvas: document.getElementById('photo-canvas'),
        capturedPhotos: document.getElementById('captured-photos'),
        selectionGrid: document.getElementById('selection-grid'),
        compositionContainer: document.getElementById('composition-container'),
        photoCount: document.getElementById('photo-count'),
        countdownOverlay: document.getElementById('countdown-overlay'),
        countdownElement: document.getElementById('countdown'),
        flashOverlay: document.getElementById('flash-overlay'),
        loadingOverlay: document.getElementById('loading-overlay'),
        shutterSound: document.getElementById('shutter-sound'),
        
        // Buttons and new elements
        backToTemplate: document.getElementById('back-to-template'),
        nextToSelection: document.getElementById('next-to-selection'),
        backToCamera: document.getElementById('back-to-camera'),
        nextToComposition: document.getElementById('next-to-composition'),
        backToSelection: document.getElementById('back-to-selection'),
        downloadBtn: document.getElementById('download-btn'),
        restartBtn: document.getElementById('restart-btn'),
        toggleMirror: document.getElementById('toggle-mirror'),
        switchCamera: document.getElementById('switch-camera'),
        pauseCamera: document.getElementById('pause-camera'),
        startCapture: document.getElementById('start-capture'),
        captureNowBtn: document.getElementById('capture-now'),
        customText: document.getElementById('custom-text'),
        applyText: document.getElementById('apply-text'),
        // Color picker elements
        frameColorPicker: document.getElementById('frame-color-picker')
    };

    // Template configurations
    const templates = {
        vertical: {
            backgroundColor: '#000000',
            textColor: '#ffffff',
            canvasWidth: 2570,
            canvasHeight: 7400,
            slotPositions: [
                { x: 0.1, y: 0.12, width: 0.8, height: 0.17 }, // Moved down from y: 0.05
                { x: 0.1, y: 0.33, width: 0.8, height: 0.17 }, // Adjusted from y: 0.3
                { x: 0.1, y: 0.54, width: 0.8, height: 0.17 }, // Slightly adjusted from y: 0.55
                { x: 0.1, y: 0.75, width: 0.8, height: 0.17 }  // Moved up from y: 0.8 to leave space for message
            ]
        },
        grid: {
            backgroundColor: '#000000',
            textColor: '#ffffff',
            canvasWidth: 5000,
            canvasHeight: 3000,
            slotPositions: [
                { x: 0.05, y: 0.18, width: 0.425, height: 0.3 }, // Moved down from y: 0.1
                { x: 0.525, y: 0.18, width: 0.425, height: 0.3 }, // Moved down from y: 0.1
                { x: 0.05, y: 0.52, width: 0.425, height: 0.3 }, // Slightly adjusted from y: 0.55
                { x: 0.525, y: 0.52, width: 0.425, height: 0.3 } // Slightly adjusted from y: 0.55
            ]
        }
    };

    // Init functions
    function initEventListeners() {
        // Template selection - Auto proceed to next page when template is selected
        elements.templateOptions.forEach(option => {
            option.addEventListener('click', () => {
                elements.templateOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                state.selectedTemplate = option.dataset.template;
                
                // Automatically proceed to camera section after a short delay
                setTimeout(() => {
                    goToStep('camera-section');
                    startCamera();
                }, 500);
            });
        });

        elements.backToTemplate.addEventListener('click', () => {
            goToStep('template-selection');
            stopCamera();
            resetCameraSection();
        });

        elements.nextToSelection.addEventListener('click', () => {
            goToStep('photo-selection');
            stopCamera();
            populateSelectionGrid();
        });

        elements.backToCamera.addEventListener('click', () => {
            goToStep('camera-section');
            startCamera();
            elements.selectionGrid.innerHTML = '';
            state.selectedPhotos = [];
            state.selectedOrder = [];
        });

        elements.nextToComposition.addEventListener('click', () => {
            goToStep('composition-section');
            createComposition();
        });

        elements.backToSelection.addEventListener('click', () => {
            goToStep('photo-selection');
            elements.compositionContainer.innerHTML = '';
        });

        elements.downloadBtn.addEventListener('click', downloadComposition);
        elements.restartBtn.addEventListener('click', restartProcess);

        // Camera controls
        elements.startCapture.addEventListener('click', () => {
            if (!state.isPaused) {
                startCountdown();
            }
        });
        
        elements.toggleMirror.addEventListener('click', toggleMirror);
        elements.switchCamera.addEventListener('click', switchCamera);
        elements.pauseCamera.addEventListener('click', togglePauseCamera);
        
        // Custom text
        elements.applyText.addEventListener('click', () => {
            state.customText = elements.customText.value.trim();
            createComposition();
        });
        
        // Frame color with immediate application - original color picker as fallback
        elements.frameColorPicker.addEventListener('input', () => {
            state.frameColor = elements.frameColorPicker.value;
            if (state.currentStep === 'composition-section') {
                createComposition();
            }
        });
        
        // Color palette option selection
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update selected styling
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Get the color value and update state
                const colorValue = option.getAttribute('data-color');
                state.frameColor = colorValue;
                
                // Also update the hidden color picker for consistency
                elements.frameColorPicker.value = colorValue;
                
                // Apply the new color immediately
                if (state.currentStep === 'composition-section') {
                    createComposition();
                }
            });
        });
    }

    // Navigation
    function goToStep(step) {
        Object.values(elements.steps).forEach(el => el.classList.remove('active'));
        elements.steps[camelCase(step)].classList.add('active');
        state.currentStep = step;
    }

    function camelCase(str) {
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    }

    // Camera functions
    async function startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: state.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            state.stream = await navigator.mediaDevices.getUserMedia(constraints);
            state.videoTrack = state.stream.getVideoTracks()[0];
            elements.cameraFeed.srcObject = state.stream;
            
            // Apply mirror effect if needed
            applyMirrorEffect();

            // Don't automatically start countdown - user must click the capture button
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('카메라 접근에 실패했습니다. 권한을 확인해주세요.');
        }
    }

    function stopCamera() {
        clearInterval(state.photoInterval);
        clearInterval(state.countdown);
        
        if (state.stream) {
            state.stream.getTracks().forEach(track => track.stop());
            state.stream = null;
        }
    }

    function resetCameraSection() {
        state.capturedPhotos = [];
        elements.capturedPhotos.innerHTML = '';
        elements.photoCount.textContent = '0';
        elements.nextToSelection.disabled = true;
    }

    function applyMirrorEffect() {
        elements.cameraFeed.style.transform = state.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
    }

    function toggleMirror() {
        state.isMirrored = !state.isMirrored;
        applyMirrorEffect();
    }

    async function switchCamera() {
        state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
        stopCamera();
        await startCamera();
    }

    function togglePauseCamera() {
        state.isPaused = !state.isPaused;
        elements.pauseCamera.textContent = state.isPaused ? '다시 시작' : '일시 중지';
        
        if (state.isPaused) {
            clearInterval(state.photoInterval);
            clearInterval(state.countdown);
            elements.countdownOverlay.style.opacity = 0;
        } else if (state.capturedPhotos.length < 8) {
            startCountdown();
        }
    }

    function startCountdown() {
        if (state.isPaused) return;
        
        state.countdownValue = 5;
        elements.countdownElement.textContent = state.countdownValue;
        elements.countdownOverlay.style.opacity = 1;
        elements.countdownOverlay.classList.add('active');
        
        // Setup capture now button
        if (elements.captureNowBtn) {
            elements.captureNowBtn.style.opacity = 1;
            elements.captureNowBtn.onclick = () => {
                clearInterval(state.countdown);
                elements.countdownOverlay.style.opacity = 0;
                elements.countdownOverlay.classList.remove('active');
                takePhoto();
            };
        }
        
        clearInterval(state.countdown);
        state.countdown = setInterval(() => {
            state.countdownValue--;
            elements.countdownElement.textContent = state.countdownValue;
            
            if (state.countdownValue <= 0) {
                clearInterval(state.countdown);
                elements.countdownOverlay.style.opacity = 0;
                elements.countdownOverlay.classList.remove('active');
                takePhoto();
            }
        }, 1000);
    }

    function takePhoto() {
        if (state.isPaused || state.capturedPhotos.length >= 8) return;
        
        // Play shutter sound if available
        try {
            if (elements.shutterSound && elements.shutterSound.play) {
                elements.shutterSound.play().catch(err => {
                    console.log('Audio playback was prevented: ', err);
                    // This is often due to browser autoplay restrictions
                });
            }
        } catch (e) {
            console.log('Could not play shutter sound: ', e);
            // Continue without sound
        }
        
        // Flash effect
        elements.flashOverlay.style.opacity = 1;
        elements.flashOverlay.style.animation = 'flash 0.3s';
        setTimeout(() => {
            elements.flashOverlay.style.opacity = 0;
            elements.flashOverlay.style.animation = 'none';
        }, 300);
        
        // Draw the current camera frame to the canvas
        const canvas = elements.photoCanvas;
        const context = canvas.getContext('2d');
        const video = elements.cameraFeed;
        
        // Set standard dimensions for better consistency
        const standardWidth = 1280;
        const standardHeight = 960;
        
        canvas.width = standardWidth;
        canvas.height = standardHeight;
        
        // Fill the background with black in case the video aspect ratio doesn't match
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to maintain aspect ratio
        let drawWidth, drawHeight, offsetX, offsetY;
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        
        if (videoRatio > canvasRatio) {
            // Video is wider than canvas
            drawHeight = canvas.height;
            drawWidth = video.videoWidth * (canvas.height / video.videoHeight);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Video is taller than canvas
            drawWidth = canvas.width;
            drawHeight = video.videoHeight * (canvas.width / video.videoWidth);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }
        
        if (state.isMirrored) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            offsetX = canvas.width - offsetX - drawWidth;
        }
        
        // Draw the video with the calculated dimensions to maintain aspect ratio
        context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        // Store the captured photo
        const photoData = canvas.toDataURL('image/png');
        state.capturedPhotos.push(photoData);
        
        // Update UI
        addPhotoToStrip(photoData);
        
        // Continue taking photos if not finished
        if (state.capturedPhotos.length < 8) {
            startCountdown();
        } else {
            elements.nextToSelection.disabled = false;
        }
    }

    function addPhotoToStrip(photoData) {
        const photoImg = document.createElement('img');
        photoImg.src = photoData;
        photoImg.className = 'photo-thumbnail';
        elements.capturedPhotos.appendChild(photoImg);
        
        elements.photoCount.textContent = state.capturedPhotos.length;
    }

    // Photo selection
    function populateSelectionGrid() {
        elements.selectionGrid.innerHTML = '';
        
        state.capturedPhotos.forEach((photo, index) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'selection-photo';
            photoDiv.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = photo;
            photoDiv.appendChild(img);
            
            photoDiv.addEventListener('click', togglePhotoSelection);
            
            elements.selectionGrid.appendChild(photoDiv);
        });
        
        updateNextButtonState();
    }

    function togglePhotoSelection(event) {
        const photoDiv = event.currentTarget;
        const photoIndex = parseInt(photoDiv.dataset.index);
        
        // Check if already selected
        const orderIndex = state.selectedOrder.indexOf(photoIndex);
        
        if (orderIndex === -1) {
            // Not selected, so select it if less than 4 photos are selected
            if (state.selectedPhotos.length < 4) {
                // Add to selected photos
                state.selectedPhotos.push(photoIndex);
                // Track selection order
                state.selectedOrder.push(photoIndex);
                
                // Show selection order number
                photoDiv.classList.add('selected');
                photoDiv.dataset.order = state.selectedOrder.length;
            }
        } else {
            // Already selected, so deselect it
            // Get the position in the selection order
            const orderPosition = orderIndex + 1;
            
            // Remove from selected photos
            const selectedIndex = state.selectedPhotos.indexOf(photoIndex);
            state.selectedPhotos.splice(selectedIndex, 1);
            
            // Remove from selection order
            state.selectedOrder.splice(orderIndex, 1);
            
            // Remove selection styling
            photoDiv.classList.remove('selected');
            delete photoDiv.dataset.order;
            
            // Update order numbers for remaining selections
            document.querySelectorAll('.selection-photo.selected').forEach(el => {
                const thisIndex = parseInt(el.dataset.index);
                const thisOrderIndex = state.selectedOrder.indexOf(thisIndex);
                if (thisOrderIndex !== -1) {
                    el.dataset.order = thisOrderIndex + 1;
                }
            });
        }
        
        updateNextButtonState();
    }

    function updateNextButtonState() {
        elements.nextToComposition.disabled = state.selectedPhotos.length !== 4;
    }

    // Composition
    function createComposition() {
        // Show loading overlay
        elements.loadingOverlay.style.display = 'flex';
        
        // We'll use setTimeout to allow the loading UI to render before starting the heavy composition work
        setTimeout(() => {
            const templateConfig = templates[state.selectedTemplate];
            
            // Create a canvas element for the composition
            const compositionCanvas = document.createElement('canvas');
            compositionCanvas.id = 'composition-canvas';
            
            // Set canvas dimensions based on template
            compositionCanvas.width = templateConfig.canvasWidth;
            compositionCanvas.height = templateConfig.canvasHeight;
            
            // Update the composition container's aspect ratio for display
            if (state.selectedTemplate === 'grid') {
                // For grid layout (horizontal)
                elements.compositionContainer.style.paddingBottom = '100%'; // Square aspect ratio (1:1)
                elements.compositionContainer.style.maxWidth = '90vw';      // Limit width on mobile
                elements.compositionContainer.style.margin = '0 auto';      // Center horizontally
            } else {
                // For vertical layout
                elements.compositionContainer.style.paddingBottom = '280%'; // Original vertical aspect ratio
                elements.compositionContainer.style.maxWidth = '70vw';      // Narrower for vertical layout
                elements.compositionContainer.style.margin = '0 auto';      // Center horizontally
            }
            
            const ctx = compositionCanvas.getContext('2d');
            
            // Fill with custom frame color or default template color
            const frameColor = state.frameColor || templateConfig.backgroundColor;
            ctx.fillStyle = frameColor;
            ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
            
            // Determine text color based on frame color brightness
            // For dark backgrounds use white text, for light backgrounds use black text
            const r = parseInt(frameColor.substr(1, 2), 16);
            const g = parseInt(frameColor.substr(3, 2), 16);
            const b = parseInt(frameColor.substr(5, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const textColor = brightness > 128 ? '#000000' : '#ffffff';
            
            // Add title - position differently for each layout
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            if (state.selectedTemplate === 'grid') {
                // For grid layout - increase title spacing from top
                ctx.font = '150px "Do Hyeon"';
                ctx.fillText('우리네컷', compositionCanvas.width / 2, 300); // Increased from 200 to 300
                
                // Add date
                const now = new Date();
                const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
                ctx.font = '80px "Sunflower"';
                ctx.fillText(dateStr, compositionCanvas.width / 2, 400); // Increased from 300 to 400
            } else {
                // For vertical layout - increase title spacing from top
                ctx.font = '200px "Do Hyeon"';
                ctx.fillText('우리네컷', compositionCanvas.width / 2, 450); // Increased from 350 to 450
                
                // Add date
                const now = new Date();
                const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
                ctx.font = '100px "Sunflower"';
                ctx.fillText(dateStr, compositionCanvas.width / 2, 650); // Increased from 550 to 650
            }
            
            // Process and add the selected photos
            // We need to load each image first
            // Use the ordered photos instead of original order
            const orderedPhotos = [];
            for (let i = 0; i < state.selectedOrder.length; i++) {
                orderedPhotos.push(state.selectedOrder[i]);
            }
            
            const imagePromises = orderedPhotos.map((photoIndex, i) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve({ img, index: i });
                    img.src = state.capturedPhotos[photoIndex];
                });
            });
            
            Promise.all(imagePromises)
                .then(loadedImages => {
                    // Position photos according to template
                    loadedImages.forEach(({ img, index }) => {
                        const slot = templateConfig.slotPositions[index];
                        const x = slot.x * compositionCanvas.width;
                        const y = slot.y * compositionCanvas.height;
                        const width = slot.width * compositionCanvas.width;
                        const height = slot.height * compositionCanvas.height;
                        
                        // Fill the photo slot with a black background first
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(x, y, width, height);
                        
                        // Calculate dimensions to maintain aspect ratio
                        let drawWidth, drawHeight, offsetX, offsetY;
                        const imgRatio = img.width / img.height;
                        const frameRatio = width / height;
                        
                        if (imgRatio > frameRatio) {
                            // Image is wider than frame
                            drawWidth = width;
                            drawHeight = width / imgRatio;
                            offsetX = x;
                            offsetY = y + (height - drawHeight) / 2;
                        } else {
                            // Image is taller than frame
                            drawHeight = height;
                            drawWidth = height * imgRatio;
                            offsetX = x + (width - drawWidth) / 2;
                            offsetY = y;
                        }
                        
                        // Draw the original photo with aspect ratio preserved
                        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                        
                        // Add a border - much thinner for cleaner look
                        ctx.strokeStyle = textColor;
                        ctx.lineWidth = 2; // Reduced from 4 to 2 for even thinner borders
                        ctx.strokeRect(x, y, width, height);
                    });
                    
                    // Add custom text if provided
                    if (state.customText) {
                        ctx.fillStyle = textColor;
                        ctx.font = state.selectedTemplate === 'grid' ? 
                                  '100px "Sunflower"' : '120px "Sunflower"';
                        ctx.textAlign = 'center';
                        
                        // Position text based on template - increased distance from photos
                        const textY = state.selectedTemplate === 'grid' ? 
                                     compositionCanvas.height - 150 : // Further down from bottom of grid layout
                                     compositionCanvas.height - 600;  // Further down from bottom of vertical layout
                                     
                        ctx.fillText(state.customText, compositionCanvas.width / 2, textY);
                    }
                    
                    // Clear any previous content
                    elements.compositionContainer.innerHTML = '';
                    
                    // Add the canvas to the DOM
                    elements.compositionContainer.appendChild(compositionCanvas);
                    
                    // Hide loading overlay
                    elements.loadingOverlay.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error creating composition:', error);
                    elements.loadingOverlay.style.display = 'none';
                    alert('이미지 처리 중 오류가 발생했습니다.');
                });
        }, 100);
    }

    function downloadComposition() {
        const canvas = document.getElementById('composition-canvas');
        if (!canvas) return;
        
        // Create a temporary link
        const link = document.createElement('a');
        link.download = `우리네컷_${new Date().toISOString().slice(0, 10)}.png`;
        
        // Convert canvas to data URL and set as link href
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function restartProcess() {
        // Reset the state
        state.selectedTemplate = null;
        state.capturedPhotos = [];
        state.selectedPhotos = [];
        state.selectedOrder = [];
        state.isPaused = false;
        state.customText = '';
        state.frameColor = '#000000';
        
        // Clear UI elements
        elements.capturedPhotos.innerHTML = '';
        elements.selectionGrid.innerHTML = '';
        elements.compositionContainer.innerHTML = '';
        elements.templateOptions.forEach(opt => opt.classList.remove('selected'));
        elements.photoCount.textContent = '0';
        elements.nextToSelection.disabled = true;
        elements.nextToComposition.disabled = true;
        elements.pauseCamera.textContent = '일시 중지';
        elements.customText.value = '';
        
        // Reset color picker to black
        if (elements.frameColorPicker) {
            elements.frameColorPicker.value = '#000000';
            
            // Reset color palette UI
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => option.classList.remove('selected'));
            
            // Select the black color option by default
            const blackOption = document.querySelector('.color-option[data-color="#000000"]');
            if (blackOption) {
                blackOption.classList.add('selected');
            }
        }
        
        // Stop camera if running
        stopCamera();
        
        // Go back to the first step
        goToStep('template-selection');
    }

    // Initialize the application
    initEventListeners();
    
    // Initialize default color selection (black)
    const blackOption = document.querySelector('.color-option[data-color="#000000"]');
    if (blackOption) {
        blackOption.classList.add('selected');
    }
});
