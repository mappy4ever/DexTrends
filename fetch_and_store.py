import os
import requests
from upstash_redis import Redis

# Load environment variables
KV_URL = os.getenv("KV_REST_API_URL")
KV_TOKEN = os.getenv("KV_REST_API_TOKEN")
API_ENDPOINT = "https://api.example.com/data"  # Replace with actual API

# Connect to Upstash Redis
redis = Redis(url=KV_URL, token=KV_TOKEN)

def fetch_and_store():
    try:
        response = requests.get(API_ENDPOINT)
        response.raise_for_status()
        data = response.json()

        # Store data in Redis
        redis.set("api_data", data)
        print("Data successfully stored in Redis.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    fetch_and_store()
