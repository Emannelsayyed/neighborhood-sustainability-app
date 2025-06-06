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
- **Environmental Health**: Green spaces, residential density, land use diversity, and impervious surfaces.
- **Social Equity**: Safety, education, and access to services like transportation, schools, hospitals, and fire stations.
- **Economic Vitality**: Income levels, employment stability, and housing affordability.

## Data Sources
The application requires two types of data inputs:
- **Satellite Imagery**:
  - **Source**: High-resolution images from platforms like [Sentinel-2](https://sentinel.esa.int/web/sentinel/missions/sentinel-2) or Google Earth.
  - **Purpose**: To extract environmental indicators such as green space area, dwelling units, land use types, and impervious surfaces.
  - **Format**: Multispectral or RGB images, typically processed to derive indicator values.
- **Tabular Data**:
  - **Source**: Census bureaus, local government databases, or GIS systems.
  - **Purpose**: To provide socio-economic data, including population, crime statistics, education levels, access to services, income, unemployment, and housing affordability.
  - **Format**: Structured data in CSV, JSON, or database formats.

## Feature Extraction from Satellite Imagery
Environmental indicators are derived from satellite imagery, potentially using AI or image processing techniques:
- **Green Space Area**: Identified using the Normalized Difference Vegetation Index (NDVI), where NDVI > 0.2 indicates vegetation. Tools like [Rasterio](https://rasterio.readthedocs.io/) or [OpenCV](https://opencv.org/) can be used.
- **Dwelling Units**: Estimated through image segmentation to count residential buildings, combined with property data to determine dwelling units.
- **Land Use Types**: Classified into categories (e.g., residential, commercial, industrial, green space).
- **Impervious Surfaces**: Identified through image analysis to detect non-permeable surfaces like roads and parking lots.

## Indicator Calculations
The sustainability index is based on 14 indicators across three categories, calculated from raw or pre-processed data. Below are the indicators, their calculations, and required inputs:

### Environmental Indicators
1. **Green Space Percentage (GSP)**:
   - **Purpose**: Measures the proportion of vegetated area, indicating environmental health and carbon sequestration.
   - **Calculation**: \(\text{GSP} = \left( \frac{\text{Area of green space (m²)}}{\text{Total area (m²)}} \right) \times 100\)
   - **Inputs**: Area of green space (m²), total neighborhood area (m²).
   - **Example**: 250,000 m² vegetated out of 1,000,000 m² yields GSP = 25%.

2. **Average Residential Density (ARD)**:
   - **Purpose**: Reflects compact development, reducing urban sprawl.
   - **Calculation**: \(\text{ARD} = \frac{\text{Total dwelling units}}{\text{Total area (acres)}}\), where 1 km² = 247.105 acres.
   - **Inputs**: Total dwelling units, total area (m² or acres).
   - **Example**: 2,470 dwelling units in 1 km² (247.105 acres) yields ARD = 10 DU/acre.

3. **Land Use Diversity (LUD)**:
   - **Purpose**: Measures variety of land use types for balanced urban planning.
   - **Calculation**: Shannon Diversity Index, \(\text{LUD} = - \sum_{i=1}^{n} p_i \ln(p_i)\), where \(p_i\) is the proportion of land use type \(i\) (e.g., residential, commercial).
   - **Inputs**: Area of each land use type (m²), total area (m²).
   - **Example**: For 40% residential, 30% commercial, 20% green space, 10% industrial (n=4): \(\text{LUD} = - (0.4 \ln 0.4 + 0.3 \ln 0.3 + 0.2 \ln 0.2 + 0.1 \ln 0.1) \approx 1.28\).

4. **Impervious Surface Percentage (ISP)**:
   - **Purpose**: Indicates non-permeable surfaces affecting runoff and urban heat.
   - **Calculation**: \(\text{ISP} = \left( \frac{\text{Area of impervious surfaces (m²)}}{\text{Total area (m²)}} \right) \times 100\)
   - **Inputs**: Area of impervious surfaces (m²), total area (m²).
   - **Example**: 300,000 m² impervious out of 1,000,000 m² yields ISP = 30%.

### Social Indicators
1. **Crime Rate (CR)**:
   - **Purpose**: Indicates safety and social cohesion.
   - **Calculation**: \(\text{CR} = \left( \frac{\text{Number of crimes}}{\text{Total population}} \right) \times 1000\)
   - **Inputs**: Number of crimes, total population.
   - **Example**: 50 crimes in 10,000 people yields CR = 5 per 1,000.

2. **Education Level (EL)**:
   - **Purpose**: Reflects human capital and educational attainment.
   - **Calculation**: \(\text{EL} = \left( \frac{\text{Number with bachelor's degree or higher}}{\text{Total adult population}} \right) \times 100\)
   - **Inputs**: Number of adults with bachelor’s degree or higher, total adult population.
   - **Example**: 3,000 out of 8,000 adults yields EL = 37.5%.

3. **Access to Public Transportation (APT)**:
   - **Purpose**: Measures mobility and reduces vehicle use.
   - **Calculation**: \(\text{APT} = \left( \frac{\text{Number of residents within 1/2 mile of transit}}{\text{Total population}} \right) \times 100\)
   - **Inputs**: Number of residents within 800 m of a transit stop, total population.
   - **Example**: 8,500 out of 10,000 residents yields APT = 85%.

4. **Access to Schools (AS)**:
   - **Purpose**: Measures proximity to educational facilities.
   - **Calculation**: \(\text{AS} = \left( \frac{\text{Number of residents within 1/2 mile of a school}}{\text{Total population}} \right) \times 100\)
   - **Inputs**: Number of residents within 800 m of a school, total population.
   - **Example**: 8,000 out of 10,000 residents yields AS = 80%.

5. **Access to Hospitals (AH)**:
   - **Purpose**: Measures proximity to healthcare services.
   - **Calculation**: \(\text{AH} = \left( \frac{\text{Number of residents within 1 mile of a hospital}}{\text{Total population}} \right) \times 100\)
   - **Inputs**: Number of residents within 1.6 km of a hospital, total population.
   - **Example**: 9,000 out of 10,000 residents yields AH = 90%.

6. **Access to Fire Stations (AF)**:
   - **Purpose**: Measures proximity to emergency services.
   - **Calculation**: \(\text{AF} = \left( \frac{\text{Number of residents within 2 miles of a fire station}}{\text{Total population}} \right) \times 100\)
   - **Inputs**: Number of residents within 3.2 km of a fire station, total population.
   - **Example**: 9,500 out of 10,000 residents yields AF = 95%.

7. **Walkability (W)**:
   - **Purpose**: Reflects pedestrian-friendly design.
   - **Calculation**: \(\text{W} = \frac{\text{Number of intersections}}{\text{Total area (square miles)}}\)
   - **Inputs**: Number of street intersections, total area (square miles).
   - **Example**: 120 intersections in 1 square mile yields W = 120 intersections/sq mile.

### Economic Indicators
1. **Median Household Income (MHI)**:
   - **Purpose**: Indicates economic prosperity.
   - **Calculation**: Direct value from data.
   - **Inputs**: Median annual household income ($).
   - **Example**: $50,000.

2. **Unemployment Rate (UR)**:
   - **Purpose**: Reflects economic stability.
   - **Calculation**: \(\text{UR} = \left( \frac{\text{Number unemployed}}{\text{Labor force}} \right) \times 100\)
   - **Inputs**: Number of unemployed, total labor force.
   - **Example**: 500 unemployed out of 10,000 labor force yields UR = 5%.

3. **Housing Affordability (HA)**:
   - **Purpose**: Measures access to affordable housing.
   - **Calculation**: Percentage of housing units with costs ≤30% of median household income.
   - **Inputs**: Number of affordable housing units, total housing units.
   - **Example**: 700 out of 1,000 units affordable yields HA = 70%.

## Normalization and Weighting
Each indicator is normalized to a 0–1 scale to ensure comparability:
- **Higher-is-Better Indicators** (GSP, ARD, LUD, EL, APT, AS, AH, AF, W, MHI, HA):
  - Use \(\text{I}_i = \min\left(1, \frac{x}{\text{threshold}}\right)\) for non-percentage indicators or \(\text{I}_i = \frac{x}{100}\) for percentages.
- **Lower-is-Better Indicators** (CR, ISP, UR):
  - Use \(\text{I}_i = 1 - \frac{x}{\text{threshold}}\) or \(\text{I}_i = 1 - \frac{x}{100}\).

**Normalization Thresholds**:
- GSP: \(\text{I}_{\text{GSP}} = \min\left(1, \frac{\text{GSP}}{50}\right)\) (50% as a high benchmark, per urban planning targets).
- ARD: \(\text{I}_{\text{ARD}} = \min\left(1, \frac{\text{ARD}}{12}\right)\) (12 DU/acre aligns with LEED ND compact development).
- LUD: \(\text{I}_{\text{LUD}} = \frac{\text{LUD}}{\ln(4)}\) (assumes 4 land use types for maximum diversity).
- ISP: \(\text{I}_{\text{ISP}} = 1 - \frac{\text{ISP}}{100}\).
- CR: \(\text{I}_{\text{CR}} = 1 - \frac{\text{CR}}{100}\).
- EL: \(\text{I}_{\text{EL}} = \frac{\text{EL}}{100}\).
- APT: \(\text{I}_{\text{APT}} = \frac{\text{APT}}{100}\).
- AS: \(\text{I}_{\text{AS}} = \frac{\text{AS}}{100}\).
- AH: \(\text{I}_{\text{AH}} = \frac{\text{AH}}{100}\).
- AF: \(\text{I}_{\text{AF}} = \frac{\text{AF}}{100}\).
- W: \(\text{I}_{\text{W}} = \min\left(1, \frac{\text{W}}{140}\right)\) (140 intersections/sq mile per LEED ND connectivity standards).
- MHI: \(\text{I}_{\text{MHI}} = \min\left(1, \frac{\text{MHI}}{100000}\right)\) ($100,000 as a high-income benchmark).
- UR: \(\text{I}_{\text{UR}} = 1 - \frac{\text{UR}}{20}\) (20% as a high unemployment threshold).
- HA: \(\text{I}_{\text{HA}} = \frac{\text{HA}}{100}\).

**Weighting**:
- **Environmental (40%)**: Reflects the significant environmental impact of urban areas.
  - GSP: 12% (health and carbon sequestration).
  - ARD: 8% (compact development).
  - LUD: 8% (balanced planning).
  - ISP: 12% (runoff and heat island effects).
- **Social (30%)**: Prioritizes access to services and safety.
  - CR: 4% (safety).
  - EL: 4% (human capital).
  - APT: 5% (mobility).
  - AS: 5% (education access).
  - AH: 5% (healthcare access).
  - AF: 3% (emergency services).
  - W: 4% (walkability).
- **Economic (30%)**: Reflects economic vitality.
  - MHI: 10% (prosperity).
  - UR: 10% (stability).
  - HA: 10% (housing access).

**Aggregation**:
- Environmental Score: \(\text{E} = \frac{\text{I}_{\text{GSP}} + \text{I}_{\text{ARD}} + \text{I}_{\text{LUD}} + \text{I}_{\text{ISP}}}{4}\)
- Social Score: \(\text{S} = \frac{\text{I}_{\text{CR}} + \text{I}_{\text{EL}} + \text{I}_{\text{APT}} + \text{I}_{\text{AS}} + \text{I}_{\text{AH}} + \text{I}_{\text{AF}} + \text{I}_{\text{W}}}{7}\)
- Economic Score: \(\text{C} = \frac{\text{I}_{\text{MHI}} + \text{I}_{\text{UR}} + \text{I}_{\text{HA}}}{3}\)
- Sustainability Index: \(\text{Index} = (0.4 \times \text{E} + 0.3 \times \text{S} + 0.3 \times \text{C}) \times 100\)

## Web Application Structure
### Backend (FastAPI)

### Frontend (React)
React using vite and and JS as variant.
