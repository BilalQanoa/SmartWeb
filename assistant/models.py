from django.db import models

# Create your models here.
from django.db import models

from accounts.models import User


class AssistantReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name="assistant_reports")
    completeness_score = models.PositiveIntegerField(null=True, blank=True)
    payload = models.JSONField(default=dict)      # the full run_review() result
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]