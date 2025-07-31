import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# Load dataset
data = pd.read_csv("Training.csv")

# Separate features (X) and target (y)
X = data.iloc[:, :-1]  # Symptoms
y = data.iloc[:, -1]   # Disease labels

# Split dataset into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize models
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
nb_model = GaussianNB()
svm_model = SVC(kernel='linear', probability=True, random_state=42)

# Train models
rf_model.fit(X_train, y_train)
nb_model.fit(X_train, y_train)
svm_model.fit(X_train, y_train)

# Evaluate models
rf_acc = accuracy_score(y_test, rf_model.predict(X_test))
nb_acc = accuracy_score(y_test, nb_model.predict(X_test))
svm_acc = accuracy_score(y_test, svm_model.predict(X_test))

print(f"Random Forest Accuracy: {rf_acc:.2f}")
print(f"Naïve Bayes Accuracy: {nb_acc:.2f}")
print(f"SVM Accuracy: {svm_acc:.2f}")

# Save trained models
with open("rf_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)

with open("nb_model.pkl", "wb") as f:
    pickle.dump(nb_model, f)

with open("svm_model.pkl", "wb") as f:
    pickle.dump(svm_model, f)

print("Models trained and saved successfully!")
