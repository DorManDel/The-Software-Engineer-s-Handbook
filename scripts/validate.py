#!/usr/bin/env python3
"""Validate basic Milestone 0 inventory invariants without external dependencies."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((root/p).read_text(encoding='utf-8'))
curr=load('data/public/official_curriculum.json')
assert curr['years']==4 and curr['credits_total']==160
rows=curr['entries']
assert len(rows)==56
assert len({x['curriculum_entry_id'] for x in rows})==len(rows)
assert {(x['year'],x['semester']) for x in rows}=={(y,s) for y in range(1,5) for s in ('A','B')}
if (root/'data/private/personal_course_history.json').exists():
    assert len(load('data/private/personal_course_history.json')['courses'])>=20
public=load('data/public/public_sources.json')['sources']
assert public and all(s['visibility']=='public' for s in public)
private=load('data/private/private_sources.json')['sources'] if (root/'data/private/private_sources.json').exists() else []
assert all(s['visibility']=='private' for s in private)
assert all(s['id'] for s in public+private)
assert len({s['id'] for s in public+private})==len(public+private)
concept=load('pilot/concept.json');lab=load('pilot/lab.json'); assignment=load('pilot/assignment.json')
assert concept['review_state']=='draft' and concept['id'] in lab['concept_ids']
assert assignment['visibility']=='private'
assert load('schemas/content-v0.1.schema.json')['$defs']['concept']
print(f"PASS: {len(rows)} curriculum entries; {len(public)} public sources; {len(private)} private sources; pilot records present.")