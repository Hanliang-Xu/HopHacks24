import pandas as pd

# Function to read the CSV file
def read_csv_file(file_path):
    try:
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return None

# Use the read_csv_file function to read in the CSV
file_path = "/Users/leonslaptop/Desktop/HopHacks24/frontend/public/spatial.csv"
data = read_csv_file(file_path)

# Check the content of the data
if data is not None:
    print(data.columns)
    print(data['region'].unique())  # Print unique region names to confirm available regions

# Assuming the first column contains the region names
def csv_to_region_info(data):
    regionInfo = {}
    for index, row in data.iterrows():
        region = row['region']  # Use 'region' as the key
        info = {
            f'Percentage Without Access to Healthcare in {year}': row.get(f'Percentage Without Access to Healthcare {year}', 'N/A')
            for year in range(2011, 2023)
        }
        info.update({
            f'Lower Limit of 95% CI {year}': row.get(f'Unnamed: 2' if year == 2011 else f'Lower Limit of 95% CI {year}', 'N/A')
            for year in range(2011, 2023)
        })
        info.update({
            f'Upper Limit of 95% CI {year}': row.get(f'Unnamed: 3' if year == 2011 else f'Upper Limit of 95% CI {year}', 'N/A')
            for year in range(2011, 2023)
        })
        info.update({
            f'Population Without Access to Healthcare {year}': row.get(f'Unnamed: 4' if year == 2011 else f'Population Without Access to Healthcare {year}', 'N/A')
            for year in range(2011, 2023)
        })
        info.update({
            f'Total Population {year}': row.get(f'Unnamed: 60' if year == 2011 else f'Total Population {year}', 'N/A')
            for year in range(2011, 2023)
        })
        regionInfo[region] = {"info": info}
    return regionInfo

# Convert CSV data to regionInfo
if data is not None:
    regionInfo = csv_to_region_info(data)
    
    # Use an actual region from your CSV data for testing
    polygon = type('Polygon', (object,), {'region': 'Baltimore City'})()  # Change 'Baltimore City' to other valid region names if needed

    # Updated HTML generation function to include CI limits for each year
    def generate_healthcare_headers(regionInfo, polygon):
        html_headers = []
        
        for year in range(2011, 2023):  # From 2011 to 2022 inclusive
            header = f"""
            <div>
                <p><strong>Percentage Without Access to Healthcare ({year}):</strong> 
                {regionInfo[polygon.region].get('info', {}).get(f'Percentage Without Access to Healthcare in {year}', 'N/A')}</p>
                <p><strong>Lower Limit of 95% CI ({year}):</strong> 
                {regionInfo[polygon.region].get('info', {}).get(f'Lower Limit of 95% CI {year}', 'N/A')}</p>
                <p><strong>Upper Limit of 95% CI ({year}):</strong> 
                {regionInfo[polygon.region].get('info', {}).get(f'Upper Limit of 95% CI {year}', 'N/A')}</p>
                <p><strong>Population Without Access to Healthcare ({year}):</strong> 
                {regionInfo[polygon.region].get('info', {}).get(f'Population Without Access to Healthcare {year}', 'N/A')}</p>
                <p><strong>Total Population ({year}):</strong> 
                {regionInfo[polygon.region].get('info', {}).get(f'Total Population {year}', 'N/A')}</p>
            </div>
            """
            html_headers.append(header)
        
        return html_headers

    # Generate HTML headers
    headers = generate_healthcare_headers(regionInfo, polygon)
    
    # Print the generated headers
    for header in headers:
        print(header)
