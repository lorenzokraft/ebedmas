import { ArrowRight, Star, Users, Trophy, Sparkles, Quote } from 'lucide-react';
import Footer from './Footer';

const yearGroups = [
  {
    level: "R",
    title: "Reception",
    description: "Counting objects, inside and outside, longer and shorter, letter names, rhyming words and more.",
    maths: 181,
    english: 78,
    color: "bg-teal-500"
  },
  {
    level: "1",
    title: "Year 1",
    description: "Addition and subtraction, shapes and patterns, phonics, sight words, basic sentences and more.",
    maths: 245,
    english: 132,
    color: "bg-purple-500"
  },
  {
    level: "2",
    title: "Year 2",
    description: "Place-value models, measurement, telling time, categories, nouns, verb tense, time order and more.",
    maths: 311,
    english: 169,
    color: "bg-green-500"
  },
  {
    level: "3",
    title: "Year 3",
    description: "Multiplication, division, fractions, grammar, punctuation, reading comprehension and more.",
    maths: 342,
    english: 198,
    color: "bg-blue-500"
  },
  {
    level: "4",
    title: "Year 4",
    description: "Decimals, geometry, area and perimeter, advanced grammar, writing styles and more.",
    maths: 378,
    english: 225,
    color: "bg-red-500"
  },
  {
    level: "5",
    title: "Year 5",
    description: "Advanced calculations, statistics, complex sentences, literary analysis and more.",
    maths: 412,
    english: 256,
    color: "bg-yellow-500"
  },
  {
    level: "6",
    title: "Year 6",
    description: "SATs preparation, advanced problem solving, comprehensive English skills and more.",
    maths: 445,
    english: 289,
    color: "bg-indigo-500"
  },
  {
    level: "7",
    title: "Year 7",
    description: "Algebra foundations, geometry proofs, advanced literature analysis, essay writing techniques and more.",
    maths: 478,
    english: 312,
    color: "bg-pink-500"
  },
  {
    level: "8",
    title: "Year 8",
    description: "Linear equations, scientific notation, Shakespearean literature, creative writing, debate skills and more.",
    maths: 512,
    english: 334,
    color: "bg-orange-500"
  },
  {
    level: "9",
    title: "Year 9",
    description: "Quadratic equations, trigonometry, advanced literary devices, research writing, critical analysis and more.",
    maths: 534,
    english: 356,
    color: "bg-cyan-500"
  },
  {
    level: "10",
    title: "Year 10",
    description: "Advanced algebra, geometric proofs, complex literature analysis, academic writing, and GCSE preparation.",
    maths: 567,
    english: 378,
    color: "bg-lime-500"
  },
  {
    level: "11",
    title: "Year 11",
    description: "GCSE-level mathematics, advanced calculus foundations, comprehensive literature review, exam preparation.",
    maths: 589,
    english: 401,
    color: "bg-emerald-500"
  },
  {
    level: "12",
    title: "Year 12",
    description: "A-level preparation, advanced mathematics, university-level literature studies, research methodologies.",
    maths: 623,
    english: 445,
    color: "bg-violet-500"
  },
  {
    level: "13",
    title: "Year 13",
    description: "A-level preparation, advanced mathematics, university-level literature studies, research methodologies.",
    maths: 623,
    english: 445,
    color: "bg-gray-500"
  }
];

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Master Any Subject with Interactive Learning
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join millions of students worldwide using Ebedmas to excel in their studies
        </p>
        <a href="/quiz">
        <button className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Start Learning Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
        </a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {
            icon: Star,
            title: 'Adaptive Learning',
            description: 'Personalized practice that adapts to your level',
          },
          {
            icon: Users,
            title: 'Expert Support',
            description: 'Get help from qualified teachers when needed',
          },
          {
            icon: Trophy,
            title: 'Track Progress',
            description: 'Monitor your improvement with detailed analytics',
          },
          {
            icon: Sparkles,
            title: 'Earn Rewards',
            description: 'Stay motivated with achievements and rewards',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <feature.icon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Start Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yearGroups.map((year) => (
            <div 
              key={year.level}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-gray-900 text-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`${year.color} w-8 h-8 rounded-full flex items-center justify-center font-bold`}>
                  {year.level}
                </span>
                <h3 className="text-xl font-semibold">{year.title}</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">{year.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Maths</span>
                  <span className="text-blue-400">{year.maths} skills →</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>English</span>
                  <span className="text-blue-400">{year.english} skills →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "GCSE Student",
              image: "https://randomuser.me/api/portraits/women/1.jpg",
              quote: "Ebedmas helped me achieve an A* in both Maths and English. The practice questions are spot-on for exam preparation!"
            },
            {
              name: "James Wilson",
              role: "Year 6 Student",
              image: "https://randomuser.me/api/portraits/men/2.jpg",
              quote: "I love how interactive the lessons are. It's made learning fun, and my SATs scores have improved so much!"
            },
            {
              name: "Emily Chen",
              role: "A-Level Student",
              image: "https://randomuser.me/api/portraits/women/3.jpg",
              quote: "The advanced topics section is brilliant for A-Level prep. It's like having a personal tutor available 24/7."
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="relative">
                <Quote className="w-8 h-8 text-indigo-100 absolute top-0 left-0 -mt-4 -ml-4" />
                <p className="text-gray-600 italic relative z-10 pl-4">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6">
            Join over 1 million students who have mastered their subjects with Ebedmas
          </p>
          <a href="/subscription">
          <button className="px-8 py-3 bg-white text-indigo-600 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Try for Free
          </button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;