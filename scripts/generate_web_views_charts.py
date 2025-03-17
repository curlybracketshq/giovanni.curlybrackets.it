import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.dates import DateFormatter
import matplotlib.dates as mdates
import boto3
import gzip
import io
import os
import sys
import urllib.parse
from collections import defaultdict
import datetime

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# S3 bucket details
prefix = "AWSLogs/772018703588/CloudFront/"

def extract_page_path(query):
    params = urllib.parse.parse_qs(query)
    page_uri = params.get("page", ["unknown"])[0]  # Default to "unknown" if page param is missing
    decoded_uri = urllib.parse.unquote(page_uri)  # Decode the URL-encoded page parameter
    return urllib.parse.urlparse(decoded_uri).path  # Extract the path section

def read_logs_from_s3(target_date):
    s3 = boto3.client("s3", region_name=AWS_REGION)
    paginator = s3.get_paginator("list_objects_v2")
    page_iterator = paginator.paginate(Bucket=S3_BUCKET_NAME, Prefix=prefix)

    all_data = []
    for page in page_iterator:
        for obj in page.get("Contents", []):
            file_key = obj["Key"]
            if not (file_key.endswith(".gz") and target_date in file_key):
                continue  # Filter files by date
            log_obj = s3.get_object(Bucket=S3_BUCKET_NAME, Key=file_key)
            with gzip.GzipFile(fileobj=io.BytesIO(log_obj["Body"].read())) as file:
                file_data = []
                for line in file:
                    line = line.decode("utf-8")
                    if line.startswith("#"):
                        continue  # Skip comments and headers
                    fields = line.strip().split("\t")
                    if len(fields) <= 12:
                        continue
                    date, time, _, _, _, method, _, uri, status, _, _, query, *_ = fields
                    if not (method == "GET" and uri.startswith("/pixel.gif") and status.startswith("2")):
                        continue  # Only successful GET requests
                    page_path = extract_page_path(query)
                    timestamp = f"{date} {time[:5]}"  # Minute-level granularity
                    file_data.append((timestamp, page_path))
                all_data.extend(file_data)  # Concatenate data from all files
    return all_data

# Target date in YYYY-MM format (to capture entire month)
target_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m")

# Read logs from S3 for the specific day
data = read_logs_from_s3(target_date)

# Convert to DataFrame
df = pd.DataFrame(data, columns=["timestamp", "page_path"])
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Aggregate requests
total_requests = df.groupby("timestamp").size()
page_requests = df.groupby(["timestamp", "page_path"]).size().unstack().fillna(0)

# Plot time-series traffic chart
_, ax = plt.subplots(figsize=(12, 6))
total_requests.plot(label="Total Views", color="royalblue")

plt.xlabel("Time")
plt.ylabel("Views")
plt.title("Monthly Views")
plt.xticks(rotation=45)

# Define the date format
date_form = DateFormatter("%m-%d")
ax.xaxis.set_major_formatter(date_form)

# Ensure a major tick for each week using (interval=1)
ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))

plt.tight_layout()
plt.savefig(f"charts/{target_date}-web-views.png")
plt.show()

# Compute top 10 most popular page paths
page_counts = df["page_path"].value_counts().head(10)
if not page_counts:
    print("Empty page counts list")
    sys.exit(1)

# Plot horizontal bar chart for top 10 pages
plt.figure(figsize=(10, 6))
page_counts.sort_values().plot(kind="barh", color="royalblue")
plt.xlabel("Views")
plt.ylabel("Page Path")
plt.title("Most Popular Pages")
plt.tight_layout()
plt.savefig(f"charts/{target_date}-top-10-pages.png")
plt.show()
