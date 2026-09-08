import os
import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb
import joblib

# Ensure output directory exists
os.makedirs("models", exist_ok=True)

def generate_synthetic_dairy_data(n_samples=1200):
    np.random.seed(42)

    # Breeds: 0: Holstein Friesian, 1: Jersey, 2: Sahiwal
    breeds = np.random.choice([0, 1, 2], size=n_samples, p=[0.55, 0.30, 0.15])

    # Weights conditioned on breed
    weights = np.where(breeds == 0, np.random.normal(640, 45, n_samples),
              np.where(breeds == 1, np.random.normal(480, 35, n_samples),
                                    np.random.normal(420, 40, n_samples)))

    # Lactation Stage: 0: Early (0-100d), 1: Mid (101-200d), 2: Late (201-305d)
    stages = np.random.choice([0, 1, 2], size=n_samples, p=[0.35, 0.45, 0.20])

    # Days in Milk conditioned on stage
    days_in_milk = np.where(stages == 0, np.random.uniform(10, 90, n_samples),
                   np.where(stages == 1, np.random.uniform(91, 200, n_samples),
                                         np.random.uniform(201, 305, n_samples)))

    # Daily Feed Intake (kg dry matter)
    feed_intake = np.random.normal(23.0, 3.5, n_samples)
    feed_intake = np.clip(feed_intake, 14.0, 32.0)

    # Ambient Temperature Celsius
    ambient_temp = np.random.uniform(18.0, 34.0, n_samples)

    # Activity steps / rumination hours index
    rumination_hours = np.random.normal(8.0, 1.2, n_samples)

    # Target: Daily Milk Yield (Liters)
    # Biological formulas: Holstein produces more, early stage peak, feed boosts, heat stress depresses
    base_yield = np.where(breeds == 0, 28.5, np.where(breeds == 1, 21.0, 17.5))
    stage_multiplier = np.where(stages == 0, 1.18, np.where(stages == 1, 1.00, 0.78))
    feed_effect = (feed_intake - 20.0) * 0.55
    heat_stress = np.where(ambient_temp > 28.0, (ambient_temp - 28.0) * -0.45, 0.0)
    noise = np.random.normal(0, 1.2, n_samples)

    daily_yield = np.clip(base_yield * stage_multiplier + feed_effect + heat_stress + noise, 6.0, 45.0)

    df = pd.DataFrame({
        'breed_code': breeds,
        'weight_kg': np.round(weights, 1),
        'lactation_stage_code': stages,
        'days_in_milk': np.round(days_in_milk, 0),
        'feed_intake_kg': np.round(feed_intake, 1),
        'ambient_temp_c': np.round(ambient_temp, 1),
        'rumination_hours': np.round(rumination_hours, 1),
        'daily_yield_liters': np.round(daily_yield, 2)
    })
    return df

def train_milk_yield_models():
    print("[1/3] Generating synthetic livestock dataset...")
    df = generate_synthetic_dairy_data()

    X = df.drop(columns=['daily_yield_liters'])
    y = df['daily_yield_liters']

    print(f"Training dataset size: {X.shape[0]} rows, {X.shape[1]} features")

    # 1. Train XGBoost Model
    print("[2/3] Training XGBoost Regressor for Milk Yield...")
    xgb_reg = xgb.XGBRegressor(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    xgb_reg.fit(X, y)
    xgb_reg.save_model("models/milk_yield_xgb.json")
    print("[OK] Saved models/milk_yield_xgb.json")

    # 2. Train LightGBM Model
    try:
        print("[3/3] Training LightGBM Regressor for Milk Yield...")
        lgb_reg = lgb.LGBMRegressor(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.06,
            num_leaves=31,
            random_state=42,
            verbose=-1
        )
        lgb_reg.fit(X, y)
        joblib.dump(lgb_reg, "models/milk_yield_lgb.pkl")
        print("[OK] Saved models/milk_yield_lgb.pkl")
    except Exception as e:
        print(f"LightGBM note: {e}")

    # Feature Importance Summary
    feature_names = list(X.columns)
    importances = xgb_reg.feature_importances_
    feat_imp = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    print("\nTop Predictive Features (XGBoost):")
    for feat, imp in feat_imp:
        print(f"  - {feat}: {imp*100:.2f}%")

if __name__ == "__main__":
    train_milk_yield_models()
