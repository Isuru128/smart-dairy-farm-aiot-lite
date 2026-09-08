# Smart Dairy AIoT - Machine Learning Microservice

This microservice powers the predictive analytics of the Smart Dairy Farm AIoT system. It serves machine learning inference models built with **LightGBM** and **XGBoost** via a high-performance **FastAPI** REST interface.

---

## 🚀 Features

- **Milk Yield Forecasting**: Predicts expected 7-day milk production (in Liters) per cow based on breed, weight, lactation stage, feed intake, days in milk, and barn ambient temperature.
- **Multi-Model Engine**: Supports both **XGBoost Regressor** (`milk_yield_xgb.json`) and **LightGBM Regressor** (`milk_yield_lgb.pkl`).
- **Disease & Mastitis Early Detection**: Analyzes temperature variance, rumination patterns, and movement counters to predict health risks.
- **Nutritional Ration Optimization**: Provides optimal feed ratios and cost projections.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train / Retrain Models
```bash
python train_model.py
```

### 3. Run FastAPI Service
```bash
uvicorn main:app --reload --port 8000
```
Interactive Swagger Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Docker Deployment

```bash
docker build -t smart-dairy-ai-service .
docker run -p 8000:8000 smart-dairy-ai-service
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict-yield` | Predicts milk production using LightGBM or XGBoost |
| `POST` | `/disease-risk` | Evaluates mastitis and heat stress risks |
| `GET` | `/feed-optimization` | Returns optimized feed formulations |
| `GET` | `/health` | Service and model health status |
