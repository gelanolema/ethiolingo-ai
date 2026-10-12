
# 🌍 EthioLingo AI

### AI-Powered English to Afaan Oromoo and Amharic Translator

EthioLingo AI is a web-based translation application designed to help users translate English text into Afaan Oromoo, Amharic, or both languages. It combines a responsive web interface with a Python FastAPI backend and an AI translation model.

## ✨ Features

- 🌐 English to Afaan Oromoo translation
- 🇪🇹 English to Amharic translation
- 🔄 Translate into both languages
- 🧠 AI-powered translation using NLLB-200
- 📚 Translation history
- 📋 Copy translated text
- 🧹 Clear input and output
- 🌙 Dark/light theme support (if enabled)
- 📱 Responsive user interface
- ⚠️ Translation status and error messages

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript
- Python
- FastAPI
- Hugging Face Transformers
- Facebook NLLB-200 distilled 600M

## 📁 Project Structure

```text
ethiolingo-ai/
├── backend/
│   ├── app.py
│   └── quality.py
├── index.html
├── style.css
├── script.js
├── requirements.txt
├── .gitignore
└── README.md
```

> Adjust filenames in this tree if your actual project uses different names.

## ⚙️ Requirements

- Python 3.11 or compatible version
- Git
- A modern web browser
- Internet connection for downloading the AI model
- Sufficient memory and storage for the model and its dependencies

## 🚀 Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ethiolingo-ai
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Create a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 4. Start the backend

From the project root:

```powershell
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

### 5. Open the API documentation

Visit:

http://127.0.0.1:8000/docs

### 6. Open the frontend

Open `index.html` in your browser, or use the VS Code Live Server extension.

The frontend must be configured to connect to the running backend API.

## 🧪 Testing

Try translating these sample sentences:

| English | Target language |
|---|---|
| Good morning. | Afaan Oromoo |
| How are you? | Afaan Oromoo |
| Welcome to EthioLingo AI. | Amharic |
| I am a student. | Both Languages |

Also test the copy button, clear button, translation history, and page refresh.

## 🔐 Security Notes

- Never commit API keys, passwords, or `.env` files.
- Do not commit your Python virtual environment.
- Keep model caches and large model files out of Git.
- Configure CORS and API settings appropriately before public deployment.
- Do not expose a local development server as a public production service.

## 🚀 Deployment

The frontend can be hosted on a static hosting platform. The FastAPI backend must be deployed separately to a Python-compatible hosting service.

Update the frontend API URL to use the deployed backend's HTTPS endpoint before publishing the application online.

## 🎯 Project Goal

The goal of EthioLingo AI is to make digital communication more accessible by supporting translation into Afaan Oromoo and Amharic.

## 👨‍💻 Developer

Created as an AI translation project focused on Ethiopian languages.

## 📄 License

Choose and add an appropriate open-source license before distributing this project.
