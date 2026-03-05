import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={40} className="text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>

        {/* Description */}
        <p className="text-gray-600 mb-2 font-semibold">Page Not Found</p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sorry, the page youre looking for doesnt exist. It might have been
          moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
