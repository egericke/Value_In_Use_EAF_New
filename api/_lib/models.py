from pydantic import BaseModel, Field
from typing import Optional

class Material(BaseModel):
    name: str = "Default Material"
    price_per_ton: float = Field(..., example=400.0)
    pct_fe: float = Field(..., example=95.0)
    pct_c: float = Field(..., example=0.5)
    pct_si: float = Field(..., example=0.2)
    pct_p: float = Field(..., example=0.02)
    pct_s: float = Field(..., example=0.02)
    pct_cu: float = Field(..., example=0.1)
    pct_sn: float = Field(..., example=0.01)
    gangue_sio2: float = Field(..., example=1.0)
    # Add other fields as needed from your SQL table

class OperationalParams(BaseModel):
    electricity_cost: float = Field(0.08, description="Cost per kWh in USD")
    lime_cost_ton: float = Field(150.0, description="Cost per metric ton of lime")
    fe_value_ton: float = Field(400.0, description="Value of iron units per ton")
    furnace_capacity_ton: float = Field(100.0)
    basicity_target: float = Field(2.5, description="Target CaO/SiO2 ratio")
    target_c: float = Field(0.1, description="Target carbon in liquid steel")
    target_cu: float = Field(0.1, description="Target max copper in liquid steel")
    prime_diluent_price: float = Field(500.0, description="Price of clean diluent like DRI")
    prime_diluent_pct_cu: float = Field(0.01, description="Copper content of prime diluent")

class ViuInput(BaseModel):
    material1: Material
    material2: Material
    blend_pct_mat1: float = Field(..., ge=0, le=100, description="Percentage of material 1 in the blend")
    params: OperationalParams
