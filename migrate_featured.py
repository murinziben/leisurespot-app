"""
Migration: add featured request fields to listings + clean category icons.
Run once: python migrate_featured.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from api.config import settings

engine = create_engine(settings.database_url)

CATEGORY_ICONS = {
    'safaris':  'paw-print',
    'dining':   'utensils',
    'wellness': 'sparkles',
    'sports':   'zap',
    'events':   'calendar-days',
    'lodges':   'tent',
    'family':   'users',
    'culture':  'landmark',
}

with engine.connect() as conn:
    # Add new columns (ignore if they already exist)
    for col, defn in [
        ('featured_requested',    'BOOLEAN DEFAULT FALSE'),
        ('featured_request_note', 'TEXT'),
        ('featured_expires_at',   'TIMESTAMP'),
    ]:
        try:
            conn.execute(text(f'ALTER TABLE listings ADD COLUMN {col} {defn}'))
            print(f'  + listings.{col}')
        except Exception:
            print(f'  ~ listings.{col} already exists')

    # Update category icons
    for slug, icon in CATEGORY_ICONS.items():
        result = conn.execute(
            text("UPDATE categories SET icon = :icon WHERE slug = :slug"),
            {'icon': icon, 'slug': slug}
        )
        print(f'  icon {slug} -> {icon} ({result.rowcount} row)')

    conn.commit()

print('\nMigration complete.')
