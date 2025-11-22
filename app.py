import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

# --- ENABLE CORS ---
# This allows your React frontend to talk to this Python backend
CORS(app)

# --- LOAD MODEL ---
print("Loading model...")
try:
    # Load Structure
    with open('model.json', 'r') as json_file:
        loaded_model_json = json_file.read()
    model = model_from_json(loaded_model_json)
    
    # Load Weights
    model.load_weights("model.h5")
    print("Model Loaded Successfully!")
except Exception as e:
    print(f"CRITICAL ERROR: Model not found. {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Get JSON data with base64 images
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        images_base64 = data['image']
        if not isinstance(images_base64, list):
            images_base64 = [images_base64]
        
        results = []
        
        # 2. Process each image
        for idx, img_base64 in enumerate(images_base64):
            try:
                # Decode base64 string
                # Remove data URL prefix if present (e.g., "data:image/png;base64,")
                if ',' in img_base64:
                    img_base64 = img_base64.split(',')[1]
                
                import base64
                from io import BytesIO
                from PIL import Image
                
                # Decode base64 to bytes
                img_bytes = base64.b64decode(img_base64)
                
                # Convert bytes to PIL Image
                img = Image.open(BytesIO(img_bytes))
                
                # Resize to model's expected input size
                img = img.resize((224, 224))
                
                # Convert to array and preprocess
                x = image.img_to_array(img)
                x = np.expand_dims(x, axis=0)  # Add batch dimension
                
                # 3. Make Prediction
                preds = model.predict(x, verbose=0)
                
                # 4. Get the probability (as a decimal 0-1)
                # Frontend expects: if prob > 0.5 = tumor, if prob < 0.5 = no tumor
                # The model returns [Prob_No_Tumor, Prob_Tumor]
                tumor_probability = float(preds[0][1])  # Get tumor probability
                
                # Send the raw probability (0.0 to 1.0)
                # Frontend will handle formatting and display
                results.append(tumor_probability)
                
            except Exception as img_error:
                # For errors, send 0 probability
                results.append(0.0)
                print(f"Error processing image {idx + 1}: {str(img_error)}")
        
        return jsonify({"result": results})
    
    except Exception as e:
        return jsonify({"error": f"Error during prediction: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)