export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Travel Companion AU
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find language assistance companions for your flights
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/register"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors min-h-11 inline-flex items-center"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors min-h-11 inline-flex items-center"
          >
            Login
          </a>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Privacy First</h3>
          <p className="text-gray-600">
            Your mobile number is never exposed. We only share your first name and languages.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Easy Matching</h3>
          <p className="text-gray-600">
            Search for companions on the same flight route with matching language needs.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Secure Messaging</h3>
          <p className="text-gray-600">
            Connect with your travel companions through our secure messaging system.
          </p>
        </div>
      </div>
    </div>
  );
}
