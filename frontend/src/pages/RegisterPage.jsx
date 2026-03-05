import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import useAuthStore from "../store/useAuthStore";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const { register, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(
            formData.username,
            formData.email,
            formData.password
        );
        if (success) navigate("/");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join millions connecting every day"
        >
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-messenger-muted mb-1">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full input-pill placeholder-messenger-muted/50"
                            placeholder="johndoe"
                            minLength={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-messenger-muted mb-1">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full input-pill placeholder-messenger-muted/50"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-messenger-muted mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full input-pill placeholder-messenger-muted/50"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-messenger-blue hover:bg-messenger-darkBlue text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>

                <p className="text-center text-sm text-messenger-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="text-messenger-blue hover:underline font-semibold">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
