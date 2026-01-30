
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Todo App
        </h1>
        <p className="text-gray-600 mb-8">
          Multi-user todo application with authentication
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
