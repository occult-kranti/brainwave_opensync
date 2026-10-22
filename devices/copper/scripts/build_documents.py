#!/usr/bin/env python3
"""Render original project reports, not entire third-party source documents."""
from pathlib import Path
import html
import sys
import mistune

root, out = map(Path, sys.argv[1:3])
target = out/'documents'
target.mkdir(exist_ok=True)
markdown = mistune.create_markdown(escape=True, plugins=['table', 'strikethrough', 'url'])
style = '''body{margin:0;background:#eeeae1;color:#183b35;font:16px/1.7 Arial,sans-serif}header,main,footer{max-width:960px;margin:auto;padding:24px}header{border-bottom:1px solid #bbc5b6}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}h1{font-size:42px}h2{margin-top:48px;font-size:30px}a{color:#8e422a;text-underline-offset:3px}table{width:100%;border-collapse:collapse;font-size:13px;display:block;overflow:auto}td,th{border:1px solid #bcc8b8;padding:10px;text-align:left;vertical-align:top}code,pre{font:13px/1.6 monospace}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#e3e3d7;padding:16px}code{overflow-wrap:anywhere}blockquote{border-left:3px solid #b35f3b;padding-left:20px}footer{font-size:12px}nav{display:flex;flex-wrap:wrap;gap:18px}@media(max-width:600px){h1{font-size:32px}main{padding:20px}}@media print{body{background:white;color:#111;font-size:11pt}header nav{display:none}h1{font-size:26pt}h2{font-size:18pt;break-after:avoid}tr,pre{break-inside:avoid}a{color:#222}table{display:table;overflow:visible;font-size:9pt}header,main,footer{padding:8px}h2{margin-top:24px}}'''
count = 0
for source in sorted((root/'research').glob('*.md')):
    text = source.read_text()
    title = next((line.lstrip('# ').strip() for line in text.splitlines() if line.startswith('# ')), source.stem)
    content = markdown(text)
    page = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><style>'+style+'</style><header><strong>FIELDWORK · COPPER EXPERIMENT</strong><nav><a href="../index.html">Overview</a><a href="../gateway.html">Gateway audit</a><a href="../protocol.html">Protocol</a><a href="../sources.html">Source network</a><a href="../versions.html">Versions & issues</a></nav></header><main>'+content+'</main><footer>Original project analysis · AI-assisted review, not human peer review · No physical sphere measurements. <a href="../research/'+source.name+'">Download Markdown</a> · <a href="../deployment.json">Exact build provenance</a></footer></html>'
    (target/(source.stem+'.html')).write_text(page)
    count += 1
print(f'Rendered {count} project research documents.')
