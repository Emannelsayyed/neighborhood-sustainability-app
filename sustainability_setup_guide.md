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