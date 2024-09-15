import pandas as pd
import glob as glob
file_path = r'C:\Users\HopeUgwuoke\Hophacks\urban county\AgeAdj.xlsx'

def digit(variable):
    return variable.isdigit()
    
def clean_query_file(file_path):
    file = pd.read_excel(file_path)
    file_name = list(file.columns)[0]
    file.columns = [1,2,3,4,5,6,7,8]
    file = file.drop([0,6])
    
    deletion_match = file[1].str.contains('Data Notes', case=False, na=False)
    deletion_point = file[deletion_match].index[0]
    file = file.iloc[8:deletion_point-2]
    file_rownames = file[1]
    file_percentages = file[5]
    file = pd.concat([file_rownames,file_percentages],axis = 1)
    
    file.columns = [1,'Percentage']
        
    listf = list(file_name)
    filtered = filter(digit, file_name)
    year = ''
    for i in filtered:
        year += str(i)
    
    file['Year']= [int(year)]*file.shape[0]
    file.to_excel(f"{file_name}.xlsx",index = False)
    return file

clean_query_file(file_path)