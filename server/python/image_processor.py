import sys
import json
import base64
import numpy as np
from PIL import Image
import io
import insightface
from insightface.app import FaceAnalysis
import warnings
warnings.filterwarnings('ignore')
app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=0, det_size=(640, 640))

def process_image(base64_string):
    try:
        if 'base64,' in base64_string:
            base64_string = base64_string.split('base64,')[1]
            
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        img_array = np.array(img)
        faces = app.get(img_array)
        
        if len(faces) > 0:
            face = faces[0]
            embedding = face.embedding.tolist()
            
            return json.dumps({
                'success': True,
                'embedding': embedding
            })
        else:
            return json.dumps({
                'success': False,
                'error': 'No faces detected'
            })
            
    except Exception as e:
        return json.dumps({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    base64_string = sys.stdin.read().strip()
    result = process_image(base64_string)
    print(result)
