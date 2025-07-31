# import pandas as pd
# import numpy as np
# from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, accuracy_score
# from sklearn.model_selection import train_test_split
# import matplotlib.pyplot as plt
# import seaborn as sns
# from model import DiseasePredictor

# def main():
#     # Load the dataset
#     data = pd.read_csv("Training.csv")
#     X = data.iloc[:, 1:]  # Features (symptoms)
#     y = data.iloc[:, 0]   # Disease labels

#     # Split into training and testing sets (80% training, 20% testing)
#     X_train, X_test, y_train, y_test = train_test_split(
#         X, y, test_size=0.2, random_state=42
#     )
    
#     print(f"Training set shape: {X_train.shape}")
#     print(f"Test set shape: {X_test.shape}")

#     # Initialize and train the DiseasePredictor
#     predictor = DiseasePredictor()
#     predictor.train("Training.csv")
#     symptom_columns = predictor.symptom_columns

#     # Determine the most frequent disease in the training set
#     most_common_disease = y_train.mode()[0]

#     predictions = []

#     # For each sample in X_test
#     for idx, row in X_test.iterrows():
#         symptoms_present = [symptom for symptom, value in zip(symptom_columns, row) if value == 1]
        
#         if not symptoms_present:
#             # Assign the most common disease if no symptoms are present
#             predictions.append(most_common_disease)
#         else:
#             diseases, confidences = predictor.predict(symptoms_present)
#             if diseases:
#                 predictions.append(diseases[0])
#             else:
#                 predictions.append(most_common_disease)

#     # Convert predictions and y_test to strings to avoid type conflicts
#     predictions = [str(pred) for pred in predictions]
#     y_test = y_test.astype(str)

#     # Compute evaluation metrics
#     precision = precision_score(y_test, predictions, average='weighted', zero_division=0)
#     recall = recall_score(y_test, predictions, average='weighted', zero_division=0)
#     f1 = f1_score(y_test, predictions, average='weighted', zero_division=0)
#     accuracy = accuracy_score(y_test, predictions)
#     cm = confusion_matrix(y_test, predictions)

#     print("Precision:", precision)
#     print("Recall:", recall)
#     print("F1 Score:", f1)
#     print("Accuracy:", accuracy)
#     print("Confusion Matrix:")
#     print(cm)

#     # Visualize the confusion matrix
#     plt.figure(figsize=(10, 8))
#     all_labels = np.unique(np.concatenate((y_test.unique(), np.array(predictions))))
#     sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
#                 xticklabels=all_labels, yticklabels=all_labels)
#     plt.xlabel("Predicted Label")
#     plt.ylabel("True Label")
#     plt.title("Confusion Matrix")
#     plt.tight_layout()
#     plt.show()

# if __name__ == '__main__':
#     main()

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    # Load the dataset
    data = pd.read_csv("Training.csv")
    X = data.iloc[:, 1:]  # Features (symptoms)
    y = data.iloc[:, 0]   # Disease labels

    # Encode target labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # One-hot encode the features
    X_encoded = pd.get_dummies(X)

    # Feature selection
    selector = SelectKBest(score_func=chi2, k=50)
    X_selected = selector.fit_transform(X_encoded, y_encoded)

    # Split into training and testing sets (80% training, 20% testing)
    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y_encoded, test_size=0.2, random_state=42
    )

    print(f"Training set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")

    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Initialize individual models
    rf = RandomForestClassifier(random_state=42)
    gb = GradientBoostingClassifier(random_state=42)
    svm = SVC(probability=True, random_state=42)

    # Create a voting ensemble
    ensemble = VotingClassifier(estimators=[
        ('rf', rf), ('gb', gb), ('svm', svm)
    ], voting='soft')

    # Hyperparameter tuning
    param_grid = {
        'rf__n_estimators': [100, 200],
        'gb__n_estimators': [100, 200],
        'svm__C': [0.1, 1, 10]
    }

    grid_search = GridSearchCV(estimator=ensemble, param_grid=param_grid, cv=5)
    grid_search.fit(X_train_scaled, y_train)

    best_model = grid_search.best_estimator_

    # Cross-validation scores
    cv_scores = cross_val_score(best_model, X_train_scaled, y_train, cv=5)
    print(f"Cross-validation accuracy: {cv_scores.mean():.2f}")

    # Predictions
    y_pred = best_model.predict(X_test_scaled)

    # Evaluation metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print("Accuracy:", accuracy)
    print("Precision:", precision)
    print("Recall:", recall)
    print("F1 Score:", f1)
    print("Confusion Matrix:")
    print(cm)

    # Visualize the confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
