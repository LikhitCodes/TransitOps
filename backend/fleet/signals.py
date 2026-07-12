"""
Signals for the fleet app.

Currently lightweight — the heavy status-transition logic (dispatch, complete,
cancel, maintenance) lives in operations/signals.py using atomic transactions.

This file is scaffolded here so the Django app registry and AppConfig.ready()
are wired correctly, ready for any future fleet-level signal needs.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

# Importing models here would cause circular imports during app loading.
# Always import lazily inside the receiver function body.


@receiver(post_save, sender='fleet.Driver')
def check_driver_license_on_save(sender, instance, created, **kwargs):
    """
    After any Driver save, log a warning if the license is expired.
    This is informational only — automatic status changes for expired licenses
    are a Safety Officer decision, not an automated system action.

    The /api/drivers/eligible/ endpoint already filters these drivers out
    of the dispatch form without touching their status field.
    """
    if instance.is_license_expired and instance.status == 'Available':
        import logging
        logger = logging.getLogger('fleet')
        logger.warning(
            "Driver %s (ID=%s) has an expired license (%s) but is still marked Available. "
            "A Safety Officer should review this driver's status.",
            instance.name,
            instance.pk,
            instance.license_expiry,
        )
