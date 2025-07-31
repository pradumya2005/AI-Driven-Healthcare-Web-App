import pandas as pd
import numpy as np

# Load dataset
data = pd.read_csv("data/Training.csv")
AVAILABLE_SYMPTOMS = data.columns[:-1].tolist()
