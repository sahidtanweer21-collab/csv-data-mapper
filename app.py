import io

import pandas as pd
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Maximum upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# Stores the currently uploaded dataset in memory.
current_data = None


def get_stats(df):
    """Calculate basic statistics for the dataset."""
    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "missing": int(df.isna().sum().sum())
    }


def dataset_response():
    """Return the dataset and its statistics as JSON."""
    return jsonify({
        "headers": [str(column) for column in current_data.columns],
        "rows": current_data.fillna("").to_dict(orient="records"),
        "stats": get_stats(current_data)
    })


@app.route("/")
def home():
    """Display the main dashboard."""
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    """Receive and process an uploaded CSV file."""
    global current_data

    if "file" not in request.files:
        return jsonify({"error": "No file was provided."}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"error": "Please select a CSV file."}), 400

    filename = secure_filename(file.filename)

    if not filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported."}), 400

    try:
        df = pd.read_csv(
            file,
            dtype=str,
            keep_default_na=False,
            encoding="utf-8-sig"
        )

        if len(df.columns) == 0:
            return jsonify({"error": "The CSV file has no columns."}), 400

        if len(df.columns) > 200:
            return jsonify({
                "error": "The CSV contains too many columns."
            }), 400

        if df.columns.duplicated().any():
            return jsonify({
                "error": "Your CSV has duplicate column names. Please rename them and try again."
            }), 400

        # Convert empty or whitespace-only cells into missing values.
        df = df.replace(r"^\s*$", pd.NA, regex=True)

        current_data = df

        return dataset_response()

    except (UnicodeDecodeError, pd.errors.ParserError, ValueError) as error:
        return jsonify({
            "error": f"Could not read this CSV file: {error}"
        }), 400


@app.route("/rename", methods=["POST"])
def rename_column():
    """Rename a selected column."""
    global current_data

    if current_data is None:
        return jsonify({"error": "Upload a CSV file first."}), 400

    data = request.get_json(silent=True) or {}
    old_name = data.get("old_name")
    new_name = data.get("new_name")

    if old_name not in current_data.columns:
        return jsonify({
            "error": "The selected column does not exist."
        }), 400

    if not isinstance(new_name, str) or not new_name.strip():
        return jsonify({"error": "Enter a valid new column name."}), 400

    new_name = new_name.strip()

    if new_name in current_data.columns and new_name != old_name:
        return jsonify({
            "error": "That column name already exists."
        }), 400

    current_data = current_data.rename(
        columns={old_name: new_name}
    )

    return dataset_response()


@app.route("/remove-duplicates", methods=["POST"])
def remove_duplicates():
    """Remove duplicate rows from the dataset."""
    global current_data

    if current_data is None:
        return jsonify({"error": "Upload a CSV file first."}), 400

    original_count = len(current_data)

    current_data = current_data.drop_duplicates().reset_index(drop=True)

    removed_count = original_count - len(current_data)

    result = dataset_response().get_json()
    result["removed"] = int(removed_count)

    return jsonify(result)


@app.route("/fill-missing", methods=["POST"])
def fill_missing():
    """Replace missing cells with empty strings."""
    global current_data

    if current_data is None:
        return jsonify({"error": "Upload a CSV file first."}), 400

    filled_count = int(current_data.isna().sum().sum())

    current_data = current_data.fillna("")

    result = dataset_response().get_json()
    result["filled"] = filled_count

    return jsonify(result)


@app.route("/download", methods=["GET"])
def download():
    """Export the transformed dataset as a downloadable CSV."""
    if current_data is None:
        return jsonify({"error": "Upload a CSV file first."}), 400

    # Convert the DataFrame to CSV text, then encode it as bytes.
    csv_content = current_data.fillna("").to_csv(index=False)

    output = io.BytesIO(csv_content.encode("utf-8-sig"))
    output.seek(0)

    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name="transformed_data.csv"
    )


@app.errorhandler(413)
def file_too_large(error):
    """Return a friendly error for files larger than 10 MB."""
    return jsonify({
        "error": "File too large. The maximum upload size is 10 MB."
    }), 413


if __name__ == "__main__":
    app.run(debug=True)