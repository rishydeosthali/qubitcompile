import functions_framework
import subprocess
import sys

@functions_framework.http
def execute_code(request):
    # Set CORS headers for preflight requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    request_json = request.get_json(silent=True)
    if not request_json or 'code' not in request_json:
        return ('Invalid request: missing "code" in JSON body', 400, headers)

    code = request_json['code']

    try:
        # Execute the code in a separate process for security
        process = subprocess.run(
            [sys.executable, '-c', code],
            capture_output=True,
            text=True,
            timeout=60  # 30-second timeout
        )
        output = process.stdout
        if process.stderr:
            output += "\n--- STDERR ---" + process.stderr

        return (output, 200, headers)

    except subprocess.TimeoutExpired:
        return ('Execution timed out after 30 seconds.', 408, headers)
    except Exception as e:
        return (f"An error occurred: {e}", 500, headers)
