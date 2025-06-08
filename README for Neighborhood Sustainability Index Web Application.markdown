# Neighborhood Sustainability Index Web Application

## Table of Contents
- [Project Overview](#project-overview)
- [Data Sources](#data-sources)
- [Feature Extraction from Satellite Imagery](#feature-extraction-from-satellite-imagery)
- [Indicator Calculations](#indicator-calculations)
- [Normalization and Weighting](#normalization-and-weighting)
- [Web Application Structure](#web-application-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Example Calculation](#example-calculation)
- [License](#license)

## Project Overview
This project develops a web application to calculate a neighborhood sustainability index, a score from 0 to 100 that evaluates a neighborhood’s sustainability based on environmental, social, and economic indicators. The index is computed using equations derived from validated urban planning frameworks, such as [LEED for Neighborhood Development](https://www.usgbc.org/leed/rating-systems/neighborhood-development). Environmental indicators may be extracted from satellite imagery using AI or image processing tools, but the final index calculation relies on mathematical formulas, ensuring transparency and reproducibility. The application uses [FastAPI](https://fastapi.tiangolo.com/) for the backend to handle calculations and [React](https://reactjs.org/) for the frontend to provide an intuitive user interface.

The sustainability index reflects a neighborhood’s performance in:
- **Environmental Health**: Green spaces, residential density, land use diversity, impervious surfaces, and air quality.
- **Social Equity**: Safety, education, and access to services like transportation, schools, hospitals, fire stations, and police stations.
- **Economic Vitality**: Income levels, employment stability, and housing affordability.

## Data Sources
The application requires two types of data inputs:
- **Satellite Imagery**:
  - **Source**: High-resolution images from platforms like [Sentinel-2](https://sentinel.esa.int/web/sentinel/missions/sentinel-2) or Google Earth, and air quality data from Google Earth Engine’s Sentinel-5P TROPOMI dataset (`COPERNICUS/S5P/NRTI/L3_AER_AI`).
  - **Purpose**: To extract environmental indicators such as green space area, dwelling units, land use types, impervious surfaces, and annual average Aerosol Optical Depth (AOD) for air quality.
  - **Format**: Multispectral or RGB images for most indicators, processed AOD data for air quality.
- **Tabular Data**:
  - **Source**: Census bureaus, local government databases, or GIS systems.
  - **Purpose**: To provide socio-economic data, including population, crime statistics, education levels, access to services (including police stations), income, unemployment, and housing affordability.
  - **Format**: Structured data in CSV, JSON, or database formats.

## Feature Extraction from Satellite Imagery
Environmental indicators are derived from satellite imagery, potentially using AI or image processing techniques:
- **Green Space Area**: Identified using the Normalized Difference Vegetation Index (NDVI), where NDVI > 0.2 indicates vegetation. Tools like [Rasterio](https://rasterio.readthedocs.io/) or [OpenCV](https://opencv.org/) can be used.
- **Dwelling Units**: Estimated through image segmentation to count residential buildings, combined with property data to determine dwelling units.
- **Land Use Types**: Classified into categories (e.g., residential, commercial, industrial, green space).
- **Impervious Surfaces**: Identified through image analysis to detect non-permeable surfaces like roads and parking lots.
- **Air Quality**: Extracted from Google Earth Engine’s Sentinel-5P TROPOMI dataset, providing annual average AOD at ~7 km resolution for the most recent year (e.g., 2024), computed by aggregating daily or monthly data.

## Indicator Calculations
The sustainability index is based on 16 indicators across three categories, calculated from raw or pre-processed data. Below are the indicators, their calculations, and required inputs:

### Environmental Indicators
1. **Green Space Percentage (GSP)**:
   - **Purpose**: Measures the proportion of vegetated area, indicating environmental health and carbon sequestration.
   - **Calculation**: GSP = (Area of green space (m²) / Total area (m²)) * 100
   - **Inputs**: Area of green space (m²), total neighborhood area (m²).
   - **Example**: 250,000 m² vegetated out of 1,000,000 m² yields GSP = 25%.

2. **Average Residential Density (ARD)**:
   - **Purpose**: Reflects compact development, reducing urban sprawl.
   - **Calculation**: ARD = Total dwelling units / Total area (acres), where 1 km² = 247.105 acres.
   - **Inputs**: Total dwelling units, total area (m² or acres).
   - **Example**: 2,470 dwelling units in 1 km² (247.105 acres) yields ARD = 10 DU/acre.

3. **Land Use Diversity (LUD)**:
   - **Purpose**: Measures variety of land use types for balanced urban planning.
   - **Calculation**: Shannon Diversity Index, LUD = - ∑ (p_i * ln(p_i)), where p_i is the proportion of land use type i (e.g., residential, commercial).
   - **Inputs**: Area of each land use type (m²), total area (m²).
   - **Example**: For 40% residential, 30% commercial, 20% green space, 10% industrial (n=4): LUD = - (0.4 * ln(0.4) + 0.3 * ln(0.3) + 0.2 * ln(0.2) + 0.1 * ln(0.1)) ≈ 1.28.

4. **Impervious Surface Percentage (ISP)**:
   - **Purpose**: Indicates non-permeable surfaces affecting runoff and urban heat.
   - **Calculation**: ISP = (Area of impervious surfaces (m²) / Total area (m²)) * 100
   - **Inputs**: Area of impervious surfaces (m²), total area (m²).
   - **Example**: 300,000 m² impervious out of 1,000,000 m² yields ISP = 30%.

5. **Air Quality (AQ)**:
   - **Purpose**: Measures annual average Aerosol Optical Depth (AOD), indicating air pollution levels affecting health.
   - **Calculation**: AQ = Annual average AOD from Google Earth Engine’s Sentinel-5P TROPOMI dataset (`COPERNICUS/S5P/NRTI/L3_AER_AI`), computed by averaging daily or monthly AOD for the previous year (e.g., 2024).
   - **Inputs**: AOD value for the neighborhood area.
   - **Example**: Annual average AOD of 0.3 yields AQ = 0.3.

### Social Indicators
1. **Crime Rate (CR)**:
   - **Purpose**: Indicates safety and social cohesion.
   - **Calculation**: CR = (Number of crimes / Total population) * 1000
   - **Inputs**: Number of crimes, total population.
   - **Example**: 50 crimes in 10,000 people yields CR = 5 per 1,000.

2. **Education Level (EL)**:
   - **Purpose**: Reflects human capital and educational attainment.
   - **Calculation**: EL = (Number with bachelor's degree or higher / Total adult population) * 100
   - **Inputs**: Number of adults with bachelor’s degree or higher, total adult population.
   - **Example**: 3,000 out of 8,000 adults yields EL = 37.5%.

3. **Access to Public Transportation (APT)**:
   - **Purpose**: Measures mobility and reduces vehicle use.
   - **Calculation**: APT = (Number of residents within 1/2 mile of transit / Total population) * 100
   - **Inputs**: Number of residents within 800 m of a transit stop, total population.
   - **Example**: 8,500 out of 10,000 residents yields APT = 85%.

4. **Access to Schools (AS)**:
   - **Purpose**: Measures proximity to educational facilities.
   - **Calculation**: AS = (Number of residents within 1/2 mile of a school / Total population) * 100
   - **Inputs**: Number of residents within 800 m of a school, total population.
   - **Example**: 8,000 out of 10,000 residents yields AS = 80%.

5. **Access to Hospitals (AH)**:
   - **Purpose**: Measures proximity to healthcare services.
   - **Calculation**: AH = (Number of residents within 1 mile of a hospital / Total population) * 100
   - **Inputs**: Number of residents within 1.6 km of a hospital, total population.
   - **Example**: 9,000 out of 10,000 residents yields AH = 90%.

6. **Access to Fire Stations (AF)**:
   - **Purpose**: Measures proximity to emergency services.
   - **Calculation**: AF = (Number of residents within 2 miles of a fire station / Total population) * 100
   - **Inputs**: Number of residents within 3.2 km of a fire station, total population.
   - **Example**: 9,500 out of 10,000 residents yields AF = 95%.

7. **Walkability (W)**:
   - **Purpose**: Reflects pedestrian-friendly design.
   - **Calculation**: W = Number of intersections / Total area (square miles)
   - **Inputs**: Number of street intersections, total area (square miles).
   - **Example**: 120 intersections in 1 square mile yields W = 120 intersections/sq mile.

8. **Access to Police (AP)**:
   - **Purpose**: Measures proximity to police services, enhancing safety.
   - **Calculation**: PA = (Number of residents within 1 mile of a police station / Total population) * 100
   - **Inputs**: Number of residents within 1.6 km of a police station, total population.
   - **Example**: 9,200 out of 10,000 residents yields PA = 92%.

### Economic Indicators
1. **Median Household Income (MHI)**:
   - **Purpose**: Indicates economic prosperity.
   - **Calculation**: Direct value from data.
   - **Inputs**: Median annual household income ($).
   - **Example**: $50,000.

2. **Unemployment Rate (UR)**:
   - **Purpose**: Reflects economic stability.
   - **Calculation**: UR = (Number unemployed / Labor force) * 100
   - **Inputs**: Number of unemployed, total labor force.
   - **Example**: 500 unemployed out of 10,000 labor force yields UR = 5%.

3. **Housing Affordability (HA)**:
   - **Purpose**: Measures access to affordable housing.
   - **Calculation**: Percentage of housing units with costs ≤30% of median household income.
   - **Inputs**: Number of affordable housing units, total housing units.
   - **Example**: 700 out of 1,000 units affordable yields HA = 70%.

## Normalization and Weighting
Each indicator is normalized to a 0–1 scale to ensure comparability:
- **Higher-is-Better Indicators** (GSP, ARD, LUD, EL, APT, AS, AH, AF, W, MHI, HA, PA):
  - Use I_i = min(1, x / threshold) for non-percentage indicators or I_i = x / 100 for percentages.
- **Lower-is-Better Indicators** (CR, ISP, UR, AQ):
  - Use I_i = 1 - (x / threshold) or I_i = 1 - (x / 100).

**Normalization Thresholds**:
- GSP: I_GSP = min(1, GSP / 50) (50% as a high benchmark, per urban planning targets).
- ARD: I_ARD = min(1, ARD / 12) (12 DU/acre aligns with LEED ND compact development).
- LUD: I_LUD = LUD / ln(4) (assumes 4 land use types for maximum diversity).
- ISP: I_ISP = 1 - (ISP / 100).
- AQ: I_AQ = 1 - min(1, AQ / 1) (AOD ranges from 0 to 1, where 1 is high pollution).
- CR: I_CR = 1 - (CR / 100).
- EL: I_EL = EL / 100.
- APT: I_APT = APT / 100.
- AS: I_AS = AS / 100.
- AH: I_AH = AH / 100.
- AF: I_AF = AF / 100.
- W: I_W = min(1, W / 140) (140 intersections/sq mile per LEED ND connectivity standards).
- MHI: I_MHI = min(1, MHI / 100000) ($100,000 as a high-income benchmark).
- UR: I_UR = 1 - (UR / 20) (20% as a high unemployment threshold).
- HA: I_HA = HA / 100.
- PA: I_PA = PA / 100.

**Weighting**:
- **Environmental (40%)**: Reflects the significant environmental impact of urban areas.
  - GSP: 10% (health and carbon sequestration).
  - ARD: 7% (compact development).
  - LUD: 7% (balanced planning).
  - ISP: 8% (runoff and heat island effects).
  - AQ: 8% (air pollution and health impacts).
- **Social (30%)**: Prioritizes access to services and safety.
  - CR: 4% (safety).
  - EL: 3% (human capital).
  - APT: 4% (mobility).
  - AS: 4% (education access).
  - AH: 4% (healthcare access).
  - AF: 3% (emergency services).
  - W: 4% (walkability).
  - PA: 4% (safety services access).
- **Economic (30%)**: Reflects economic vitality.
  - MHI: 10% (prosperity).
  - UR: 10% (stability).
  - HA: 10% (housing access).

**Aggregation**:
- Environmental Score: E = (I_GSP + I_ARD + I_LUD + I_ISP + I_AQ) / 5
- Social Score: S = (I_CR + I_EL + I_APT + I_AS + I_AH + I_AF + I_W + I_PA) / 8
- Economic Score: C = (I_MHI + I_UR + I_HA) / 3
- Sustainability Index: Index = (0.4 * E + 0.3 * S + 0.3 * C) * 100

## Web Application Structure
### Backend (FastAPI)

### Frontend (React)
React using vite and JS as variant.

