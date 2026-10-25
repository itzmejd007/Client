import urllib.request
import json
import re

base_site = 'https://animetoon.in'
xml_entries = []

# Fetch all TV shows
page = 1
while True:
    try:
        url = f'https://api.animetoon.in/api/tvshows?page={page}&page_size=100'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
        shows = data.get('tv_shows', [])
        if not shows:
            break
        for s in shows:
            tid = s.get('tmdb_id')
            title = s.get('title') or ''
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            loc = f'{base_site}/ser/{tid}/{slug}' if slug else f'{base_site}/ser/{tid}'
            xml_entries.append(f'  <url>\n    <loc>{loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>')
        page += 1
        if len(shows) < 100:
            break
    except Exception as e:
        print('Error fetching tv page', page, e)
        break

# Fetch all Movies
page = 1
while True:
    try:
        url = f'https://api.animetoon.in/api/movies?page={page}&page_size=100'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
        movies = data.get('movies', [])
        if not movies:
            break
        for m in movies:
            mid = m.get('tmdb_id')
            title = m.get('title') or ''
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            loc = f'{base_site}/mov/{mid}/{slug}' if slug else f'{base_site}/mov/{mid}'
            xml_entries.append(f'  <url>\n    <loc>{loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>')
        page += 1
        if len(movies) < 100:
            break
    except Exception as e:
        print('Error fetching movies page', page, e)
        break

print(f'Total anime/movie pages found: {len(xml_entries)}')

static_pages = '''  <url>
    <loc>https://animetoon.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://animetoon.in/movies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://animetoon.in/series</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://animetoon.in/collections</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>'''

xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml_content += static_pages + '\n'
xml_content += '\n'.join(xml_entries) + '\n'
xml_content += '</urlset>\n'

with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(xml_content)

print('Successfully generated public/sitemap.xml with all individual anime post links!')
