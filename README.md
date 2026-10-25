# ORDEXA — Data Transformation Workspace

**Turn Data Chaos Into Clarity.**

ORDEXA is a Python-based web application designed to make CSV data inspection and transformation simple. Upload a dataset, explore its contents, clean inconsistencies, and export the transformed data through a modern, dark-themed interface.

## ✨ Features

- 📂 **CSV Upload** — Import CSV files for processing.
- 📊 **Data Preview** — View uploaded data in a structured table.
- 📈 **Dataset Statistics** — Check row counts, column counts, and missing values.
- ✏️ **Rename Columns** — Change column names to make datasets easier to understand.
- 🧹 **Remove Duplicates** — Identify and remove duplicate rows.
- 🪄 **Fill Missing Values** — Handle empty cells in the dataset.
- 🔍 **Search Data** — Search the displayed table.
- 📥 **CSV Export** — Download the transformed dataset.
- 🎨 **Modern Interface** — Explore your data through a responsive, dark-themed dashboard.

## 🛠️ Built With

- **Python** — Application logic
- **Flask** — Web framework and backend routes
- **Pandas** — CSV processing and data transformation
- **HTML5** — Page structure
- **CSS3** — Interface styling and responsive layout
- **JavaScript** — Frontend interactions

## 📁 Project Structure

```text
csv-data-mapper/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── static/
│   ├── script.js
│   └── style.css
└── templates/
    └── index.html
```

## ⚙️ Installation and Setup

### Prerequisites

- Python installed on your computer
- Git installed on your computer

### 1. Clone the repository

```bash
git clone https://github.com/sahidtanweer21-collab/csv-data-mapper.git
```

### 2. Open the project directory

```bash
cd csv-data-mapper
```

### 3. Create a virtual environment

```bash
python -m venv .venv
```

### 4. Activate the virtual environment

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
.venv\Scripts\activate.bat
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000/
```

## 🔄 How It Works

1. Upload a CSV file.
2. Inspect the dataset and its statistics.
3. Search the displayed data or rename a column.
4. Remove duplicate rows or fill missing cells.
5. Download the transformed dataset as a CSV file.

## 🎯 Project Goal

ORDEXA was developed as a learning project to explore Python web development, data processing with Pandas, frontend-backend communication, and Git-based version control.

## 👨‍💻 Author

**Sahid Tanweer**

Developed as a programming project using Python, Flask, Pandas, HTML, CSS, and JavaScript.

---

*ORDEXA — Turn Data Chaos Into Clarity.*