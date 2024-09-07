# Load model directly
from transformers import AutoModel
from huggingface_hub import login

# Replace 'your-huggingface-token' with your actual token
login(token='hf_hugging face token')
model = AutoModel.from_pretrained("ContactDoctor/Bio-Medical-MultiModal-Llama-3-8B-V1", trust_remote_code=True)

import torch

from PIL import Image

from transformers import AutoModel, AutoTokenizer,BitsAndBytesConfig

bnb_config = BitsAndBytesConfig( load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.float16, )

model = AutoModel.from_pretrained( "ContactDoctor/Bio-Medical-MultiModal-Llama-3-8B-V1", quantization_config=bnb_config, device_map="auto", torch_dtype=torch.float16, trust_remote_code=True, attn_implementation="flash_attention_2", )

tokenizer = AutoTokenizer.from_pretrained("ContactDoctor/Bio-Medical-MultiModal-Llama-3-8B-V1", trust_remote_code=True)

image = Image.open(r"D:\Projects\Medha\front\sai\public\medhavi.webp").convert('RGB')

question = 'Give the modality, organ, analysis, abnormalities (if any), treatment (if abnormalities are present)?'

msgs = [{'role': 'user', 'content': [image, question]}]

res = model.chat( image=image, msgs=msgs, tokenizer=tokenizer, sampling=True, temperature=0.95, stream=True )

generated_text = ""

for new_text in res: 
    generated_text += new_text 
    print(new_text, flush=True, end='')