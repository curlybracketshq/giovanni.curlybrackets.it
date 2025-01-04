#!/usr/bin/env python3

# Format blog post to reduce changes (not new lines unless required)
# https://platform.openai.com/docs/api-reference/chat/create

import sys
import json
import http.client

def main():
    if len(sys.argv) != 3:
        print("Usage: python format_post.py FILE_PATH BEARER_TOKEN")
        sys.exit(1)

    file_path = sys.argv[1]
    bearer_token = sys.argv[2]

    with open(file_path, "r") as file:
        file_content = file.read()

    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You're a tool to format posts written in Markdown."},
            {"role": "system", "content": "Your task is to take the input content and remove all new lines that are not required, i.e. new lines that don't result in a new paragraph or a line break."},
            {"role": "system", "content": "You must not make any change to the content other than removing new lines."},
            {"role": "system", "content": "You must not make any change to the content front matter, i.e. the content at the top of the content inside the block that starts and end with '---'."},
            {"role": "system", "content": "You must preserve new lines that are useful to format the content, i.e. new lines after each item in a ordered or unordered list."},
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
    choices = response_data_decoded['choices']
    print(f"The model returned {len(choices)} choices")
    new_content = choices[0]['message']['content']

    if new_content.replace("\n", "") == file_content.replace("\n", ""):
        print("New content is the same as old content except for new lines")
    elif new_content.replace("\n", "").replace(" ", "") == file_content.replace("\n", "").replace(" ", ""):
        print("New content is the same as old content except for new lines and white spaces")
    else:
        print("New content is different, saving as new file")
        file_path += ".new"

    with open(file_path, "w") as file:
        file.write(new_content)

    print(f"Replaced content of '{file_path}' successfully.")

if __name__ == "__main__":
    main()