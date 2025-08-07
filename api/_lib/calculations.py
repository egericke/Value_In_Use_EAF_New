import numpy as np
from .models import ViuInput, Material, OperationalParams

# --- Constants ---
MW_SI, MW_SIO2, MW_CAO, MW_MGO = 28.09, 60.08, 56.08, 40.30
MW_AL, MW_AL2O3, MW_FE, MW_FEO = 26.98, 101.96, 55.85, 71.85
MW_C, MW_MN, MW_MNO, MW_P, MW_P2O5 = 12.01, 54.94, 70.94, 30.97, 141.94
DH_SI_OX = -910.9  # kJ/mol
DH_C_CO = -110.5   # kJ/mol for C -> CO
DH_C_CO2 = -393.5  # kJ/mol for C -> CO2
SLAG_SPEC_HEAT_KWH_KG = 0.6
CHEM_EFFICIENCY = 0.80
POST_COMB_EFFICIENCY = 0.30
USEFUL_ENERGY_FACTOR = 0.65
CO_GENERATION_FRACTION = 0.70 # % of carbon that becomes CO vs CO2

def _calculate_single_material_viu(material: Material, params: OperationalParams):
    """Calculates VIU for one material."""
    charge_kg = params.furnace_capacity_ton * 1000

    # --- 1. Mass Balance ---
    kg_fe = material.pct_fe / 100 * charge_kg
    kg_c = material.pct_c / 100 * charge_kg
    kg_si = material.pct_si / 100 * charge_kg
    kg_p = material.pct_p / 100 * charge_kg
    kg_s = material.pct_s / 100 * charge_kg
    kg_cu = material.pct_cu / 100 * charge_kg
    kg_sn = material.pct_sn / 100 * charge_kg
    kg_gangue_sio2 = material.gangue_sio2 / 100 * charge_kg
    
    # --- 2. Slag & Flux Calculation ---
    sio2_from_si_ox = kg_si * (MW_SIO2 / MW_SI)
    total_sio2 = sio2_from_si_ox + kg_gangue_sio2
    required_cao = params.basicity_target * total_sio2
    flux_penalty = (required_cao / 1000 * params.lime_cost_ton) / params.furnace_capacity_ton

    # --- 3. Yield Calculation ---
    # More robust FeO model: base + factor of slag vol
    slag_vol_base = total_sio2 + required_cao
    feo_pct_in_slag = 20.0 + (slag_vol_base / charge_kg * 100) * 0.1 - params.target_c * 10
    feo_pct_in_slag = np.clip(feo_pct_in_slag, 10, 35) # Clamp between 10% and 35%
    kg_feo_in_slag = (feo_pct_in_slag / 100) * slag_vol_base / (1 - feo_pct_in_slag / 100)
    total_slag_kg = slag_vol_base + kg_feo_in_slag
    lost_fe_kg = kg_feo_in_slag * (MW_FE / MW_FEO)
    yield_pct = ((kg_fe - lost_fe_kg) / kg_fe) * 100
    yield_loss_penalty = (lost_fe_kg / 1000 * params.fe_value_ton) / params.furnace_capacity_ton

    # --- 4. Energy Balance ---
    # Energy from Si Oxidation
    mol_si = kg_si / MW_SI
    kwh_from_si = (-DH_SI_OX * mol_si / 3600) * CHEM_EFFICIENCY * USEFUL_ENERGY_FACTOR
    # Energy from C Oxidation
    mol_c = kg_c / MW_C
    kwh_from_c_co = (-DH_C_CO * (mol_c * CO_GENERATION_FRACTION) / 3600) * CHEM_EFFICIENCY
    kwh_from_c_co2 = (-DH_C_CO2 * (mol_c * (1-CO_GENERATION_FRACTION)) / 3600) * CHEM_EFFICIENCY
    kwh_post_combustion = kwh_from_c_co * POST_COMB_EFFICIENCY
    total_energy_credit_kwh = kwh_from_si + kwh_from_c_co + kwh_from_c_co2 + kwh_post_combustion
    energy_credit = (total_energy_credit_kwh * params.electricity_cost) / params.furnace_capacity_ton
    
    # Slag energy penalty
    slag_energy_penalty = (total_slag_kg * SLAG_SPEC_HEAT_KWH_KG * params.electricity_cost) / params.furnace_capacity_ton

    # --- 5. Residuals Penalty ---
    # Updated dilution penalty logic
    dilution_needed_cu = max(0, (material.pct_cu - params.target_cu) / (material.pct_cu - params.prime_diluent_pct_cu)) if material.pct_cu > params.target_cu else 0
    # Opportunity cost: premium paid for diluent over the scrap it replaces
    copper_dilution_penalty = dilution_needed_cu * (params.prime_diluent_price - material.price_per_ton)

    # --- 6. Final VIU Calculation ---
    total_penalties = flux_penalty + yield_loss_penalty + slag_energy_penalty + copper_dilution_penalty
    viu_cost = material.price_per_ton + total_penalties - energy_credit
    cost_per_net_ton = viu_cost / (yield_pct / 100)

    return {
        "costPerNetTon": round(cost_per_net_ton, 2),
        "kpis": {
            "yieldPct": round(yield_pct, 2),
            "slagVolumeKgPerTon": round(total_slag_kg / params.furnace_capacity_ton, 2),
            "kwhCreditPerTon": round(total_energy_credit_kwh / params.furnace_capacity_ton, 2),
        },
        "costBreakdown": {
            "Base Price": material.price_per_ton,
            "Flux Penalty": round(flux_penalty, 2),
            "Yield Loss Penalty": round(yield_loss_penalty, 2),
            "Slag Energy Penalty": round(slag_energy_penalty, 2),
            "Copper Dilution Penalty": round(copper_dilution_penalty, 2),
            "Energy Credit": -round(energy_credit, 2),
        }
    }

def run_viu_calculation(viu_input: ViuInput):
    """Orchestrates the VIU calculation for two materials and a blend."""
    
    mat1_results = _calculate_single_material_viu(viu_input.material1, viu_input.params)
    mat2_results = _calculate_single_material_viu(viu_input.material2, viu_input.params)
    
    # --- Blend Calculation ---
    w1 = viu_input.blend_pct_mat1 / 100.0
    w2 = 1.0 - w1
    
    # Create a new blended material object in memory
    blended_mat_dict = {
        key: w1 * getattr(viu_input.material1, key, 0) + w2 * getattr(viu_input.material2, key, 0)
        for key in Material.__annotations__.keys() if key != 'name'
    }
    blended_mat = Material(**blended_mat_dict)
    blended_mat.name = "Blended"
    
    blend_results = _calculate_single_material_viu(blended_mat, viu_input.params)

    return {
        "material1": mat1_results,
        "material2": mat2_results,
        "blend": blend_results,
        "names": {
            "material1": viu_input.material1.name,
            "material2": viu_input.material2.name,
        }
    }
