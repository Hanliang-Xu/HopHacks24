import os

def rename_files_in_directory():
    # Get a list of all files in the current directory
    current_dir = os.getcwd()
    
    # Loop through all the files in the current directory
    for filename in os.listdir(current_dir):
        # Check if the file ends with .xls
        if filename.endswith('.xls'):
            # Construct the new filename by replacing .xls with .xlsw
            new_filename = filename.replace('.xls', '.xlsw', 1)
            # Rename the file
            os.rename(os.path.join(current_dir, filename), os.path.join(current_dir, new_filename))
            print(f"Renamed: {filename} -> {new_filename}")

if __name__ == "__main__":
    rename_files_in_directory()
