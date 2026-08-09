from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Optional
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="Tech Stack Recommender AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')

class RecommendationRequest(BaseModel):
    projectDescription: str
    constraints: Optional[Dict] = {}
    knownSkills: Optional[List[str]] = []

class EmbeddingRequest(BaseModel):
    text: str

def get_db_connection():
    database_url = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/techstack_db')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_all_stacks():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM "Stack"')
        stacks = cur.fetchall()
        cur.close()
        conn.close()
        return stacks
    except Exception as e:
        print(f"Database error: {e}")
        return []

@app.get("/")
def read_root():
    return {
        "service": "Tech Stack Recommender AI Service",
        "status": "running",
        "model": "all-MiniLM-L6-v2"
    }

@app.post("/generate-embedding")
def generate_embedding(request: EmbeddingRequest):
    try:
        embedding = model.encode(request.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
def recommend_stacks(request: RecommendationRequest):
    try:
        query_embedding = model.encode(request.projectDescription)
        
        stacks = get_all_stacks()
        
        if not stacks:
            raise HTTPException(status_code=500, detail="No stacks found in database")
        
        results = []
        
        for stack in stacks:
            stack_text = f"{stack['name']} {stack['description']} {' '.join(stack['tags'])} {stack['useCase']}"
            stack_embedding = model.encode(stack_text)
            
            similarity = cosine_similarity(
                query_embedding.reshape(1, -1),
                stack_embedding.reshape(1, -1)
            )[0][0]
            
            skill_boost = 0
            if request.knownSkills:
                known_skills_lower = [s.lower() for s in request.knownSkills]
                stack_components_lower = [c.lower() for c in stack['components']]
                matching_skills = sum(
                    1 for skill in known_skills_lower 
                    if any(skill in comp for comp in stack_components_lower)
                )
                skill_boost = matching_skills * 0.1
            
            final_score = min(similarity + skill_boost, 1.0)
            
            constraint_match = True
            if request.constraints:
                if 'budget' in request.constraints:
                    if request.constraints['budget'].lower() not in stack['budget'].lower():
                        final_score *= 0.7
                
                if 'teamSize' in request.constraints:
                    if request.constraints['teamSize'].lower() not in stack['teamSize'].lower():
                        final_score *= 0.8
            
            matched_keywords = []
            desc_lower = request.projectDescription.lower()
            for tag in stack['tags']:
                if tag.lower() in desc_lower:
                    matched_keywords.append(tag)
            
            results.append({
                "stack": {
                    "id": stack['id'],
                    "name": stack['name'],
                    "description": stack['description'],
                    "components": stack['components'],
                    "tags": stack['tags'],
                    "useCase": stack['useCase'],
                    "teamSize": stack['teamSize'],
                    "budget": stack['budget'],
                    "learningCurve": stack['learningCurve']
                },
                "score": float(final_score),
                "matchedKeywords": matched_keywords,
                "reasoning": f"Similarity: {similarity:.2f}, Skill boost: {skill_boost:.2f}"
            })
        
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            "recommendations": results[:10],
            "totalMatches": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
