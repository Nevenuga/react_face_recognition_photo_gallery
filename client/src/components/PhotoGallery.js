import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './PhotoGallery.css';
import HeatmapChart from './HeatmapChart';
import { SERVER_URL } from '../config';

const socket = io(SERVER_URL);

const PhotoGallery = () => {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        fetchPhotos();

        socket.on('newPhoto', (newPhotos) => {
            console.log('Received new photos:', newPhotos); // Отладочный вывод
            if (Array.isArray(newPhotos)) {
                setPhotos(newPhotos);
            }
        });

        return () => {
            socket.off('newPhoto');
        };
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/photos`);
            const data = await response.json();
            console.log('Fetched photos:', data); // Отладочный вывод
            setPhotos(data);
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    };

    const getDefaultImage = () => {
        return 'data:image/png;base64,iVBORw0KGgoACC';
    };

    return (
        <div className="photo-gallery">
            {photos.length > 0 && (
                <div 
                    key={photos[0]._id} 
                    className="photo-container main-photo"
                    style={{ '--order': 0 }}
                >
                    <img 
                        src={photos[0].imageData || getDefaultImage()}
                        alt="Photo 1"
                        className="photo"
                        onError={(e) => {
                            e.target.src = getDefaultImage();
                        }}
                    />
                    {photos[0].metadata && (
                        <div className="heatmap-container">
                            {typeof photos[0].metadata === 'string' ? (
                                <HeatmapChart data={JSON.parse(photos[0].metadata)} />
                            ) : (
                                <HeatmapChart data={photos[0].metadata} />
                            )}
                        </div>
                    )}
                </div>
            )}
            <div className="queue">
                {photos.slice(1).map((photo, index) => (
                    <div 
                        key={photo._id} 
                        className="photo-container"
                        style={{ '--order': index + 1 }}
                    >
                        <img 
                            src={photo.imageData || getDefaultImage()}
                            alt={`Photo ${index + 2}`}
                            className="photo"
                            onError={(e) => {
                                e.target.src = getDefaultImage();
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGallery;
