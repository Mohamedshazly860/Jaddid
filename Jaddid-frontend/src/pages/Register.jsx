import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./Register.css";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة! / Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError(
        "كلمة المرور يجب أن تكون 8 أحرف على الأقل / Password must be at least 8 characters"
      );
      return;
    }

    if (!role) {
      setError("الرجاء اختيار نوع الحساب / Please select account type");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/accounts/register/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        role: role,
      });

      console.log("Registration successful:", response.data);

      const { tokens, user } = response.data;
      if (tokens) {
        const { access, refresh } = tokens;
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        // Auto-login after registration
        login(user, access);
        navigate("/");
      } else {
        alert("تم التسجيل بنجاح! / Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Backend Error:", error.response?.data || error.message);

      let errorMessage = "";

      if (error.response?.data) {
        const data = error.response.data;

        if (data.email) {
          errorMessage = `البريد الإلكتروني: ${
            Array.isArray(data.email) ? data.email.join(", ") : data.email
          }`;
        } else if (data.password) {
          errorMessage = `كلمة المرور: ${
            Array.isArray(data.password)
              ? data.password.join(", ")
              : data.password
          }`;
        } else if (data.first_name) {
          errorMessage = `الاسم الأول: ${
            Array.isArray(data.first_name)
              ? data.first_name.join(", ")
              : data.first_name
          }`;
        } else if (data.last_name) {
          errorMessage = `الاسم الأخير: ${
            Array.isArray(data.last_name)
              ? data.last_name.join(", ")
              : data.last_name
          }`;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          const errors = Object.entries(data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
          errorMessage = errors || "فشل التسجيل! / Registration failed!";
        }
      } else if (error.message === "Network Error") {
        errorMessage =
          "خطأ في الاتصال بالسيرفر! تأكد من تشغيل السيرفر / Network Error! Check if backend is running";
      } else {
        errorMessage = error.message || "فشل التسجيل! / Registration failed!";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form-container mt-12">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
              required
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
              required
              disabled={isLoading}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <Select value={role} onValueChange={setRole} disabled={isLoading}>
            <SelectTrigger className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50">
              <SelectValue placeholder="Select Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Factory">Factory</SelectItem>
              <SelectItem value="Company">Company</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 disabled:bg-forest/50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-muted-foreground">
          Already have an account?{" "}
          <span
            className="text-orange hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
