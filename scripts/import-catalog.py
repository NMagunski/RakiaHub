#!/usr/bin/env python3
"""Offline CSV/JSON -> pending catalog_imports SQL; never verifies or creates products.
Usage: python3 scripts/import-catalog.py file.csv --source https://licensed-source.example/data --date 2026-10-28 > pending.sql
Input needs external_id,name; optional producer,fruit,country,region,category,rights.
The caller must have permission to use the source; shop scraping is not supported.
"""
import argparse,csv,json,datetime,sys
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('file',type=Path);p.add_argument('--source',required=True);p.add_argument('--date',required=True)
a=p.parse_args();datetime.date.fromisoformat(a.date)
if not a.source.startswith(('https://','http://')):p.error('source must be an explicit source URL')
with a.file.open(encoding='utf-8-sig',newline='') as f: rows=json.load(f) if a.file.suffix=='.json' else list(csv.DictReader(f))
seen=set();statements=[]
def quote(v):return "'"+str(v).replace("'","''")+"'"
for n,row in enumerate(rows,2):
 if not row.get('external_id','').strip() or not row.get('name','').strip():p.error(f'row {n}: external_id and name required')
 key=row['external_id'].strip()
 if key in seen:p.error(f'row {n}: duplicate external_id {key}')
 seen.add(key)
 # Human review is mandatory, including category, duplicate matching and provenance.
 statements.append(f"insert into public.catalog_imports(source,fetched_at,external_id,payload) values({quote(a.source)},{quote(a.date+'T00:00:00Z')},{quote(key)},{quote(json.dumps(row,ensure_ascii=False))}::jsonb) on conflict(source,external_id) do nothing;")
print('-- Import staging only: all rows pending. Review usage rights before applying.\nbegin;')
print('\n'.join(statements));print('commit;')
print(f'{len(statements)} pending records; source={a.source}; date={a.date}',file=sys.stderr)
