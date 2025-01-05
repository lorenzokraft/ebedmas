import { Heart, Target, Book, Users } from 'lucide-react';
import Footer from './Footer';
const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Ebedmas</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're on a mission to make learning engaging, effective, and accessible to everyone
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded by educators and technology experts, Ebedmas was born from a simple idea:
            learning should be personalized, engaging, and measurable. Since our launch,
            we've helped millions of students achieve their academic goals through
            interactive learning experiences.
          </p>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
            alt="Team collaboration"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {
            icon: Heart,
            title: "Our Mission",
            description: 'To make quality education accessible to everyone, everywhere',
          },
          {
            icon: Target,
            title: "Our Vision",
            description: "To become the world's most trusted learning platform",
          },
          {
            icon: Book,
            title: "Our Approach",
            description: 'Combining proven learning methods with innovative technology',
          },
          {
            icon: Users,
            title: "Our Community",
            description: 'Over 1 million students and educators worldwide',
          },
        ].map((value, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <value.icon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
            <p className="text-gray-600">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Team</h2>
          <p className="text-lg text-gray-600 mb-6">
            We're always looking for passionate individuals to join our mission of
            transforming education
          </p>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors">
            View Careers
          </button>
        </div>
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
};

export default AboutPage;