import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import useAuthStore from "../store/useAuthStore";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) navigate("/");
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to Messenger"
        >
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-messenger-muted mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full input-pill placeholder-messenger-muted/50"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-messenger-muted mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full input-pill placeholder-messenger-muted/50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-messenger-blue hover:bg-messenger-darkBlue text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <p className="text-center text-sm text-messenger-muted">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-messenger-blue hover:underline font-semibold">
                        Create one
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
