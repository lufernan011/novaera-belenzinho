#!/usr/bin/env python3
"""Extrai conteúdo limpo do export do WordPress (tema Divi) para JSONs de seed.

Lê data/wp-export/{pages,posts}.json e gera data/seed/:
  - pages.json        blocos limpos (heading/paragraph/image) por página
  - posts.json        publicações com blocos limpos
  - board_members.json  diretoria (foto, nome, cargo)
  - presidents.json     presidentes (foto, nomes)
"""
import json
import os
import re
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, 'data', 'wp-export')
SEED = os.path.join(ROOT, 'data', 'seed')
os.makedirs(SEED, exist_ok=True)

SITE = 'https://www.novaerabelenzinho.org.br'
SIZE_SUFFIX = re.compile(r'-\d+x\d+(?=\.\w+$)')


def norm_img(src: str) -> str:
    """Normaliza URL de imagem para o caminho local em /acervo/, sem sufixo de tamanho."""
    if not src:
        return ''
    src = src.replace(SITE, '')
    src = SIZE_SUFFIX.sub('', src)  # -400x284.jpg -> .jpg
    if '/wp-content/uploads/' in src:
        src = src.split('/wp-content/uploads/')[-1].replace('/', '_')
    return '/acervo/' + src


def clean_blocks(html: str):
    """Converte HTML do Divi em lista de blocos ordenados."""
    soup = BeautifulSoup(html, 'html.parser')
    blocks = []
    seen_texts = set()
    for el in soup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'img', 'a']):
        if el.name == 'img':
            src = norm_img(el.get('src', ''))
            if src and not any(b.get('src') == src for b in blocks):
                blocks.append({'type': 'image', 'src': src, 'alt': el.get('alt', '')})
            continue
        if el.name == 'a':
            continue  # links tratados dentro dos parágrafos
        # pula wrappers do Divi (<p> que engoliu divs) e elementos com filhos de bloco
        if el.find(['div', 'h1', 'h2', 'h3', 'h4', 'p', 'img']):
            continue
        text = el.get_text(' ', strip=True)
        if not text or text in seen_texts:
            continue
        if '[et_pb' in text or '[/et_pb' in text:  # shortcodes crus do Divi
            continue
        seen_texts.add(text)
        kind = 'heading' if el.name in ('h1', 'h2', 'h3') else (
            'subheading' if el.name == 'h4' else 'paragraph')
        blocks.append({'type': kind, 'text': text})
    return blocks


def extract_people(html: str):
    """Extrai sequências (img, h4 nome, p cargo) — padrão do Divi para pessoas."""
    soup = BeautifulSoup(html, 'html.parser')
    people = []
    for h4 in soup.find_all('h4'):
        name = h4.get_text(' ', strip=True)
        if not name:
            continue
        role_el = h4.find_next('p')
        role = role_el.get_text(' ', strip=True) if role_el else ''
        img = h4.find_previous('img')
        photo = norm_img(img.get('src', '')) if img else ''
        people.append({'name': name, 'role': role, 'photo': photo})
    return people


pages_raw = json.load(open(os.path.join(EXPORT, 'pages.json')))
posts_raw = json.load(open(os.path.join(EXPORT, 'posts.json')))

pages_out = []
for p in pages_raw:
    html = p['content']['rendered']
    slug = p['slug']
    entry = {
        'wpId': p['id'],
        'slug': slug,
        'title': BeautifulSoup(p['title']['rendered'], 'html.parser').get_text(),
        'blocks': clean_blocks(html),
    }
    pages_out.append(entry)
    if slug == 'diretoria':
        json.dump(extract_people(html), open(os.path.join(SEED, 'board_members.json'), 'w'),
                  ensure_ascii=False, indent=2)
    if slug == 'presidentes':
        json.dump(extract_people(html), open(os.path.join(SEED, 'presidents.json'), 'w'),
                  ensure_ascii=False, indent=2)
    if slug == 'trabalhadores':
        # página guardada como shortcodes crus: extrai [et_pb_team_member name=... image_url=...]
        import html as htmllib
        unescaped = htmllib.unescape(html)
        workers = []
        for m in re.finditer(r'\[et_pb_team_member([^\]]*)\]', unescaped):
            attrs = m.group(1)
            name = re.search(r'(?<!admin_label )name=[”"]([^”"″]+)[”"″]', attrs)
            img = re.search(r'image_url=[”"]([^”"″]+)[”"″]', attrs)
            pos = re.search(r'position=[”"]([^”"″]+)[”"″]', attrs)
            if name:
                workers.append({
                    'name': name.group(1),
                    'role': pos.group(1) if pos else '',
                    'photo': norm_img(img.group(1)) if img else '',
                })
        json.dump(workers, open(os.path.join(SEED, 'workers.json'), 'w'),
                  ensure_ascii=False, indent=2)

json.dump(pages_out, open(os.path.join(SEED, 'pages.json'), 'w'), ensure_ascii=False, indent=2)

posts_out = []
for p in posts_raw:
    posts_out.append({
        'wpId': p['id'],
        'slug': p['slug'],
        'title': BeautifulSoup(p['title']['rendered'], 'html.parser').get_text(),
        'date': p['date'][:10],
        'blocks': clean_blocks(p['content']['rendered']),
    })
json.dump(posts_out, open(os.path.join(SEED, 'posts.json'), 'w'), ensure_ascii=False, indent=2)

print('páginas:', len(pages_out))
print('posts:', len(posts_out))
for f in ['board_members', 'presidents', 'workers']:
    data = json.load(open(os.path.join(SEED, f + '.json')))
    print(f + ':', len(data))
