import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import './ImageUploader.css';
import { SERVER_URL } from '../config';

const socket = io(SERVER_URL);

const attachMediaStream = (element, stream) => {
    if ('srcObject' in element) {
        element.srcObject = stream;
    } else {
        element.src = window.URL.createObjectURL(stream);
    }
};

const getUserMedia = (constraints) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
    }
    
    const legacyGetUserMedia = navigator.getUserMedia || 
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    if (!legacyGetUserMedia) {
        return Promise.reject(new Error('getUserMedia не поддерживается в этом браузере'));
    }

    return new Promise((resolve, reject) => {
        try {
            legacyGetUserMedia.call(navigator, constraints, resolve, reject);
        } catch (e) {
            reject(e);
        }
    });
};

const ImageUploader = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [webcamError, setWebcamError] = useState(null);
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const videoConstraints = {
        width: { ideal: 720 },
        height: { ideal: 720 },
        facingMode: "user",
        aspectRatio: 1/1
    };

    useEffect(() => {
        if (!navigator.mediaDevices?.getUserMedia && 
            !navigator.getUserMedia && 
            !navigator.webkitGetUserMedia && 
            !navigator.mozGetUserMedia && 
            !navigator.msGetUserMedia) {
            setWebcamError('Ваш браузер не поддерживает доступ к камере');
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
        setWebcamError(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreview(null);
        setIsWebcamActive(false);
        setWebcamError(null);
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startWebcam = async () => {
        try {
            setWebcamError(null);
            setIsWebcamActive(true);

            const stream = await getUserMedia({ video: videoConstraints });
            streamRef.current = stream;

            if (videoRef.current) {
                attachMediaStream(videoRef.current, stream);
            }
        } catch (err) {
            console.error('Ошибка при запуске камеры:', err);
            setWebcamError(err.message || 'Не удалось получить доступ к камере');
            setIsWebcamActive(false);
        }
    };

    const capture = useCallback(() => {
        if (!videoRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const imageSrc = canvas.toDataURL('image/jpeg');
            setPreview(imageSrc);
            setIsWebcamActive(false);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        } catch (err) {
            console.error('Ошибка при захвате изображения:', err);
            setWebcamError('Не удалось сделать снимок. Попробуйте еще раз.');
        }
    }, [videoRef]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setWebcamError('Пожалуйста, выберите изображение');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.onerror = () => {
                setWebcamError('Ошибка при чтении файла');
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadToServer = async () => {
        if (!preview) return;

        try {
            const response = await fetch(`${SERVER_URL}/api/userImages/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: preview,
                    type: isWebcamActive ? 'webcam' : 'upload'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const imagesResponse = await fetch(`${SERVER_URL}/api/userImages/images`);
            const latestImages = await imagesResponse.json();
            
            socket.emit('newUserPhoto', latestImages);

            alert('Изображение успешно загружено!');
            closeModal();
        } catch (error) {
            console.error('Error uploading image:', error);
            setWebcamError('Ошибка при загрузке изображения на сервер');
        }
    };

    return (
        <div className="image-uploader">
            <button onClick={openModal} className="upload-button">
                Загрузить новое фото
            </button>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={closeModal}>×</button>
                        
                        {webcamError && (
                            <div className="error-message">
                                {webcamError}
                                <button onClick={() => setWebcamError(null)}>OK</button>
                            </div>
                        )}

                        {!preview && !isWebcamActive && (
                            <div className="option-buttons">
                                <input
                                    type="file"
                                    id="file-input"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-input" className="upload-option">
                                    Загрузить с устройства
                                </label>
                                <button 
                                    onClick={startWebcam} 
                                    className="webcam-option"
                                    disabled={!!webcamError}
                                >
                                    Сделать фото
                                </button>
                            </div>
                        )}

                        {isWebcamActive && !preview && (
                            <div className="webcam-container">
                                <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline
                                    className="webcam-video"
                                />
                                <button 
                                    onClick={capture} 
                                    className="capture-button"
                                    disabled={!!webcamError}
                                >
                                    Сделать снимок
                                </button>
                            </div>
                        )}

                        {preview && (
                            <div className="preview-container">
                                <img src={preview} alt="Preview" className="preview-image" />
                                <div className="preview-buttons">
                                    <button onClick={() => {
                                        setPreview(null);
                                        setWebcamError(null);
                                        setIsWebcamActive(true);
                                        startWebcam();
                                    }}>
                                        Переснять
                                    </button>
                                    <button onClick={uploadToServer}>
                                        Загрузить
                                    </button>
                                    <button onClick={closeModal}>
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
