import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const API_URL =
  "https://api-inference.huggingface.co/models/impira/layoutlm-document-qa";
const headers = {
  Authorization: "Bearer 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",
};

// Function to read a file and convert it to base64
function readFileAsBase64(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist at path: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

// Function to query the API
async function query(payload) {
  // Debugging line
  console.log("Query Payload:", payload);

  if (!payload.inputs || !payload.inputs.image) {
    throw new Error("File path is not provided in the payload.");
  }

  // Read and encode the file to base64
  const base64Image = readFileAsBase64(payload.inputs.image);

  // Update the payload with the base64 encoded image
  payload.inputs.image = base64Image;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

// Main function to construct payload and call query
async function main() {
  const filePath = path.resolve(
    "D:/Projects/Medha/front/sai/public/CERTIFICATE.jpg"
  );

  console.log("Resolved File Path:", filePath); // Debugging line

  const payload = {
    inputs: {
      image: filePath, // Provide the file path here
      question: "What is in this image?",
    },
  };

  try {
    const output = await query(payload);
    console.log(output);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
