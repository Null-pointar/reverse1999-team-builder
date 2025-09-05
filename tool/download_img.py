import requests
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urljoin


def fetch_image_urls(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    img_tags = soup.find_all('img')
    return [
        urljoin(url, img['src'])
        for img in img_tags if 'src' in img.attrs
    ]


def download_images(urls, download_dir='images'):
    Path(download_dir).mkdir(exist_ok=True)
    for i, url in enumerate(urls):
        try:
            img_data = requests.get(url).content
            ext = url.split('.')[-1].split('?')[0]
            filename = f'image_{i:03d}.{ext}'
            with open(Path(download_dir) / filename, 'wb') as f:
                f.write(img_data)
            print(f'✅ {filename} downloaded')
        except Exception as e:
            print(f'❌ Error downloading {url}: {e}')



url = "https://www.prydwen.gg/re1999/tier-list"
image_urls = fetch_image_urls(url)
download_images(image_urls)