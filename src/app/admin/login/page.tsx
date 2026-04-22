import { LoginForm } from "./login-form";

export const metadata = { title: "後台登入 | Dorcas Travel" };

export default async function AdminLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next = "/admin/tours" } = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fdf7ee] p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo / brand */}
                <div className="text-center space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b83553]">
                        Dorcas Travel
                    </p>
                    <h1 className="text-2xl font-bold text-[#7a4020]">
                        後台管理系統
                    </h1>
                    <p className="text-sm text-[#7a4020]/60">
                        請以管理員帳號登入
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-[#e8c9a0] bg-white px-8 py-8 shadow-sm">
                    <LoginForm next={next} />
                </div>

                <p className="text-center text-xs text-[#7a4020]/40">
                    僅限授權人員使用
                </p>
            </div>
        </main>
    );
}
