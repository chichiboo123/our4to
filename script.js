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
        frameColor: '#000000',
        activeTheme: null // 현재 선택된 테마
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
        cameraPlaceholder: document.getElementById('camera-placeholder'),
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
        frameColorPicker: document.getElementById('frame-color-picker'),
        // Theme elements
        themeOptions: document.querySelectorAll('.theme-option')
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
    
    // 테마 설정
    const themes = {
        'little-prince': {
            name: '어린왕자',
            background: 'linear-gradient(to bottom, #7BA4FF, #1A66FF)',
            decorations: [
                { type: 'star', color: '#FFD700', size: 15, positions: [
                    { x: 0.05, y: 0.05 }, { x: 0.2, y: 0.1 }, { x: 0.8, y: 0.07 }, 
                    { x: 0.9, y: 0.12 }, { x: 0.15, y: 0.85 }, { x: 0.75, y: 0.92 },
                    { x: 0.3, y: 0.93 }, { x: 0.6, y: 0.89 }
                ]}
            ],
            textColor: '#FFFFFF'
        },
        'meadow': {
            name: '넓은 초원',
            background: 'linear-gradient(to bottom, #76D7EA, #9FE7C8)',
            decorations: [
                { type: 'grass', color: '#8BC34A', height: 300, positions: [
                    { x: 0, y: 0.8, width: 1 }
                ]},
                { type: 'cloud', color: '#FFFFFF', size: 20, positions: [
                    { x: 0.1, y: 0.1 }, { x: 0.7, y: 0.05 }, { x: 0.4, y: 0.15 }
                ]}
            ],
            textColor: '#006400'
        },
        'malatang': {
            name: '마라탕 7단계',
            background: 'linear-gradient(to bottom, #FF5252, #B71C1C)',
            decorations: [
                { type: 'spicy', color: '#FF0000', size: 20, positions: [
                    { x: 0.15, y: 0.05 }, { x: 0.85, y: 0.05 }, 
                    { x: 0.15, y: 0.95 }, { x: 0.85, y: 0.95 }
                ]}
            ],
            textColor: '#FFFFFF'
        },
        'spring': {
            name: '길고 긴 봄',
            background: 'linear-gradient(to bottom, #FFD1DC, #FADCE2)',
            decorations: [
                { type: 'cherry-blossom', color: '#FF80AB', size: 15, positions: [
                    { x: 0.1, y: 0.1 }, { x: 0.2, y: 0.05 }, { x: 0.3, y: 0.12 },
                    { x: 0.7, y: 0.08 }, { x: 0.8, y: 0.15 }, { x: 0.9, y: 0.1 },
                    { x: 0.1, y: 0.85 }, { x: 0.3, y: 0.9 }, { x: 0.5, y: 0.87 },
                    { x: 0.7, y: 0.92 }, { x: 0.9, y: 0.88 }
                ]}
            ],
            textColor: '#FF4081'
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
                
                // Reset active theme when selecting a single color
                state.activeTheme = null;
                elements.themeOptions.forEach(themeOpt => themeOpt.classList.remove('selected'));
                
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
        
        // 데스크톱과 모바일에서 모두 테마 옵션이 표시되도록 확인
        if (elements.themeOptions && elements.themeOptions.length > 0) {
            console.log('테마 옵션 초기화: ' + elements.themeOptions.length + '개의 테마 옵션 발견');
        } else {
            console.error('테마 옵션을 찾을 수 없습니다. 브라우저 콘솔을 확인해주세요.');
        }
        
        // Theme selection
        elements.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update selected styling
                elements.themeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Reset color selection
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Set active theme
                const themeKey = option.getAttribute('data-theme');
                state.activeTheme = themeKey;
                
                // Apply the new theme immediately
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
            // 카메라 placeholder 안내 텍스트 표시
            if (elements.cameraPlaceholder) {
                elements.cameraPlaceholder.style.display = 'flex';
            }
            
            // 항상 가로 모드(landscape)로 촬영되도록 설정
            const constraints = {
                video: {
                    facingMode: state.facingMode,
                    // 가로 비율 16:9로 강제 설정
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            state.stream = await navigator.mediaDevices.getUserMedia(constraints);
            state.videoTrack = state.stream.getVideoTracks()[0];
            elements.cameraFeed.srcObject = state.stream;
            
            // 카메라가 시작되면 안내 텍스트 숨기기
            if (elements.cameraPlaceholder) {
                elements.cameraPlaceholder.style.display = 'none';
            }
            
            elements.cameraFeed.onloadedmetadata = () => {
                // 비디오 트랙 설정 확인
                const settings = state.videoTrack.getSettings();
                console.log('카메라 설정:', settings);
                
                // 세로/가로 모드 감지 및 처리 함수
                const handleOrientation = () => {
                    const isPortrait = window.innerHeight > window.innerWidth;
                    
                    if (isPortrait) {
                        console.log('세로 모드 - 카메라 가로 방향으로 회전');
                        // 세로 모드에서는 비디오를 강제로 가로로 표시
                        elements.cameraFeed.classList.add('camera-portrait-mode');
                        
                        // 세로 모드에서의 미러링 효과
                        if (state.isMirrored) {
                            elements.cameraFeed.style.transform = 'rotate(-90deg) scaleX(-1)';
                        } else {
                            elements.cameraFeed.style.transform = 'rotate(-90deg)';
                        }
                    } else {
                        console.log('가로 모드 - 기본 카메라 방향');
                        // 가로 모드에서는 기본 방향으로 표시
                        elements.cameraFeed.classList.remove('camera-portrait-mode');
                        
                        // 가로 모드에서의 미러링 효과
                        if (state.isMirrored) {
                            elements.cameraFeed.style.transform = 'scaleX(-1)';
                        } else {
                            elements.cameraFeed.style.transform = 'none';
                        }
                    }
                };
                
                // 초기 방향 처리
                handleOrientation();
                
                // 방향 변경 시 이벤트 리스너 등록
                window.addEventListener('resize', handleOrientation);
                
                // 페이지 로드 후에도 한번 더 처리 (안전성 추가)
                setTimeout(() => {
                    handleOrientation();
                }, 500);
                
                // 방향 변경 후에도 강제 적용 (iOS에서 더 안정적)
                window.addEventListener('orientationchange', () => {
                    setTimeout(() => {
                        handleOrientation();
                    }, 200);
                });
            };
            
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
        // 세로 모드에서는 카메라가 회전되어 있으므로 다른 방식으로 미러링 적용
        if (window.innerHeight > window.innerWidth) {
            elements.cameraFeed.style.transform = state.isMirrored ? 
                'rotate(-90deg) scaleX(-1)' : 'rotate(-90deg)';
        } else {
            elements.cameraFeed.style.transform = state.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
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
        
        // 모바일 세로 모드 여부 확인
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // 비디오와 캔버스 비율 계산
        let videoWidth = video.videoWidth;
        let videoHeight = video.videoHeight;
        
        // 세로 모드에서 회전된 비디오 처리
        if (isPortrait && video.classList.contains('camera-portrait-mode')) {
            // 비디오가 회전된 경우 가로/세로를 반대로 처리
            [videoWidth, videoHeight] = [videoHeight, videoWidth];
        }
        
        const videoRatio = videoWidth / videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        
        // 비디오를 캔버스에 꽉 차게 그리기 (검은색 여백 없음)
        let drawWidth, drawHeight, offsetX, offsetY;
        
        // 가득 차게 그리기 - 종횡비를 유지하면서 캔버스를 채우도록
        if (videoRatio > canvasRatio) {
            // 비디오가 캔버스보다 더 넓은 경우
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // 비디오가 캔버스보다 더 높은 경우
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }
        
        // 미러링 처리
        if (state.isMirrored) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            offsetX = canvas.width - offsetX - drawWidth;
        }
        
        // 꽉 차게 그리기
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
                elements.compositionContainer.style.paddingBottom = '60%';  // 조정된 비율
                elements.compositionContainer.style.maxWidth = '95vw';      // 너비 약간 증가
                elements.compositionContainer.style.margin = '0 auto';        // Center horizontally
            } else {
                // For vertical layout
                elements.compositionContainer.style.paddingBottom = '280%'; // Original vertical aspect ratio
                elements.compositionContainer.style.maxWidth = '85vw';      // 너비 약간 증가 (세로 레이아웃)
                elements.compositionContainer.style.margin = '0 auto';      // Center horizontally
            }
            
            const ctx = compositionCanvas.getContext('2d');
            
            // Track if we're using a theme or just a color
            let textColor;
            
            // Apply theme if selected, otherwise use single color
            if (state.activeTheme && themes[state.activeTheme]) {
                const theme = themes[state.activeTheme];
                
                // Apply gradient background
                if (theme.background.includes('gradient')) {
                    // Create gradient
                    const gradient = ctx.createLinearGradient(0, 0, 0, compositionCanvas.height);
                    
                    // Parse the gradient colors from the CSS linear-gradient
                    const gradientMatch = theme.background.match(/linear-gradient\(to bottom, ([^,]+), ([^)]+)\)/);
                    if (gradientMatch && gradientMatch.length >= 3) {
                        gradient.addColorStop(0, gradientMatch[1]);
                        gradient.addColorStop(1, gradientMatch[2]);
                    } else {
                        // Fallback if parsing fails
                        gradient.addColorStop(0, '#76D7EA');
                        gradient.addColorStop(1, '#1A66FF');
                    }
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
                } else {
                    // Solid color background
                    ctx.fillStyle = theme.background;
                    ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
                }
                
                // Draw theme decorations
                theme.decorations.forEach(decoration => {
                    switch (decoration.type) {
                        case 'star':
                            // Draw stars
                            decoration.positions.forEach(pos => {
                                const x = pos.x * compositionCanvas.width;
                                const y = pos.y * compositionCanvas.height;
                                const size = decoration.size;
                                drawStar(ctx, x, y, 5, size/2, size, decoration.color);
                            });
                            break;
                            
                        case 'grass':
                            // Draw grass at the bottom
                            ctx.fillStyle = decoration.color;
                            const grassHeight = decoration.height;
                            decoration.positions.forEach(pos => {
                                const x = pos.x * compositionCanvas.width;
                                const y = pos.y * compositionCanvas.height;
                                const width = pos.width * compositionCanvas.width;
                                ctx.fillRect(x, y, width, grassHeight);
                            });
                            break;
                            
                        case 'cloud':
                            // Draw clouds
                            ctx.fillStyle = decoration.color;
                            decoration.positions.forEach(pos => {
                                const x = pos.x * compositionCanvas.width;
                                const y = pos.y * compositionCanvas.height;
                                const size = decoration.size;
                                drawCloud(ctx, x, y, size * 3, size * 1.5);
                            });
                            break;
                            
                        case 'spicy':
                            // Draw chili pepper icons for malatang theme
                            decoration.positions.forEach(pos => {
                                const x = pos.x * compositionCanvas.width;
                                const y = pos.y * compositionCanvas.height;
                                const size = decoration.size;
                                ctx.font = `${size * 2}px serif`;
                                ctx.fillStyle = decoration.color;
                                ctx.fillText('🌶️', x, y);
                            });
                            break;
                            
                        case 'cherry-blossom':
                            // Draw cherry blossoms
                            decoration.positions.forEach(pos => {
                                const x = pos.x * compositionCanvas.width;
                                const y = pos.y * compositionCanvas.height;
                                const size = decoration.size;
                                ctx.font = `${size * 2}px serif`;
                                ctx.fillStyle = decoration.color;
                                ctx.fillText('🌸', x, y);
                            });
                            break;
                    }
                });
                
                // Use theme text color
                textColor = theme.textColor;
                
            } else {
                // No theme, use single color background
                const frameColor = state.frameColor || templateConfig.backgroundColor;
                ctx.fillStyle = frameColor;
                ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
                
                // Determine text color based on frame color brightness
                // For dark backgrounds use white text, for light backgrounds use black text
                const r = parseInt(frameColor.substr(1, 2), 16);
                const g = parseInt(frameColor.substr(3, 2), 16);
                const b = parseInt(frameColor.substr(5, 2), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                textColor = brightness > 128 ? '#000000' : '#ffffff';
            }
            
            // Helper function to draw a star
            function drawStar(ctx, cx, cy, spikes, innerRadius, outerRadius, color) {
                let rot = Math.PI / 2 * 3;
                let x = cx;
                let y = cy;
                const step = Math.PI / spikes;
                
                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                
                for (let i = 0; i < spikes; i++) {
                    x = cx + Math.cos(rot) * outerRadius;
                    y = cy + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                    
                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                }
                
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
            }
            
            // Helper function to draw a cloud
            function drawCloud(ctx, x, y, width, height) {
                ctx.beginPath();
                ctx.arc(x, y + height/2, height/2, 0, Math.PI * 2);
                ctx.arc(x + width/3, y + height/2, height/2.5, 0, Math.PI * 2);
                ctx.arc(x + width/1.5, y + height/2, height/3, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            
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
                        
                        // 이미지 비율 계산 및 맞춤
                        const imgRatio = img.width / img.height;
                        const slotRatio = width / height;
                        
                        // 이미지 여백 없이 슬롯에 꽉 차게 그리기
                        let drawImgWidth, drawImgHeight, drawImgX, drawImgY;
                        
                        if (imgRatio > slotRatio) {
                            // 이미지가 슬롯보다 가로가 더 넓은 경우
                            drawImgHeight = height;
                            drawImgWidth = height * imgRatio;
                            drawImgX = x - ((drawImgWidth - width) / 2);
                            drawImgY = y;
                        } else {
                            // 이미지가 슬롯보다 세로가 더 높은 경우
                            drawImgWidth = width;
                            drawImgHeight = width / imgRatio;
                            drawImgX = x;
                            drawImgY = y - ((drawImgHeight - height) / 2);
                        }
                        
                        // 이미지가 프레임을 벗어나지 않도록 제한
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(x, y, width, height);
                        ctx.clip();
                        
                        // 이미지를 프레임에 맞게 그리기
                        ctx.drawImage(img, drawImgX, drawImgY, drawImgWidth, drawImgHeight);
                        ctx.restore();
                        
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
