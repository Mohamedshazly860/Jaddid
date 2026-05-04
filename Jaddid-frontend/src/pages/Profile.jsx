import React, { useEffect, useState } from "react";
import {
  ProfileSidebar,
  ProfileHeader,
  SellingSection,
  ReviewsSection,
} from "./profileComponents";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useParams, useLocation } from "react-router-dom";
import userService from "@/services/userService";
import marketplaceService from "@/services/marketplaceService";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const { userId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);

  const extractId = (u) => {
    if (!u) return null;
    // Prioritize common backend ID keys
    const id =
      u.id ||
      u.pk ||
      u.user_id ||
      u._id ||
      u.uuid ||
      u.sub ||
      u.authId ||
      u.profileId ||
      (u.account && u.account.id) ||
      (u.user && u.user.id);

    // If no ID, fallback to email (useful for local testing)
    if (!id && u.email) return u.email.toLowerCase();

    return id ? String(id) : null;
  };

  const normalizeResponse = (res) => {
    if (!res) return [];
    return res.data?.results ?? res.data ?? res;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const currentAuthId = extractId(authUser);
      const idToLoad = userId ?? currentAuthId ?? null;

      try {
        // FIX: Add timestamp to bypass cache
        const timestamp = Date.now();

        let profileRes;
        if (!idToLoad) {
          profileRes = await userService.getCurrentUser();
        } else {
          if (String(idToLoad) === String(currentAuthId)) {
            profileRes = await userService.getCurrentUser();
          } else {
            profileRes = await userService.getUserById(idToLoad);
          }
        }

        const raw = profileRes.data ?? profileRes;

        const normalized = {
          id: raw.id ?? raw.pk ?? raw.user_id ?? raw.uuid,
          first_name: raw.first_name ?? raw.firstName ?? "",
          last_name: raw.last_name ?? raw.lastName ?? "",
          name:
            `${raw.first_name ?? raw.firstName ?? ""} ${
              raw.last_name ?? raw.lastName ?? ""
            }`.trim() ||
            raw.name ||
            "Unknown User",
          email: raw.email || "",
          phone: raw.profile?.phone ?? raw.phone ?? "",
          address: raw.profile?.address ?? raw.address ?? "",
          bio: raw.profile?.bio ?? raw.bio ?? "",

          // FIX: Add cache-busting timestamp to image URL
          profileImage: raw.profile?.profile_image
            ? `${raw.profile.profile_image}?t=${timestamp}`
            : raw.profile_image
            ? `${raw.profile_image}?t=${timestamp}`
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.email}`,

          rating: raw.profile?.average_rating ?? raw.average_rating ?? 0,
          totalReviews: raw.profile?.review_count ?? raw.review_count ?? 0,
          joinDate: raw.date_joined
            ? new Date(raw.date_joined).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : "Recently",
          totalSales: raw.total_sales ?? raw.totalSales ?? 0,
          responseRate: raw.response_rate ?? raw.responseRate ?? "N/A",
          raw,
        };

        setProfile(normalized);

        // Fetch products, material listings and reviews for this user
        try {
          const uid = normalized.id ?? idToLoad;

          // Build strict params to ensure backend filters by owner only
          const ownerParams = {
            owner: uid,
            user: uid,
            seller: uid,
            owner_id: uid,
            user_id: uid,
          };

          const [prodRes, matRes, revRes] = await Promise.all([
            // Use marketplaceService.getAll with explicit params for strict filtering
            marketplaceService.products.getMyProducts(ownerParams),
            marketplaceService.materialListings.getMyListings(ownerParams),
            userService.getUserReviews(uid),
          ]);

          setProducts(normalizeResponse(prodRes));
          setMaterials(normalizeResponse(matRes));
          setReviews(normalizeResponse(revRes));
        } catch (listErr) {
          console.warn("Profile related lists load error:", listErr);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setError(
          err.response?.data?.detail || err.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, authUser, location.state]); // Add location.state to dependencies

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-12 mt-12">
        {loading ? (
          <div>Loading profile...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDEBAR */}
            <ProfileSidebar userData={profile} />

            {/* MAIN CONTENT */}
            <div className="flex-1">
              {/* Profile Info & Rating */}
              <ProfileHeader userData={profile} />

              {/* Selling Items Section */}
              <SellingSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                products={products}
                materials={materials}
              />

              {/* Reviews Section */}
              <ReviewsSection reviews={reviews} userData={profile} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
