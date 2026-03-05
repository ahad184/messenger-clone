import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-messenger-bg px-4 py-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-messenger-blue/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-messenger-blue/5 rounded-full blur-[100px]"></div>

            <div className="max-w-md w-full space-y-8 auth-card p-10 relative z-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-tr from-messenger-blue to-messenger-blue/80 p-4 rounded-3xl shadow-[0_8px_20px_rgba(0,132,255,0.4)] animate-float">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-10 h-10 text-white fill-current"
                            >
                                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.915 1.455 5.513 3.734 7.237V22l3.29-1.802c.94.26 1.936.402 2.976.402 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.25 11.258l-2.5-2.677-4.75 2.677 5.25-5.58 2.5 2.677 4.75-2.677-5.25 5.58z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                    <p className="mt-2 text-sm text-messenger-muted">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
