from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database import get_db
from shared.models import Category, Listing, ListingStatus

router = APIRouter(prefix="/categories", tags=["categories"])


def category_to_dict(cat, listing_count=0, children=None):
    return {
        "id": cat.id,
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "icon": cat.icon,
        "sort_order": cat.sort_order,
        "listing_count": listing_count,
        "children": children or [],
    }


@router.get("/")
def list_categories(db: Session = Depends(get_db)):
    counts = dict(
        db.query(Listing.category_id, func.count(Listing.id))
        .filter(Listing.status == ListingStatus.ACTIVE)
        .group_by(Listing.category_id)
        .all()
    )

    top_level = db.query(Category).filter(
        Category.parent_id == None,
        Category.is_active == True
    ).order_by(Category.sort_order).all()

    result = []
    for cat in top_level:
        children = [
            category_to_dict(child, counts.get(child.id, 0))
            for child in cat.children if child.is_active
        ]
        result.append(category_to_dict(cat, counts.get(cat.id, 0), children))

    return {"success": True, "data": result}


@router.get("/{slug}")
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True, "data": category_to_dict(cat)}
