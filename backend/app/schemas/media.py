from urllib.parse import urlsplit
import re

def image_url(value):
    if value is None or value == "":
        return None
    if re.fullmatch(r"/api/media/[0-9a-f-]{36}", value):
        return value
    url = urlsplit(value)
    if len(value) > 2048 or url.scheme != "https" or not url.hostname or url.username or url.password:
        raise ValueError("Use an uploaded photo or a full https image URL")
    return value
