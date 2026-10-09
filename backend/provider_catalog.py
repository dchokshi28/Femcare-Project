"""Canonical care-provider identities used to validate booking requests."""

from fastapi import HTTPException


PROVIDERS = {
    "vadodara-1": {"name": "BuildingRace Hospital", "specialty": "Gynecology & Obstetrics"},
    "vadodara-2": {"name": "Jetalpur Road Multispecialty Hospital", "specialty": "Advanced Multispecialty Care"},
    "vadodara-3": {"name": "Sun-Pharma Hospital", "specialty": "Women's Care Unit & Gynae Services"},
    "vadodara-4": {"name": "Akshar Hospital", "specialty": "High-risk Pregnancy & Laparoscopic Gynae Care"},
    "vadodara-5": {"name": "Dr. Reshmi Banerjee Clinic", "specialty": "Women's Health, Maternity & Gynae"},
    "vadodara-6": {"name": "Waghodia Hospital", "specialty": "Obstetrics & Gynecology"},
    "vadodara-7": {"name": "Shree Krishna Hospital", "specialty": "Gynecology & Obstetrics"},
    "vadodara-8": {"name": "Apex Women's Clinic", "specialty": "Reproductive Health & Fertility"},
    "vadodara-9": {"name": "Nandaben Hospital", "specialty": "Women Health & Gynae"},
    "vadodara-10": {"name": "Dr. Meera Shah Gynae Clinic", "specialty": "PCOS, Menstrual Health"},
}


def validate_provider(provider_id: str, hospital: str | None = None, specialty: str | None = None) -> dict:
    """Return the canonical provider only when submitted details agree with its ID."""
    provider = PROVIDERS.get(provider_id)
    if provider is None:
        raise HTTPException(status_code=422, detail="The selected care provider is invalid. Refresh the page and try again.")
    if hospital is not None and hospital.strip() != provider["name"]:
        raise HTTPException(status_code=409, detail="The selected hospital does not match the provider. Please select it again.")
    if specialty is not None and specialty.strip() != provider["specialty"]:
        raise HTTPException(status_code=409, detail="The selected specialty does not match the hospital. Please select it again.")
    return provider
