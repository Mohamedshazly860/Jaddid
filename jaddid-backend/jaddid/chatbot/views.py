import os
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from marketplace.models import MaterialListing, Material, Category, Product
from openai import OpenAI
from django.conf import settings
from .models import ChatHistory


# Initialize OpenAI client with API key from environment
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key and api_key != "sk-test-key-placeholder" else None


class ChatbotView(APIView):
    """
    AI-powered chatbot for Jaddid marketplace
    Helps users find recyclable materials, products, and get eco-friendly recommendations
    """
    permission_classes = [AllowAny]  # Allow both authenticated and anonymous users

    def get_knowledge_base(self):
        """Load the jaddid knowledge base from file"""
        try:
            file_path = os.path.join(settings.BASE_DIR, 'jaddid_guide.txt')
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception:
            return ""

    def post(self, request):
        user_query = request.data.get('message', '')
        if not user_query:
            return Response({"error": "Message is required"}, status=400)

        # Get authenticated user if available
        user = request.user if request.user.is_authenticated else None

        # ====================================================
        # 1. CATEGORY WEIGHTS FOR MATERIAL BUNDLES
        # ====================================================
        CATEGORY_WEIGHTS = {
            'plastic': 25,
            'paper': 20,
            'metal': 20,
            'glass': 15,
            'wood': 15,
            'electronics': 30,
            'textiles': 10,
            'organic': 5,
        }

        # ====================================================
        # 2. EXTRACT USER INTENT AND PARAMETERS
        # ====================================================
        system_instruction_extraction = """
        You are an intelligent assistant for Jaddid - a recyclable materials and eco-friendly products marketplace.
        Analyze the user query and extract specific details into JSON.
        
        Output Format:
        {
            "intent": "material_search" (find raw materials) OR "product_search" (find finished products) OR "bundle_search" (multiple materials within budget) OR "general_info",
            "budget": number or null,
            "target_categories": ["list", "of", "category", "names"],
            "keywords": "search text" or null,
            "quantity": number or null,
            "location": "city name" or null
        }

        Material Categories:
        - Plastic (bottles, bags, containers)
        - Paper (cardboard, newspapers, office paper)
        - Metal (aluminum, copper, steel, iron)
        - Glass (bottles, jars)
        - Wood (pallets, sawdust, chips)
        - Electronics (e-waste, circuit boards)
        - Textiles (old clothes, fabric scraps)
        - Organic (compost materials)
        
        Examples:
        - "I need 100kg of plastic bottles under 500 EGP" -> {"intent": "material_search", "budget": 500, "target_categories": ["plastic"], "quantity": 100}
        - "Show me eco-friendly products made from recycled materials" -> {"intent": "product_search", "keywords": "eco-friendly recycled"}
        - "I have 2000 EGP for plastic, metal, and paper" -> {"intent": "bundle_search", "budget": 2000, "target_categories": ["plastic", "metal", "paper"]}
        """

        try:
            # Check if OpenAI client is available
            if not client:
                return Response({
                    "error": "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.",
                    "bot_reply": "Sorry, the AI chatbot is not configured yet. Please contact the administrator to set up the OpenAI API key.",
                    "intent": "error"
                }, status=503)
            
            # Step 1: Extract intent and parameters
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction_extraction},
                    {"role": "user", "content": user_query}
                ],
                response_format={"type": "json_object"}
            )
            
            data = json.loads(completion.choices[0].message.content)
            intent = data.get('intent', 'general_info')
            budget = data.get('budget')
            target_categories = data.get('target_categories', [])
            keywords = data.get('keywords')
            quantity = data.get('quantity')
            location = data.get('location')

            context_data = ""

            # ====================================================
            # 3. MATERIAL BUNDLE SEARCH (MULTIPLE MATERIALS)
            # ====================================================
            if intent == "bundle_search" and budget and target_categories:
                total_weight = sum(CATEGORY_WEIGHTS.get(cat.lower(), 10) for cat in target_categories)
                
                bundle_results = []
                total_bundle_price = 0
                
                for cat in target_categories:
                    weight = CATEGORY_WEIGHTS.get(cat.lower(), 10)
                    allocated_amount = (weight / total_weight) * budget

                    # Find material listings in this category
                    category_obj = Category.objects.filter(
                        Q(name__icontains=cat) | Q(name_ar__icontains=cat)
                    ).first()
                    
                    if category_obj:
                        listing = MaterialListing.objects.filter(
                            material__category=category_obj,
                            status='active',
                            price__lte=allocated_amount * 1.2
                        ).order_by('price').first()

                        if listing:
                            bundle_results.append(
                                f"✓ {cat}: {listing.title} - {listing.quantity} {listing.unit} "
                                f"@ {listing.price} EGP (Allocated: {int(allocated_amount)} EGP)"
                            )
                            total_bundle_price += float(listing.price)
                        else:
                            cheapest = MaterialListing.objects.filter(
                                material__category=category_obj,
                                status='active'
                            ).order_by('price').first()
                            if cheapest:
                                bundle_results.append(
                                    f"✗ {cat}: Budget {int(allocated_amount)} EGP insufficient "
                                    f"(Cheapest: {cheapest.price} EGP)"
                                )
                            else:
                                bundle_results.append(f"✗ {cat}: No listings found")
                    else:
                        bundle_results.append(f"✗ {cat}: Category not found")

                context_data = f"Bundle Plan (Total Budget: {budget} EGP):\n" + "\n".join(bundle_results)
                context_data += f"\n\nTotal Estimated Cost: {total_bundle_price:.2f} EGP"
                context_data += f"\nRemaining Budget: {budget - total_bundle_price:.2f} EGP"

            # ====================================================
            # 4. MATERIAL SEARCH (RAW MATERIALS)
            # ====================================================
            elif intent == "material_search":
                query = MaterialListing.objects.filter(status='active')
                
                # Filter by categories
                if target_categories:
                    category_filter = Q()
                    for cat in target_categories:
                        category_filter |= Q(material__category__name__icontains=cat)
                    query = query.filter(category_filter)
                
                # Filter by budget
                if budget:
                    query = query.filter(price__lte=budget * 1.1)

                # Filter by quantity
                if quantity:
                    query = query.filter(quantity__gte=quantity * 0.8)

                # Search by keywords
                if keywords:
                    query = query.filter(
                        Q(title__icontains=keywords) |
                        Q(description__icontains=keywords) |
                        Q(material__name__icontains=keywords)
                    )
                
                results = query.select_related('material', 'seller').order_by('price')[:7]
                
                if results:
                    context_data = "Available Material Listings:\n"
                    for listing in results:
                        context_data += (
                            f"- {listing.title}: {listing.quantity} {listing.unit} "
                            f"@ {listing.price} EGP/unit (Seller: {listing.seller.email})\n"
                            f"  Material: {listing.material.name}, Condition: {listing.condition}\n"
                        )
                else:
                    context_data = "No matching material listings found."

            # ====================================================
            # 5. PRODUCT SEARCH (FINISHED ECO-PRODUCTS)
            # ====================================================
            elif intent == "product_search":
                query = Product.objects.filter(is_active=True)
                
                # Filter by budget
                if budget:
                    query = query.filter(price__lte=budget * 1.1)

                # Search by keywords
                if keywords:
                    query = query.filter(
                        Q(name__icontains=keywords) |
                        Q(description__icontains=keywords) |
                        Q(category__name__icontains=keywords)
                    )
                
                results = query.select_related('category', 'seller').order_by('price')[:7]
                
                if results:
                    context_data = "Available Eco-Friendly Products:\n"
                    for product in results:
                        context_data += (
                            f"- {product.name}: {product.price} EGP "
                            f"(Stock: {product.stock_quantity})\n"
                            f"  Category: {product.category.name}, Rating: {product.average_rating or 'N/A'}\n"
                        )
                else:
                    context_data = "No matching products found."

            # ====================================================
            # 6. GENERAL INFO (NO SPECIFIC SEARCH)
            # ====================================================
            else:
                context_data = "I'm here to help you find recyclable materials and eco-friendly products!"

            # ====================================================
            # 7. GENERATE FINAL AI RESPONSE (RAG)
            # ====================================================
            knowledge_base = self.get_knowledge_base()
            
            system_instruction_final = f"""
            You are the Jaddid Assistant - a helpful AI for a recyclable materials marketplace.
            
            Your role:
            - Help users find recyclable materials and eco-friendly products
            - Provide eco-friendly recommendations
            - Explain material categories and recycling processes
            - Be honest about availability and pricing
            - Suggest alternatives when exact matches aren't found
            
            Current Search Results:
            {context_data}
            
            Platform Knowledge:
            {knowledge_base}
            
            Respond in a friendly, helpful manner. Include relevant details from the search results.
            """

            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction_final},
                    {"role": "user", "content": user_query}
                ]
            )

            bot_reply = final_response.choices[0].message.content

            # Save chat history
            ChatHistory.objects.create(
                user=user,
                user_message=user_query,
                bot_response=bot_reply,
                intent=intent,
                categories=target_categories
            )

            return Response({
                "bot_reply": bot_reply,
                "intent": intent,
                "debug_categories": target_categories,
                "debug_budget": budget
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ChatHistoryView(APIView):
    """Get chat history for authenticated users"""
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        history = ChatHistory.objects.filter(user=request.user).order_by('-message_time')[:20]
        data = [
            {
                "user_message": chat.user_message,
                "bot_response": chat.bot_response,
                "timestamp": chat.message_time,
                "intent": chat.intent
            }
            for chat in history
        ]
        
        return Response({"history": data})
