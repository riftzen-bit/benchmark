import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col justify-center px-6">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">404</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        Không tìm thấy trang.
      </h1>
      <p className="mt-3 text-[var(--mute)]">
        Có thể đường dẫn cũ, hoặc bạn vừa gõ nhầm.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="border border-[var(--foreground)] px-4 py-2 text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        >
          Về trang chính
        </Link>
      </div>
    </div>
  );
}
