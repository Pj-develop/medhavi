from flask import Flask, request, jsonify
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
import google.generativeai as genai

# Initialize Flask app
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# The rest of your code...


# Azure Form Recognizer settings
endpoint = "AZURE-ENDPOINT"
key = "AZURE-KEY"

# Google Generative AI settings
genai.configure(api_key="GEMINI KEY")
model = genai.GenerativeModel('gemini-pro')

def format_bounding_box(bounding_box):
    if not bounding_box:
        return "N/A"
    return ", ".join(["[{}, {}]".format(p.x, p.y) for p in bounding_box])

def analyze_document(form_url):
    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    poller = document_analysis_client.begin_analyze_document_from_url(
        "prebuilt-read", form_url)
    result = poller.result()

    content = result.content
    lines = []
    for page in result.pages:
        for line_idx, line in enumerate(page.lines):
            lines.append(
                f"Line # {line_idx} has text content '{line.content}' within bounding box '{format_bounding_box(line.polygon)}'"
            )

    return content, lines
def generate_educational_content(user_input):
    prompt = '''
  Prompt:

> "Analyze the provided dataset and generate a JSON report summarizing the following:

> **Data Categories:**
>   - Identify and categorize the data into relevant groups (e.g., medical, financial, educational).
>   - Determine the key metrics or variables within each category.

> **Data Quality:**
>   - Assess the completeness, accuracy, and consistency of the data.
>   - Identify any missing values, outliers, or inconsistencies.

> **Data Analysis:**
>   - Apply appropriate statistical methods (e.g., descriptive statistics, correlation analysis, hypothesis testing) to analyze the data.
>   - Calculate relevant metrics and identify trends, patterns, or anomalies.

> **Key Findings:**
>   - Summarize the most significant findings or insights derived from the analysis.
>   - Highlight any unexpected or noteworthy results.

> **Output Format:**
>   - JSON format with a flexible structure that can accommodate different data types and categories.
>   - Include key metrics, summary statistics, visualizations (if applicable), and any relevant contextual information.

> **Additional Notes:**
>   - Adapt the analysis and output format to the specific requirements of the report.
>   - Consider using data visualization techniques to enhance understanding and communication of results.
>   - Provide clear and concise explanations for any findings."

for the data provide as  {} and remove new line character or any other special character or escape characters?'''.format(user_input)
    responseAI = model.generate_content(prompt)
    return responseAI.text


def gc_json(user_input):
    prompt = '''
  Correct the errors in the following JSON text and convert it into a structured JSON format without any extra information or tickmarks. Ensure the output is compatible with the jsonify function  {} and remove new line character or any other special character or escape characters?'''.format(user_input)
    responseAI = model.generate_content(prompt)
    return responseAI.text

@app.route('/summarize', methods=['POST'])
def summarize_report():
    data = request.json
    form_url = data.get('form_url')
    if not form_url:
        return jsonify({"error": "form_url is required"}), 400

    content, lines = analyze_document(form_url)
    educational_content = generate_educational_content(content)
    educational_content=gc_json(educational_content)
    print(educational_content)

    return jsonify({
        "document_content": content,
        "lines": lines,
        "educational_content": educational_content
    })

if __name__ == "__main__":
    app.run(port=5150)
