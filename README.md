# Disease Prediction System

An intelligent, machine learning-driven web application that predicts diseases based on user-reported symptoms. Offers transparent model explanations and medication suggestions, making it suitable for rapid prototyping, academic research, and real-world deployments via Streamlit.

---

## 🚀 Key Features

* 🤖 **Symptom-Based Disease Prediction**
  Leverages user-input symptoms to predict likely diseases.

* 🧠 **Ensemble of Machine Learning Models**
  Combines Random Forest, Support Vector Machine (SVM), and Naive Bayes classifiers for robust predictions.

* 📝 **NLP-Driven Symptom Matching**
  Utilizes natural language processing techniques to ensure resilient and context-aware symptom interpretation.

* 📊 **Model Evaluation & Performance Metrics**
  Built-in utilities for validating accuracy, precision, recall, and confusion matrices.

* 💊 **Treatment Recommendations**
  Provides basic prescription suggestions aligned with the predicted condition.

* 📈 **Interactive Jupyter Notebook**
  Includes a preconfigured notebook for exploratory analysis and demonstration.

* 🖼️ **Modern UI with Streamlit**
  Intuitive, responsive user interface for seamless interaction.

---

## 🌳 Project Directory Overview

```text
Ai-Driven-Healthcare-Webapp/
│
├── .gitignore            # Version control exclusions
├── LICENSE               # MIT License declaration
├── pyproject.toml        # Optional: project configuration for build tools
├── README.md             # Project documentation (this file)
├── requirements.txt      # Python package dependencies
│
├── assets/               # Icons, logos, and static media
│   └── generated-icon.png
│
├── data/                 # Training and testing datasets
│   ├── Training.csv
│   └── Testing.csv
│
├── models/               # Serialized machine learning models
│   ├── nb_model.pkl
│   ├── rf_model.pkl
│   └── svm_model.pkl
│
├── notebooks/            # Jupyter notebooks for analysis and demo
│   └── disease_pred.ipynb
│
├── scripts/              # Scripts for training and evaluating models
│   ├── train_models.py
│   └── evaluate_model.py
│
└── src/                  # Source code for application logic
    ├── app.py                # Main entry point (Streamlit app)
    ├── disease_pred.py       # CLI/chatbot interface and logic
    ├── model.py              # ML pipeline and DiseasePredictor class
    ├── nlp_processor.py      # NLP utilities for parsing symptoms
    ├── prescriptions.py      # Prescription mappings for diagnoses
    └── symptoms.py           # Loads and manages symptom vocabulary
```

---

## ⚙️ Environment Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd Ai-Driven-Healthcare-Webapp
   ```

2. **Create and Activate a Virtual Environment**

   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Required Packages**

   ```bash
   pip install -r requirements.txt
   ```

---

## 🖥️ Running the Application

### 🌐 Launch the Streamlit Web Interface

```bash
streamlit run app.py
```

* Access the application via the local URL shown in the terminal.
* Interact via the chat-like interface by entering your symptoms to receive diagnosis and treatment suggestions.

### 🧪 Retrain Models (Optional)

```bash
python scripts/train_models.py
```

* Rebuilds all ML models using `Training.csv` and updates the `.pkl` files.

### 📊 Evaluate Model Performance (Optional)

```bash
python scripts/evaluate_model.py
```

* Displays accuracy and confusion matrices for the current set of models.

### 📓 Open the Jupyter Notebook (Optional)

```bash
jupyter notebook notebooks/disease_pred.ipynb
```

---

## 🤝 Contributing Guidelines

We welcome contributions! To contribute:

* Fork this repository and create a new branch for your feature or fix.
* Ensure your code is well-documented with docstrings and inline comments.
* Add or update tests where applicable.
* Submit a pull request with a clear, concise description of changes.

---

## 🙋 Author

Developed by **@pradumya2005**

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat\&logo=github\&logoColor=white)](https://github.com/pradumya2005)
  
[![Email](https://img.shields.io/badge/-Email-D14836?style=flat\&logo=gmail\&logoColor=white)](mailto:salunkepradumya@gmail.com)
  
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=flat\&logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/pradumya-salunke-7582b428a)

---

## 📄 License

Distributed under the MIT License. See the `LICENSE` file for full details.
