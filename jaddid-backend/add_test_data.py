"""
Script to add test materials and products to the database
Run from jaddid directory: python manage.py shell < ../add_test_data.py
Or run: python ../add_test_data.py
"""
import os
import django

# Setup Django - adjust path to be in jaddid directory
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jaddid'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jaddid.settings')
django.setup()

from marketplace.models import Category, Material, MaterialListing, Product, ProductImage, MaterialImage
from accounts.models import User
from decimal import Decimal

def create_test_data():
    print("🚀 Starting test data creation...")
    
    # Get or create test user (seller)
    seller, created = User.objects.get_or_create(
        email='seller@test.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'Seller',
            'role': 'company',
            'phone_number': '01234567890'
        }
    )
    if created:
        seller.set_password('test1234')
        seller.save()
        print(f"✅ Created test seller: {seller.email}")
    else:
        print(f"📌 Using existing seller: {seller.email}")
    
    # Create categories
    categories = [
        {'name': 'Plastic', 'name_ar': 'بلاستيك', 'description': 'Recyclable plastic materials'},
        {'name': 'Metal', 'name_ar': 'معادن', 'description': 'Recyclable metal materials'},
        {'name': 'Paper', 'name_ar': 'ورق', 'description': 'Recyclable paper materials'},
        {'name': 'Glass', 'name_ar': 'زجاج', 'description': 'Recyclable glass materials'},
        {'name': 'Electronics', 'name_ar': 'إلكترونيات', 'description': 'Electronic waste'},
    ]
    
    created_categories = []
    for cat_data in categories:
        cat, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        created_categories.append(cat)
        if created:
            print(f"✅ Created category: {cat.name}")
        else:
            print(f"📌 Using existing category: {cat.name}")
    
    # Create Materials (Master Data)
    materials_data = [
        {
            'name': 'PET Bottles',
            'name_ar': 'زجاجات بلاستيك',
            'description': 'Recyclable PET plastic bottles',
            'description_ar': 'زجاجات بلاستيك قابلة لإعادة التدوير',
            'category': created_categories[0],  # Plastic
            'default_unit': 'kg'
        },
        {
            'name': 'Aluminum Cans',
            'name_ar': 'علب ألومنيوم',
            'description': 'Recyclable aluminum beverage cans',
            'description_ar': 'علب مشروبات ألومنيوم قابلة للتدوير',
            'category': created_categories[1],  # Metal
            'default_unit': 'kg'
        },
        {
            'name': 'Cardboard',
            'name_ar': 'كرتون',
            'description': 'Clean cardboard boxes',
            'description_ar': 'صناديق كرتون نظيفة',
            'category': created_categories[2],  # Paper
            'default_unit': 'kg'
        },
        {
            'name': 'Glass Bottles',
            'name_ar': 'زجاجات زجاجية',
            'description': 'Recyclable glass bottles',
            'description_ar': 'زجاجات زجاجية قابلة للتدوير',
            'category': created_categories[3],  # Glass
            'default_unit': 'kg'
        },
    ]
    
    created_materials = []
    for mat_data in materials_data:
        mat, created = Material.objects.get_or_create(
            name=mat_data['name'],
            defaults=mat_data
        )
        created_materials.append(mat)
        if created:
            print(f"✅ Created material: {mat.name}")
        else:
            print(f"📌 Using existing material: {mat.name}")
    
    # Create Material Listings
    material_listings_data = [
        {
            'material': created_materials[0],  # PET Bottles
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
            'material': created_materials[1],  # Aluminum Cans
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
            'latitude': Decimal('31.2001'),
            'longitude': Decimal('29.9187'),
        },
        {
            'material': created_materials[2],  # Cardboard
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
            'latitude': Decimal('30.0131'),
            'longitude': Decimal('31.2089'),
        },
        {
            'material': created_materials[3],  # Glass Bottles
            'seller': seller,
            'title': '300kg Glass Bottles',
            'title_ar': '300 كيلو زجاجات زجاجية',
            'description': 'Mixed color glass bottles, cleaned and sorted.',
            'description_ar': 'زجاجات زجاجية ألوان متنوعة، نظيفة ومفروزة.',
            'quantity': Decimal('300.00'),
            'unit': 'kg',
            'price_per_unit': Decimal('3.00'),
            'minimum_order_quantity': Decimal('50.00'),
            'condition': 'acceptable',
            'status': 'active',
            'location': 'Cairo, Egypt',
            'latitude': Decimal('30.0444'),
            'longitude': Decimal('31.2357'),
        },
    ]
    
    for listing_data in material_listings_data:
        listing, created = MaterialListing.objects.get_or_create(
            title=listing_data['title'],
            seller=seller,
            defaults=listing_data
        )
        if created:
            print(f"✅ Created material listing: {listing.title}")
        else:
            print(f"📌 Using existing listing: {listing.title}")
    
    # Create Products
    products_data = [
        {
            'seller': seller,
            'category': created_categories[0],  # Plastic
            'title': 'Recycled Plastic Chair',
            'title_ar': 'كرسي بلاستيك معاد تدويره',
            'description': 'Comfortable outdoor chair made from 100% recycled plastic.',
            'description_ar': 'كرسي خارجي مريح مصنوع من بلاستيك معاد تدويره بنسبة 100%.',
            'price': Decimal('250.00'),
            'quantity': 20,
            'condition': 'new',
            'status': 'active',
            'location': 'Cairo, Egypt',
            'latitude': Decimal('30.0444'),
            'longitude': Decimal('31.2357'),
        },
        {
            'seller': seller,
            'category': created_categories[2],  # Paper
            'title': 'Recycled Paper Notebook',
            'title_ar': 'دفتر ورق معاد تدويره',
            'description': 'Eco-friendly notebook made from recycled paper. 100 pages.',
            'description_ar': 'دفتر صديق للبيئة مصنوع من ورق معاد تدويره. 100 صفحة.',
            'price': Decimal('45.00'),
            'quantity': 50,
            'condition': 'new',
            'status': 'active',
            'location': 'Alexandria, Egypt',
            'latitude': Decimal('31.2001'),
            'longitude': Decimal('29.9187'),
        },
        {
            'seller': seller,
            'category': created_categories[3],  # Glass
            'title': 'Decorative Glass Vase',
            'title_ar': 'مزهرية زجاجية ديكور',
            'description': 'Beautiful handmade vase from recycled glass bottles.',
            'description_ar': 'مزهرية جميلة مصنوعة يدوياً من زجاجات معاد تدويرها.',
            'price': Decimal('180.00'),
            'quantity': 15,
            'condition': 'new',
            'status': 'active',
            'location': 'Cairo, Egypt',
            'latitude': Decimal('30.0444'),
            'longitude': Decimal('31.2357'),
        },
        {
            'seller': seller,
            'category': created_categories[0],  # Plastic
            'title': 'Plastic Storage Bins Set',
            'title_ar': 'طقم صناديق تخزين بلاستيك',
            'description': 'Set of 3 storage bins made from recycled plastic. Various sizes.',
            'description_ar': 'طقم من 3 صناديق تخزين مصنوعة من بلاستيك معاد تدويره. أحجام مختلفة.',
            'price': Decimal('320.00'),
            'quantity': 12,
            'condition': 'new',
            'status': 'active',
            'location': 'Giza, Egypt',
            'latitude': Decimal('30.0131'),
            'longitude': Decimal('31.2089'),
        },
        {
            'seller': seller,
            'category': created_categories[1],  # Metal
            'title': 'Vintage Metal Lamp',
            'title_ar': 'مصباح معدني قديم',
            'description': 'Restored vintage lamp made from recycled metal parts.',
            'description_ar': 'مصباح قديم مرمم مصنوع من أجزاء معدنية معاد تدويرها.',
            'price': Decimal('450.00'),
            'quantity': 5,
            'condition': 'like_new',
            'status': 'active',
            'location': 'Cairo, Egypt',
            'latitude': Decimal('30.0444'),
            'longitude': Decimal('31.2357'),
        },
        {
            'seller': seller,
            'category': created_categories[2],  # Paper
            'title': 'Cardboard Organizer',
            'title_ar': 'منظم من الكرتون',
            'description': 'Desktop organizer made from recycled cardboard. Very sturdy.',
            'description_ar': 'منظم مكتبي مصنوع من كرتون معاد تدويره. متين جداً.',
            'price': Decimal('95.00'),
            'quantity': 30,
            'condition': 'new',
            'status': 'active',
            'location': 'Alexandria, Egypt',
            'latitude': Decimal('31.2001'),
            'longitude': Decimal('29.9187'),
        },
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            title=product_data['title'],
            seller=seller,
            defaults=product_data
        )
        if created:
            print(f"✅ Created product: {product.title}")
        else:
            print(f"📌 Using existing product: {product.title}")
    
    print("\n" + "="*50)
    print("✨ Test data creation completed!")
    print("="*50)
    print(f"\n📊 Summary:")
    print(f"   Categories: {Category.objects.count()}")
    print(f"   Materials: {Material.objects.count()}")
    print(f"   Material Listings: {MaterialListing.objects.count()}")
    print(f"   Products: {Product.objects.count()}")
    print(f"\n👤 Test Seller Account:")
    print(f"   Email: seller@test.com")
    print(f"   Password: test1234")
    print("\n💡 You can now login with this account to test the marketplace!")

if __name__ == '__main__':
    create_test_data()
