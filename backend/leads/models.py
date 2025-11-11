from django.db import models
from django.core.validators import MinValueValidator
from django.utils.text import slugify


class Tenant(models.Model):
    """
    Tenant model for multi-tenancy support.
    Each tenant represents a separate organization/company using the system.
    """
    name = models.CharField(max_length=255, help_text="Company/Organization name")
    slug = models.SlugField(unique=True, max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Lead(models.Model):
    """
    Lead model with automatic scoring based on budget, company size, industry, and urgency.
    
    Scoring algorithm:
    - Budget: max 30 points
    - Company Size: max 30 points
    - Industry: max 20 points
    - Urgency: max 20 points
    Total: max 100 points
    """
    
    # Industry choices
    INDUSTRY_TECH = 'tech'
    INDUSTRY_FINANCE = 'finance'
    INDUSTRY_HEALTHCARE = 'healthcare'
    INDUSTRY_OTHER = 'other'
    
    INDUSTRY_CHOICES = [
        (INDUSTRY_TECH, 'Technology'),
        (INDUSTRY_FINANCE, 'Finance'),
        (INDUSTRY_HEALTHCARE, 'Healthcare'),
        (INDUSTRY_OTHER, 'Other'),
    ]
    
    # Urgency choices
    URGENCY_IMMEDIATELY = 'immediately'
    URGENCY_THIS_WEEK = 'this_week'
    URGENCY_THIS_MONTH = 'this_month'
    URGENCY_LATER = 'later'
    
    URGENCY_CHOICES = [
        (URGENCY_IMMEDIATELY, 'Immediately'),
        (URGENCY_THIS_WEEK, 'This Week'),
        (URGENCY_THIS_MONTH, 'This Month'),
        (URGENCY_LATER, 'Later'),
    ]
    
    # Tenant relationship
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='leads',
        help_text="The tenant this lead belongs to"
    )
    
    # Lead basic information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    company = models.CharField(max_length=255)
    
    # Scoring criteria
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Expected deal value in EUR"
    )
    company_size = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of employees"
    )
    industry = models.CharField(
        max_length=20,
        choices=INDUSTRY_CHOICES,
        default=INDUSTRY_OTHER
    )
    urgency = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default=URGENCY_LATER
    )
    
    # Calculated score
    score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Automatically calculated lead score (0-100)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-score', '-created_at']
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        indexes = [
            models.Index(fields=['tenant', '-score']),
            models.Index(fields=['tenant', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.company} (Score: {self.score})"
    
    def calculate_score(self):
        """
        Calculate the lead score based on the scoring algorithm.
        
        Returns:
            int: Score between 0 and 100
        """
        score = 0
        
        # Budget Score (max 30 points)
        if self.budget >= 50000:
            score += 30
        elif self.budget >= 10000:
            score += 20
        else:
            score += 10
        
        # Company Size Score (max 30 points)
        if self.company_size >= 500:
            score += 30
        elif self.company_size >= 100:
            score += 20
        else:
            score += 10
        
        # Industry Score (max 20 points)
        industry_scores = {
            self.INDUSTRY_TECH: 20,
            self.INDUSTRY_FINANCE: 15,
            self.INDUSTRY_HEALTHCARE: 10,
            self.INDUSTRY_OTHER: 5,
        }
        score += industry_scores.get(self.industry, 5)
        
        # Urgency Score (max 20 points)
        urgency_scores = {
            self.URGENCY_IMMEDIATELY: 20,
            self.URGENCY_THIS_WEEK: 15,
            self.URGENCY_THIS_MONTH: 10,
            self.URGENCY_LATER: 5,
        }
        score += urgency_scores.get(self.urgency, 5)
        
        return score
    
    def save(self, *args, **kwargs):
        """Override save to automatically calculate score before saving."""
        self.score = self.calculate_score()
        super().save(*args, **kwargs)
