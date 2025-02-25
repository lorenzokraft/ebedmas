import React from 'react';
import './SubscriptionPage.css';

const SubscriptionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {/* Family Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">For Family</h3>
              <p className="mt-4 text-gray-500">Perfect for family learning</p>
              <div className="image-container">
                <img 
                  src="/images/fam.jpg" 
                  alt="Family Plan" 
                  className="subscription-image"
                  width={300}
                  height={200}
                />
              </div>
              <div>
                <a
                  href="/plan-detail"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Join Now
                </a>
              </div>
            </div>
          </div>

          {/* School Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">For Schools</h3>
              <p className="mt-4 text-gray-500">Custom solutions for Schools</p>
              <div className="image-container">
                <img 
                  src="./images/fam.jpg" 
                  alt="School Plan" 
                  className="subscription-image"
                  width={300}
                  height={200}
                />
              </div>
              <div>
                <a
                  href="/for-schools"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Get Quote
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About Us</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="./about" className="text-base text-gray-500 hover:text-gray-900">
                  Our Story
                </a>
              </li>
              <li>
                <a href="./team" className="text-base text-gray-500 hover:text-gray-900">
                  Team
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="./blog" className="text-base text-gray-500 hover:text-gray-900">
                  Blog
                </a>
              </li>
              <li>
                <a href="./help" className="text-base text-gray-500 hover:text-gray-900">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="./privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="./terms" className="text-base text-gray-500 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="./support" className="text-base text-gray-500 hover:text-gray-900">
                  Support
                </a>
              </li>
              <li>
                <a href="./sales" className="text-base text-gray-500 hover:text-gray-900">
                  Sales
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;