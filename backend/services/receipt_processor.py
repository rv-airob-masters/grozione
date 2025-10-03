import cv2
import numpy as np
import base64
import json
import os
import requests
from PIL import Image
from io import BytesIO
from typing import Dict, List, Optional
from dotenv import load_dotenv
import time

load_dotenv()

class ReceiptProcessor:
    def __init__(self):
        # Azure Document Intelligence configuration
        self.endpoint = os.environ.get('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT')
        self.key = os.environ.get('AZURE_DOCUMENT_INTELLIGENCE_KEY')

        if not self.endpoint or not self.key:
            print("⚠️  Warning: Azure Document Intelligence credentials not configured")
            print("   Please set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY in .env")
            self.endpoint = None
            self.key = None
    
    def preprocess_image(self, image_bytes: bytes) -> Image.Image:
        """Preprocess image for better OCR accuracy"""
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply noise reduction
        denoised = cv2.medianBlur(gray, 3)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Convert back to PIL Image
        return Image.fromarray(thresh)
    
    def encode_image_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()
    

    def parse_basic_fallback(self, image_bytes: bytes) -> Dict:
        """Basic fallback when AI processing fails"""
        return {
            "store_info": {"name": "Unknown Store"},
            "transaction_info": {"date": "", "time": "", "receipt_number": ""},
            "items": [],
            "totals": {"total": 0.00},
            "confidence_score": 0.1,
            "store_unclear": True,
            "processing_method": "fallback",
            "error": "Unable to process receipt automatically"
        }
    
    async def extract_with_azure_document_intelligence(self, image_bytes: bytes) -> Dict:
        """Extract receipt data using Azure Document Intelligence"""
        if not self.endpoint or not self.key:
            raise Exception("Azure Document Intelligence not configured")

        # Analyze document endpoint
        analyze_url = f"{self.endpoint}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2023-07-31"

        headers = {
            'Ocp-Apim-Subscription-Key': self.key,
            'Content-Type': 'application/octet-stream'
        }

        # Submit document for analysis
        response = requests.post(analyze_url, headers=headers, data=image_bytes)

        if response.status_code != 202:
            raise Exception(f"Failed to submit document: {response.status_code} - {response.text}")

        # Get operation location from response headers
        operation_location = response.headers.get('Operation-Location')
        if not operation_location:
            raise Exception("No operation location returned")

        # Poll for results
        max_attempts = 30
        for attempt in range(max_attempts):
            time.sleep(2)  # Wait 2 seconds between polls

            result_response = requests.get(
                operation_location,
                headers={'Ocp-Apim-Subscription-Key': self.key}
            )

            if result_response.status_code != 200:
                continue

            result_data = result_response.json()

            if result_data.get('status') == 'succeeded':
                return self.parse_azure_response(result_data)
            elif result_data.get('status') == 'failed':
                raise Exception(f"Document analysis failed: {result_data.get('error', 'Unknown error')}")

        raise Exception("Document analysis timed out")

    def parse_azure_response(self, azure_result: Dict) -> Dict:
        """Parse Azure Document Intelligence response into our format"""
        try:
            documents = azure_result.get('analyzeResult', {}).get('documents', [])
            if not documents:
                return self.parse_basic_fallback(b"")

            receipt_doc = documents[0]
            fields = receipt_doc.get('fields', {})

            # Extract store information
            merchant_name = fields.get('MerchantName', {}).get('valueString', 'Unknown Store')

            # Extract items
            items = []
            receipt_items = fields.get('Items', {}).get('valueArray', [])

            for item_data in receipt_items:
                item_fields = item_data.get('valueObject', {})

                item_name = item_fields.get('Description', {}).get('valueString', 'Unknown Item')
                quantity = item_fields.get('Quantity', {}).get('valueNumber', 1)
                price = item_fields.get('TotalPrice', {}).get('valueNumber', 0.0)

                items.append({
                    "itemName": item_name,
                    "quantity": f"{quantity} pcs",
                    "price": float(price),
                    "store": merchant_name
                })

            # Extract total
            total_amount = fields.get('Total', {}).get('valueNumber', 0.0)

            return {
                "items": items,
                "store": merchant_name,
                "total": float(total_amount),
                "confidence": 0.9,  # Azure generally has high confidence
                "processing_method": "azure_document_intelligence"
            }

        except Exception as e:
            print(f"Error parsing Azure response: {e}")
            return self.parse_basic_fallback(b"")

    async def process_receipt(self, image_bytes: bytes) -> Dict:
        """Main processing pipeline"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_bytes)

            # Try Azure Document Intelligence first
            try:
                result = await self.extract_with_azure_document_intelligence(image_bytes)
                return result
            except Exception as azure_error:
                print(f"Azure Document Intelligence failed: {azure_error}")

                # Fallback to basic processing
                result = self.parse_basic_fallback(image_bytes)
                result["error"] = f"Azure processing failed: {str(azure_error)}"
                return result

        except Exception as e:
            # Ultimate fallback
            result = self.parse_basic_fallback(image_bytes)
            result["error"] = f"Receipt processing failed: {str(e)}"
            return result