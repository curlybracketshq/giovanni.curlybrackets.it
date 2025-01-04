#!/usr/bin/env python3

# Proof read blog post
# https://chatgpt.com/c/67775f71-f570-800f-85f7-5a2a8cf55057
# https://platform.openai.com/docs/api-reference/chat/create

import sys
import json
import http.client

def main():
    if len(sys.argv) != 3:
        print("Usage: python proof_read.py FILE_PATH BEARER_TOKEN")
        sys.exit(1)

    file_path = sys.argv[1]
    bearer_token = sys.argv[2]

    with open(file_path, "r") as file:
        file_content = file.read()

    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You're a professional editor."},
            {"role": "system", "content": "You should make as few changes as possible to improve the input content to make it more clear, to ensure it meets high-quality standards and achieves its purpose effectively."},
            {"role": "system", "content": "Proof read the content in input and output a new improved version of the content."},
            {"role": "user", "content": file_content}
        ]
    }

    host = "api.openai.com"
    endpoint = "/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json"
    }

    # Make the POST request
    connection = http.client.HTTPSConnection(host)
    connection.request("POST", endpoint, body=json.dumps(payload), headers=headers)

    # Get the response
    response = connection.getresponse()
    response_data = response.read().decode()

    # Close the connection
    connection.close()

    # Print response
    if response.status != 200:
        print("Error:", response.status, response_data)
        raise "There was an error"

    response_data_decoded = json.loads(response_data)
    new_content = response_data_decoded['choices'][0]['message']['content']

    with open(file_path, "w") as file:
        file.write(new_content)

    print(f"Replaced content of '{file_path}' successfully.")

if __name__ == "__main__":
    main()