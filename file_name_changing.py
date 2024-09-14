import os
import pyexcel as p

def convert_xls_to_xlsx():
    # Get the current working directory
    current_dir = os.getcwd()

    # Loop through all files in the directory
    for filename in os.listdir(current_dir):
        if filename.endswith(".xls") and not filename.endswith(".xlsx"):
            # Create full path for the original file
            file_path = os.path.join(current_dir, filename)
            
            # Construct the new filename with .xlsx extension
            new_filename = filename.replace('.xls', '.xlsx', 1)
            new_file_path = os.path.join(current_dir, new_filename)
            
            # Read the .xls file and save it as .xlsx
            try:
                p.save_book_as(file_name=file_path, dest_file_name=new_file_path)
                print(f"Converted: {filename} -> {new_filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    convert_xls_to_xlsx()
