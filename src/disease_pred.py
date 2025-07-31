import streamlit as st
from model import DiseasePredictor
from nlp_processor import SymptomExtractor
from symptoms import AVAILABLE_SYMPTOMS
import os

# Disable oneDNN optimizations to avoid numerical variations
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Initialize the disease predictor and symptom extractor
@st.cache_resource
def load_models():
    predictor = DiseasePredictor()
    predictor.train("Training.csv")
    extractor = SymptomExtractor()
    return predictor, extractor

def main():
    # Set page config for favicon
    st.set_page_config(
        page_title="Disease Prediction System",
        page_icon="generated-icon.png"
    )
    
    # Add logo to top-left
    col1, col2 = st.columns([1, 5])
    with col1:
        st.image("generated-icon.png", width=80)
    with col2:
        st.title("Disease Prediction System")

    # Load models
    predictor, extractor = load_models()

    # Initialize session state for symptoms
    if 'confirmed_symptoms' not in st.session_state:
        st.session_state.confirmed_symptoms = set()
    if 'messages' not in st.session_state:
        st.session_state.messages = []

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])

    # Chat input with symptom suggestions
    prompt = st.chat_input("Describe your symptoms")

    if prompt:
        # Display user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)

        # Extract symptoms from user input
        extracted_symptoms = extractor.extract_symptoms(prompt, predictor.symptom_index)

        # Assistant response
        with st.chat_message("assistant"):
            if not extracted_symptoms:
                response = "I couldn't identify any specific symptoms. Please try being more specific."
            else:
                # Add extracted symptoms to confirmed symptoms
                st.session_state.confirmed_symptoms.update(extracted_symptoms)

                # Show identified symptoms
                response = "I identified the following symptoms:\n" + "\n".join([f"- {s}" for s in extracted_symptoms])
                
                # Make prediction with current symptoms if at least 3 are present
                if len(st.session_state.confirmed_symptoms) >= 3:
                    diseases, confidences = predictor.predict(list(st.session_state.confirmed_symptoms))
                    result = "\nTop 3 Predictions:"
                    
                    # Collect all diagnostic tests for predicted diseases
                    all_tests = {}
                    for disease, confidence in zip(diseases, confidences):
                        if disease in TESTS:
                            for test in TESTS[disease]:
                                if test not in all_tests:
                                    all_tests[test] = []
                                all_tests[test].append(disease)
                    
                    for i, (disease, confidence) in enumerate(zip(diseases, confidences), 1):
                        result += f"\n{i}. {disease} (Confidence: {confidence:.1f}%)"
                        if disease in TESTS:
                            result += f"\n   Recommended diagnostic tests: {', '.join(TESTS[disease])}"
                    
                    st.write(result)
                    
                    # Display common diagnostic tests across multiple diseases
                    st.write("\n🏥 Common Diagnostic Test Recommendations:")
                    common_tests = [test for test, diseases in all_tests.items() if len(diseases) > 1]
                    if common_tests:
                        for test in common_tests:
                            st.write(f"- {test}")
                    
                    st.write("\n⚠️ Note: These are general recommendations. Please consult a healthcare professional for further diagnosis.")
                    
                    if confidences[0] < 50:
                        st.write("Note: The confidence is low. Please consult a healthcare professional for accurate diagnosis.")
                else:
                    remaining = 3 - len(st.session_state.confirmed_symptoms)
                    response += f"\nPlease describe {remaining} more symptom{'s' if remaining > 1 else ''} for a prediction."
            
            st.write(response)
            st.session_state.messages.append({"role": "assistant", "content": response})

    # Add a clear button
    if st.button("Clear All"):
        st.session_state.confirmed_symptoms.clear()
        st.session_state.messages = []
        st.rerun()

if __name__ == "__main__":
    main()
