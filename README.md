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

## Directory Structure
```
neighborhood-sustainability-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── sustainability.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── calculator.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── sustainability.py
│   │   └── core/
│   │       ├── __init__.py
│   │       └── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── frontend/
│   ├── public/
│   │   └──index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calculator/
│   │   │   │   ├── GeographicDataDisplay.jsx
│   │   │   │   ├── MapSelector.jsx
│   │   │   │   ├── CalculatorForm.jsx
│   │   │   │   ├── ResultsDisplay.jsx
│   │   │   │   └── IndicatorInput.jsx
│   │   │   ├── Layout/
│   │   │   │   └── Layout.jsx
│   │   │   └── Common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ErrorMessage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

# Neighborhood Sustainability Index - Complete Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
1. **Python 3.13+** - [Download from python.org](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
3. **Git** - [Download from git-scm.com](https://git-scm.com/)
4. **Docker & Docker Compose** (Optional) - [Download from docker.com](https://www.docker.com/)

### Verify Installations
```bash
python --version  # Should show 3.13+
node --version    # Should show 18+
npm --version     # Should show 9+
git --version     # Should show 2.0+
docker --version  # (Optional)
```

## Project Setup

### Step 1: Get the Project code files from github by this clone link:

https://github.com/Mustafa-Alqazzoun/neighborhood-sustainability-app.git


### Step 2: Setup Backend (FastAPI)

Navigate to the backend directory:
```bash
cd backend
```
Create a Python virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Step 3: Setup Frontend (React)

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install  dependencies:
```bash
npm install 
```
Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```


## Running the Application

### Option 1: Run Locally (Recommended for Development)

#### Start the Backend:
```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`
API documentation will be available at: `http://localhost:8000/docs`

#### Start the Frontend (in a new terminal):
```bash
cd frontend

# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### Option 2: Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

## Testing the Application

### 1. Test Backend API
Visit `http://localhost:8000/docs` to see the interactive API documentation.

Test the health endpoint:
```bash
curl http://localhost:8000/api/health
```

### 2. Test Example Calculation
```bash
curl -X POST "http://localhost:8000/api/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "environmental": {
      "green_space_area": 250000,
      "total_area": 1000000,
      "dwelling_units": 2470,
      "residential_area": 400000,
      "commercial_area": 300000,
      "industrial_area": 100000,
      "impervious_surface_area": 300000
    },
    "social": {
      "total_population": 10000,
      "total_crimes": 50,
      "adults_with_degree": 3000,
      "total_adult_population": 8000,
      "residents_near_transit": 8500,
      "residents_near_schools": 8000,
      "residents_near_hospitals": 9000,
      "residents_near_fire_stations": 9500,
      "street_intersections": 120
    },
    "economic": {
      "median_household_income": 50000,
      "unemployed_count": 500,
      "labor_force": 6000,
      "affordable_housing_units": 700,
      "total_housing_units": 1000
    }
  }'
```

### 3. Access the Frontend
Open your browser and navigate to `http://localhost:5173`

## Troubleshooting

### Common Issues:

1. **Port already in use**:
   - Change the port in the command: `uvicorn app.main:app --reload --port 8001`
   - Or kill the process using the port

2. **CORS errors**:
   - Ensure the backend is running on port 8000
   - Check that CORS middleware is properly configured

3. **Python import errors**:
   - Ensure you're in the correct directory
   - Verify the virtual environment is activated
   - Check that all required packages are installed

4. **Node.js dependency issues**:
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

5. **Docker issues**:
   - Ensure Docker Desktop is running
   - Try `docker-compose down` then `docker-compose up --build`

```

The application is now ready for development and testing!
