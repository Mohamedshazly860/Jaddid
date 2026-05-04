"""
Django management command to populate default categories and materials
Run with: python manage.py setup_defaults
"""
from django.core.management.base import BaseCommand
from marketplace.models import Category, Material


class Command(BaseCommand):
    help = 'Creates default categories and materials for the marketplace'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to create default data...'))
        
        # Default Categories with Arabic translations
        categories_data = [
            {
                'name': 'Metals',
                'name_ar': 'المعادن',
                'description': 'Recyclable metal materials including aluminum, copper, steel, and iron',
            },
            {
                'name': 'Plastics',
                'name_ar': 'البلاستيك',
                'description': 'Various types of recyclable plastic materials',
            },
            {
                'name': 'Paper & Cardboard',
                'name_ar': 'الورق والكرتون',
                'description': 'Recyclable paper products, cardboard, and packaging materials',
            },
            {
                'name': 'Glass',
                'name_ar': 'الزجاج',
                'description': 'Recyclable glass materials including bottles, windows, and containers',
            },
            {
                'name': 'Wood',
                'name_ar': 'الخشب',
                'description': 'Recyclable wood materials, pallets, and furniture',
            },
            {
                'name': 'Electronics',
                'name_ar': 'الإلكترونيات',
                'description': 'E-waste and recyclable electronic components',
            },
            {
                'name': 'Textiles',
                'name_ar': 'المنسوجات',
                'description': 'Recyclable fabric, clothes, and textile materials',
            },
            {
                'name': 'Rubber',
                'name_ar': 'المطاط',
                'description': 'Recyclable rubber materials including tires',
            },
            {
                'name': 'Construction Materials',
                'name_ar': 'مواد البناء',
                'description': 'Recyclable construction waste and building materials',
            },
            {
                'name': 'Organic Waste',
                'name_ar': 'النفايات العضوية',
                'description': 'Compostable and organic recyclable materials',
            },
        ]
        
        categories = {}
        created_categories = 0
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'name_ar': cat_data['name_ar'],
                    'description': cat_data['description'],
                    'is_active': True,
                }
            )
            categories[cat_data['name']] = category
            if created:
                created_categories += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created category: {cat_data["name"]}'))
            else:
                self.stdout.write(f'  Category already exists: {cat_data["name"]}')
        
        # Default Materials for each category
        materials_data = [
            # Metals
            {'name': 'Aluminum Cans', 'name_ar': 'علب الألومنيوم', 'category': 'Metals', 'unit': 'kg', 'description': 'Recyclable aluminum beverage cans'},
            {'name': 'Copper Wire', 'name_ar': 'أسلاك النحاس', 'category': 'Metals', 'unit': 'kg', 'description': 'Recyclable copper electrical wires'},
            {'name': 'Steel Scrap', 'name_ar': 'خردة الصلب', 'category': 'Metals', 'unit': 'kg', 'description': 'Recyclable steel and iron scrap'},
            {'name': 'Brass Fittings', 'name_ar': 'تركيبات النحاس الأصفر', 'category': 'Metals', 'unit': 'kg', 'description': 'Recyclable brass plumbing fittings'},
            
            # Plastics
            {'name': 'PET Bottles', 'name_ar': 'زجاجات البلاستيك', 'category': 'Plastics', 'unit': 'kg', 'description': 'Clear plastic bottles (Type 1)'},
            {'name': 'HDPE Containers', 'name_ar': 'حاويات HDPE', 'category': 'Plastics', 'unit': 'kg', 'description': 'High-density polyethylene containers'},
            {'name': 'PVC Pipes', 'name_ar': 'أنابيب PVC', 'category': 'Plastics', 'unit': 'kg', 'description': 'Recyclable PVC plumbing pipes'},
            {'name': 'PP Containers', 'name_ar': 'حاويات PP', 'category': 'Plastics', 'unit': 'kg', 'description': 'Polypropylene food containers'},
            
            # Paper & Cardboard
            {'name': 'Cardboard Boxes', 'name_ar': 'صناديق الكرتون', 'category': 'Paper & Cardboard', 'unit': 'kg', 'description': 'Clean corrugated cardboard'},
            {'name': 'Office Paper', 'name_ar': 'ورق المكاتب', 'category': 'Paper & Cardboard', 'unit': 'kg', 'description': 'White and colored office paper'},
            {'name': 'Newspapers', 'name_ar': 'الجرائد', 'category': 'Paper & Cardboard', 'unit': 'kg', 'description': 'Old newspapers and magazines'},
            {'name': 'Paper Bags', 'name_ar': 'أكياس الورق', 'category': 'Paper & Cardboard', 'unit': 'kg', 'description': 'Clean paper shopping bags'},
            
            # Glass
            {'name': 'Glass Bottles', 'name_ar': 'زجاجات زجاجية', 'category': 'Glass', 'unit': 'kg', 'description': 'Clear and colored glass bottles'},
            {'name': 'Window Glass', 'name_ar': 'زجاج النوافذ', 'category': 'Glass', 'unit': 'kg', 'description': 'Flat window and door glass'},
            {'name': 'Glass Jars', 'name_ar': 'برطمانات زجاجية', 'category': 'Glass', 'unit': 'kg', 'description': 'Food storage glass jars'},
            
            # Wood
            {'name': 'Wood Pallets', 'name_ar': 'منصات خشبية', 'category': 'Wood', 'unit': 'piece', 'description': 'Reusable wooden shipping pallets'},
            {'name': 'Lumber Scraps', 'name_ar': 'قصاصات الخشب', 'category': 'Wood', 'unit': 'kg', 'description': 'Clean construction lumber scraps'},
            {'name': 'Furniture Parts', 'name_ar': 'أجزاء أثاث', 'category': 'Wood', 'unit': 'piece', 'description': 'Reusable wooden furniture components'},
            
            # Electronics
            {'name': 'Computer Parts', 'name_ar': 'قطع الكمبيوتر', 'category': 'Electronics', 'unit': 'piece', 'description': 'CPUs, motherboards, RAM'},
            {'name': 'Mobile Phones', 'name_ar': 'الهواتف المحمولة', 'category': 'Electronics', 'unit': 'piece', 'description': 'Old smartphones and feature phones'},
            {'name': 'Cables & Wires', 'name_ar': 'الكابلات والأسلاك', 'category': 'Electronics', 'unit': 'kg', 'description': 'Electronic cables and wires'},
            {'name': 'Batteries', 'name_ar': 'البطاريات', 'category': 'Electronics', 'unit': 'kg', 'description': 'Recyclable batteries'},
            
            # Textiles
            {'name': 'Cotton Fabric', 'name_ar': 'قماش قطني', 'category': 'Textiles', 'unit': 'kg', 'description': 'Clean cotton textile scraps'},
            {'name': 'Used Clothes', 'name_ar': 'ملابس مستعملة', 'category': 'Textiles', 'unit': 'kg', 'description': 'Gently used clothing'},
            {'name': 'Denim Scraps', 'name_ar': 'قصاصات الجينز', 'category': 'Textiles', 'unit': 'kg', 'description': 'Denim fabric scraps'},
            
            # Rubber
            {'name': 'Car Tires', 'name_ar': 'إطارات السيارات', 'category': 'Rubber', 'unit': 'piece', 'description': 'Used car and truck tires'},
            {'name': 'Rubber Mats', 'name_ar': 'حصائر مطاطية', 'category': 'Rubber', 'unit': 'kg', 'description': 'Rubber floor mats'},
            
            # Construction Materials
            {'name': 'Bricks', 'name_ar': 'الطوب', 'category': 'Construction Materials', 'unit': 'piece', 'description': 'Reusable building bricks'},
            {'name': 'Concrete Blocks', 'name_ar': 'بلوكات خرسانية', 'category': 'Construction Materials', 'unit': 'piece', 'description': 'Concrete building blocks'},
            {'name': 'Ceramic Tiles', 'name_ar': 'بلاط السيراميك', 'category': 'Construction Materials', 'unit': 'sqm', 'description': 'Reusable ceramic floor tiles'},
            
            # Organic Waste
            {'name': 'Food Scraps', 'name_ar': 'بقايا الطعام', 'category': 'Organic Waste', 'unit': 'kg', 'description': 'Compostable food waste'},
            {'name': 'Garden Waste', 'name_ar': 'نفايات الحديقة', 'category': 'Organic Waste', 'unit': 'kg', 'description': 'Leaves, grass, and plant trimmings'},
        ]
        
        created_materials = 0
        
        for mat_data in materials_data:
            category = categories.get(mat_data['category'])
            if not category:
                self.stdout.write(self.style.WARNING(f'  Category not found: {mat_data["category"]}'))
                continue
            
            material, created = Material.objects.get_or_create(
                name=mat_data['name'],
                defaults={
                    'name_ar': mat_data['name_ar'],
                    'description': mat_data['description'],
                    'category': category,
                    'default_unit': mat_data['unit'],
                    'is_active': True,
                }
            )
            
            if created:
                created_materials += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created material: {mat_data["name"]}'))
            else:
                self.stdout.write(f'    Material already exists: {mat_data["name"]}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Setup completed!'))
        self.stdout.write(self.style.SUCCESS(f'  Categories: {created_categories} created'))
        self.stdout.write(self.style.SUCCESS(f'  Materials: {created_materials} created'))
        self.stdout.write(self.style.SUCCESS(f'\nTotal: {Category.objects.count()} categories, {Material.objects.count()} materials in database'))
