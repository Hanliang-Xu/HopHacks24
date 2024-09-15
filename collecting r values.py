r_path = r'C:\Users\HopeUgwuoke\Hophacks\data\*'
r_vals = pd.DataFrame()

for data in glob.glob(r_path):
    print(data)
    
    # Read the Excel file
    data = pd.read_excel(data)
    
    # Transpose the DataFrame
    data = data.T
    
    # Reset the index after transposing
    file = data.reset_index(drop=True)
    
    # Set the second row (index 1) as the column names
    file.columns = file.iloc[1].values
    
    # Get the row names from the first row (index 0) but skip the first column
    row_names = list(file.iloc[0])[1:]
    
    # Drop rows that have NaN values in the columns you will use
    file = file.apply(pd.to_numeric, errors='coerce')  # Convert data to numeric, coercing errors to NaN
    file.dropna(inplace=True)  # Remove rows with NaN values
    
    # Loop over the columns to calculate correlation
    for i in range(1, len(row_names) + 1):  # Loop through each column except the first
        x = file.iloc[:, 0][1:]  # Values from the first column
        y = file.iloc[:, i][1:]  # Values from the i-th column
        
        if len(x) > 1 and len(y) > 1:  # Ensure there are at least 2 valid data points
            corr = np.corrcoef(x, y)
            r_val = corr[1, 0]  # Extract the correlation coefficient
        
            # Concatenate the r_val with r_vals DataFrame
            r_vals = pd.concat([r_vals, pd.DataFrame([[row_names[i-1], r_val]])])