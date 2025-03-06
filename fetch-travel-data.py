import subprocess
import json

def handler(event, context):
    try:
        result = subprocess.run(["python3", "fetch_and_store.py"], capture_output=True, text=True)
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Script executed", "output": result.stdout})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
