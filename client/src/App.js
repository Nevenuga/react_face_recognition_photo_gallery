import './App.css';
import PhotoGallery from './components/PhotoGallery';
import ImageUploader from './components/ImageUploader';
import UserGallery from './components/UserGallery';

function App() {
  return (
    <div className="App">
      <h1>Photo Gallery</h1>
      <PhotoGallery />
      <UserGallery />
      <ImageUploader />
    </div>
  );
}

export default App;
