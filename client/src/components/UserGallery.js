import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './UserGallery.css';
import { SERVER_URL } from '../config';

const socket = io(SERVER_URL);

const UserGallery = () => {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        fetchPhotos();

        socket.on('newUserPhoto', (newPhotos) => {
            if (Array.isArray(newPhotos)) {
                setPhotos(newPhotos.slice(0, 5));
            }
        });

        return () => {
            socket.off('newUserPhoto');
        };
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/userImages/images`);
            const data = await response.json();
            setPhotos(data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching user photos:', error);
        }
    };

    const handleDelete = async (photoId) => {
        try {
            const response = await fetch(`${SERVER_URL}/api/userImages/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Photo deleted successfully');
                // После успешного удаления обновляем список фотографий
                fetchPhotos();
            } else {
                const errorData = await response.json();
                console.error('Failed to delete photo:', errorData);
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    const handleView = (photoId) => {
        // Add logic to handle view photo here
    };

    return (
        <div className="user-gallery">
            <div className="photos-grid">
                {photos.map((photo) => (
                    <div key={photo._id} className="photo-item">
                        <div className="user-photo-container">
                            <button
                                className="delete-button"
                                onClick={() => handleDelete(photo._id)}
                                title="Delete photo"
                            >
                                ×
                            </button>
                            <img
                                className="user-photo"
                                src={`${SERVER_URL}/api/userImages/view/${photo._id}`}
                                alt="User uploaded"
                                onClick={() => handleView(photo._id)}
                            />
                        </div>
                        <div className="photo-id">
                            ID: {photo._id.slice(0, -6)}
                            <span className="photo-id-bold">
                                {photo._id.slice(-6)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserGallery;
