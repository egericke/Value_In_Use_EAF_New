from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from ._lib.models import ViuInput
from ._lib.calculations import run_viu_calculation

# Initialize FastAPI app
app = FastAPI(
    title="EAF Value-in-Use API",
    description="API for calculating the economic impact of raw materials in an EAF.",
    version="2.0.0"
)

# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
try:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None

@app.get("/api")
def read_root():
    return {"message": "Welcome to the EAF VIU API v2"}

@app.get("/api/materials")
def get_materials():
    """Fetches all raw materials from the database."""
    if not supabase:
        return {"error": "Supabase client not initialized"}, 500
    try:
        response = supabase.table('raw_materials').select("*").order('name').execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}, 500

@app.post("/api/compute")
def compute_viu(viu_input: ViuInput):
    """
    Runs the full VIU simulation based on user input.
    """
    try:
        results = run_viu_calculation(viu_input)
        return {
            "simulationId": f"sim_{os.urandom(4).hex()}",
            "summary": {
                "message": "Calculation successful."
            },
            "results": results
        }
    except Exception as e:
        return {"error": f"Calculation failed: {str(e)}"}, 400
