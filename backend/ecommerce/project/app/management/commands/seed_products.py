from django.core.management.base import BaseCommand
from app.products import products
from app.models import Product


class Command(BaseCommand):
    help = 'Seed the database with initial products from app.products'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        for p in products:
            obj, created = Product.objects.update_or_create(
                _id=p['_id'],
                defaults=dict(
                    name=p['name'],
                    price=p['price'],
                    brand=p['brand'],
                    countInStock=p['countInStock'],
                    category=p['category'],
                    description=p.get('description', ''),
                )
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seed complete. Created: {created_count}, Updated: {updated_count}'
        ))


