import functions_framework
import subprocess
import sys
from flask import make_response

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
        response = make_response('Invalid request: missing "code" in JSON body', 400)
        response.headers.extend(headers)
        return response

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

        response = make_response(output, 200)
        response.headers.extend(headers)
        return response

    except subprocess.TimeoutExpired:
        response = make_response('Execution timed out after 30 seconds.', 408)
        response.headers.extend(headers)
        return response
    except Exception as e:
        response = make_response(f"An error occurred: {e}", 500)
        response.headers.extend(headers)
        return response