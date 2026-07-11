# Music Recommendation System

## Structure
- `backend/` — FastAPI + scikit-learn content-based recommendation engine
- `frontend/` — React web interface

## Backend Setup
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload