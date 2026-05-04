"""
Django management command to add test data
"""
from django.core.management.base import BaseCommand
from marketplace.models import Category, Material, MaterialListing, Product
from accounts.models import User
from decimal import Decimal


class Command(BaseCommand):
    help = 'Add test materials and products to the database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting test data creation...'))
        
        # Get or create test user (seller)
        seller, created = User.objects.get_or_create(
            email='seller@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Seller',
                'role': 'company'
            }
        )
        if created:
            seller.set_password('test1234')
            seller.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Created test seller: {seller.email}'))
        else:
            self.stdout.write(f'📌 Using existing seller: {seller.email}')
        
        # Create categories
        categories_data = [
            {'name': 'Plastic', 'name_ar': 'بلاستيك', 'description': 'Recyclable plastic materials'},
            {'name': 'Metal', 'name_ar': 'معادن', 'description': 'Recyclable metal materials'},
            {'name': 'Paper', 'name_ar': 'ورق', 'description': 'Recyclable paper materials'},
            {'name': 'Glass', 'name_ar': 'زجاج', 'description': 'Recyclable glass materials'},
            {'name': 'Electronics', 'name_ar': 'إلكترونيات', 'description': 'Electronic waste'},
        ]
        
        categories = []
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(cat)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Created category: {cat.name}'))
        
        # Create Materials
        materials_data = [
            {
                'name': 'PET Bottles',
                'name_ar': 'زجاجات بلاستيك',
                'description': 'Recyclable PET plastic bottles',
                'description_ar': 'زجاجات بلاستيك قابلة لإعادة التدوير',
                'category': categories[0],
                'default_unit': 'kg'
            },
            {
                'name': 'Aluminum Cans',
                'name_ar': 'علب ألومنيوم',
                'description': 'Recyclable aluminum beverage cans',
                'description_ar': 'علب مشروبات ألومنيوم قابلة للتدوير',
                'category': categories[1],
                'default_unit': 'kg'
            },
            {
                'name': 'Cardboard',
                'name_ar': 'كرتون',
                'description': 'Clean cardboard boxes',
                'description_ar': 'صناديق كرتون نظيفة',
                'category': categories[2],
                'default_unit': 'kg'
            },
            {
                'name': 'Glass Bottles',
                'name_ar': 'زجاجات زجاجية',
                'description': 'Recyclable glass bottles',
                'description_ar': 'زجاجات زجاجية قابلة للتدوير',
                'category': categories[3],
                'default_unit': 'kg'
            },
        ]
        
        materials = []
        for mat_data in materials_data:
            mat, created = Material.objects.get_or_create(
                name=mat_data['name'],
                defaults=mat_data
            )
            materials.append(mat)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Created material: {mat.name}'))
        
        # Create Material Listings
        listings_data = [
            {
                'material': materials[0],
                'seller': seller,
                'title': '500kg Clean PET Bottles',
                'title_ar': '500 كيلو زجاجات بلاستيك نظيفة',
                'description': 'Clean, sorted PET bottles ready for recycling. Perfect condition.',
                'description_ar': 'زجاجات بلاستيك نظيفة ومفروزة جاهزة للتدوير. حالة ممتازة.',
                'quantity': Decimal('500.00'),
                'unit': 'kg',
                'price_per_unit': Decimal('8.50'),
                'minimum_order_quantity': Decimal('50.00'),
                'condition': 'excellent',
                'status': 'active',
                'location': 'Cairo, Egypt',
                'latitude': Decimal('30.0444'),
                'longitude': Decimal('31.2357'),
            },
            {
                'material': materials[1],
                'seller': seller,
                'title': '200kg Aluminum Cans',
                'title_ar': '200 كيلو علب ألومنيوم',
                'description': 'Crushed aluminum cans, clean and sorted.',
                'description_ar': 'علب ألومنيوم مكبوسة، نظيفة ومفروزة.',
                'quantity': Decimal('200.00'),
                'unit': 'kg',
                'price_per_unit': Decimal('15.00'),
                'minimum_order_quantity': Decimal('25.00'),
                'condition': 'good',
                'status': 'active',
                'location': 'Alexandria, Egypt',
            },
            {
                'material': materials[2],
                'seller': seller,
                'title': '1 Ton Cardboard Boxes',
                'title_ar': 'طن واحد صناديق كرتون',
                'description': 'Clean cardboard boxes, flattened and bundled.',
                'description_ar': 'صناديق كرتون نظيفة، مفلطحة ومربوطة.',
                'quantity': Decimal('1000.00'),
                'unit': 'kg',
                'price_per_unit': Decimal('4.50'),
                'minimum_order_quantity': Decimal('100.00'),
                'condition': 'good',
                'status': 'active',
                'location': 'Giza, Egypt',
            },
        ]
        
        for listing_data in listings_data:
            MaterialListing.objects.get_or_create(
                title=listing_data['title'],
                seller=seller,
                defaults=listing_data
            )
        
        # Create Products
        products_data = [
            {
                'seller': seller,
                'category': categories[0],
                'title': 'Recycled Plastic Chair',
                'title_ar': 'كرسي بلاستيك معاد تدويره',
                'description': 'Comfortable outdoor chair made from 100% recycled plastic.',
                'description_ar': 'كرسي خارجي مريح مصنوع من بلاستيك معاد تدويره بنسبة 100%.',
                'price': Decimal('250.00'),
                'quantity': 20,
                'condition': 'new',
                'status': 'active',
                'location': 'Cairo, Egypt',
            },
            {
                'seller': seller,
                'category': categories[2],
                'title': 'Recycled Paper Notebook',
                'title_ar': 'دفتر ورق معاد تدويره',
                'description': 'Eco-friendly notebook made from recycled paper. 100 pages.',
                'description_ar': 'دفتر صديق للبيئة مصنوع من ورق معاد تدويره. 100 صفحة.',
                'price': Decimal('45.00'),
                'quantity': 50,
                'condition': 'new',
                'status': 'active',
                'location': 'Alexandria, Egypt',
            },
            {
                'seller': seller,
                'category': categories[3],
                'title': 'Decorative Glass Vase',
                'title_ar': 'مزهرية زجاجية ديكور',
                'description': 'Beautiful handmade vase from recycled glass bottles.',
                'description_ar': 'مزهرية جميلة مصنوعة يدوياً من زجاجات معاد تدويرها.',
                'price': Decimal('180.00'),
                'quantity': 15,
                'condition': 'new',
                'status': 'active',
                'location': 'Cairo, Egypt',
            },
            {
                'seller': seller,
                'category': categories[0],
                'title': 'Plastic Storage Bins Set',
                'title_ar': 'طقم صناديق تخزين بلاستيك',
                'description': 'Set of 3 storage bins made from recycled plastic.',
                'description_ar': 'طقم من 3 صناديق تخزين مصنوعة من بلاستيك معاد تدويره.',
                'price': Decimal('320.00'),
                'quantity': 12,
                'condition': 'new',
                'status': 'active',
                'location': 'Giza, Egypt',
            },
        ]
        
        for product_data in products_data:
            Product.objects.get_or_create(
                title=product_data['title'],
                seller=seller,
                defaults=product_data
            )
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('✨ Test data creation completed!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(f'\n📊 Summary:')
        self.stdout.write(f'   Categories: {Category.objects.count()}')
        self.stdout.write(f'   Materials: {Material.objects.count()}')
        self.stdout.write(f'   Material Listings: {MaterialListing.objects.count()}')
        self.stdout.write(f'   Products: {Product.objects.count()}')
        self.stdout.write(f'\n👤 Test Seller Account:')
        self.stdout.write(f'   Email: seller@test.com')
        self.stdout.write(f'   Password: test1234')
        self.stdout.write(self.style.SUCCESS('\n💡 You can now login and test!'))
