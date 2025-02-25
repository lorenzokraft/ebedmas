import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Subscription Terms</h2>
              <div className="space-y-2">
                <p>By subscribing to Ebedmas, you agree to the following terms:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your subscription will begin after the 7-day trial period</li>
                  <li>You can cancel your subscription at any time during the trial period</li>
                  <li>If you don't cancel during the trial, you will be automatically charged the subscription fee</li>
                  <li>The ₦50 card authorization fee is non-refundable</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Payment Terms</h2>
              <div className="space-y-2">
                <p>Payment processing is handled securely through Paystack:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All payments are processed in Nigerian Naira (NGN)</li>
                  <li>Subscription fees are charged automatically at the start of each billing period</li>
                  <li>Refunds are processed according to our refund policy</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Usage Terms</h2>
              <div className="space-y-2">
                <p>When using Ebedmas, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the service for personal educational purposes only</li>
                  <li>Not share your account credentials with others</li>
                  <li>Not copy or distribute the educational content</li>
                  <li>Maintain appropriate conduct while using the platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Privacy Policy</h2>
              <div className="space-y-2">
                <p>We are committed to protecting your privacy:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your personal information is securely stored and encrypted</li>
                  <li>We do not share your information with third parties</li>
                  <li>Your payment information is handled securely by Paystack</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cancellation Policy</h2>
              <div className="space-y-2">
                <p>You can cancel your subscription at any time:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Cancel during the trial period to avoid any charges</li>
                  <li>If you cancel after the trial, you'll maintain access until the end of your billing period</li>
                  <li>No refunds for partial months of service</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: February 19, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
