#!/usr/bin/env python3

# Compute the differences between two posts
# Expects the second file to be called FILE_PATH.new
# https://chatgpt.com/c/67784a11-8be8-800f-adf0-db86b9927922
# https://docs.python.org/3/library/difflib.html

import sys
import difflib

def main():
    if len(sys.argv) != 2:
        print("Usage: python post_diff.py FILE_PATH")
        sys.exit(1)

    file_path_1 = sys.argv[1]
    file_path_2 = file_path_1 + ".new"

    with open(file_path_1, "r") as file:
        file_content_1 = file.read()

    with open(file_path_2, "r") as file:
        file_content_2 = file.read()

    # Split strings into words and compute differences
    diff = difflib.unified_diff(file_content_1.split(), file_content_2.split(), lineterm="")

    # Display the differences
    print("\n".join(diff))

if __name__ == "__main__":
    main()
