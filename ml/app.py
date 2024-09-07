from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms, models
from PIL import Image
import torch.nn as nn

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet18(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, 4)  # Update the final layer
model.load_state_dict(torch.load('trained_model.pth'))
model.to(device)
model.eval()

# Define the class names (same order as used in training)
class_names = ['glioma', 'meningioma', 'notumor', 'pituitary']  # Update with your actual class names

# Transformation for input image
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def analyze_image(image):
    image = Image.open(image).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)  # Add batch dimension

    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)
        class_id = predicted.item()
    
    # Return the class name and description
    class_name = class_names[class_id]
    description = get_description(class_name)

    return class_name, description

def get_description(class_name):
    # Provide descriptions for each class
    descriptions = {
        'glioma': '''A glioma is a type of brain tumor that starts in the glial cells. These are the supportive cells in the brain that help keep everything running smoothly. Think of glial cells as the helpers or caretakers for the brains nerve cells (neurons) <br> How do they develop - Gliomas can develop when the cells start to grow uncontrollably. This can happen for various reasons, including genetic factors or exposure to certain environmental factors, although the exact cause is often unclear <br> The symptoms of gliomas can vary depending on their size and location in the brain. Common signs include:Headaches, Seizure, Nausea or vomiting, changes in vision, memory problem <br> Treatment options - Surgery: To remove as much of the tumor as possible; Radiation Therapy: Using high-energy rays to kill cancer cells; Chemotherapy: Using medications to target and kill cancer cells.''',
        'meningioma': 'A meningioma is a type of tumor that forms in the meninges, which are the protective layers of tissue covering the brain and spinal cord. Think of the meninges as a protective blanket around your brain <br> Where Do They Come From - Meningiomas usually develop from cells in the meninges. These tumors are generally slow-growing and can vary in size. Most meningiomas are benign, which means they are not cancerous. However, some can be atypical or malignant (cancerous). <br> Symptoms - Headaches, Seizures, Vision Problems, Hearing Loss, Weakness or Numbness, Changes in Personality or Memory <br> Treatment Options - 1. Watchful Waiting: If the tumor is small and not causing problems, doctors may just monitor it over time with regular imaging. <br>2. Surgery: If the tumor is causing symptoms or growing, it may be surgically removed. This is often the first choice of treatment. <br>3. Radiation Therapy: Sometimes used after surgery to kill any remaining tumor cells or for tumors that can’t be safely removed.<br>4. Chemotherapy: Less common for meningiomas but may be used in certain cases, especially for malignant types.',
        'notumor': 'No tumor detected.',
        'pituitary': 'Description for pituitary tumor.',
    }
    return descriptions.get(class_name, 'No description available')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    
    if image_file:
        # Analyze the image
        class_name, description = analyze_image(image_file)
        return jsonify({'predicted_class': class_name, 'description': description})
    
    return jsonify({'error': 'Invalid image file'}), 400

if __name__ == '__main__':
    app.run(port=5050,debug=True)
