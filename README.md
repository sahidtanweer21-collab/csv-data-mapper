# Mapper Studio — CSV Data Mapper

A Python-based web application for uploading, previewing, cleaning, and exporting CSV files.

## About the Project

Mapper Studio makes basic CSV data processing easier through a simple web interface. Users can upload a CSV file, inspect its contents, view dataset statistics, rename columns, remove duplicate records, handle missing values, and export the transformed data.

## Features

- Upload CSV files.
- Preview data in a table.
- View total rows and columns.
- Detect missing values.
- Rename columns.
- Remove duplicate rows.
- Fill missing cells.
- Search displayed data.
- Export transformed data as a CSV file.
- Dark-themed user interface.

## Technologies Used

- Python
- Flask
- Pandas
- HTML
- CSS
- JavaScript

## Project Structure

```text
csv-data-mapper/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js