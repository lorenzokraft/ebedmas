import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../admin/services/api';

interface FormData {
  // Contact Information
  name: string;
  email: string;
  phoneNumber: string;
  position: string;
  
  // School Information
  schoolName: string;
  address: string;
  townCity: string;
  lga: string;
  country: string;
  
  // Implementation Details
  schoolType: string;
  subjects: {
    maths: boolean;
    english: boolean;
    science: boolean;
  };
  studentYearLevels: string;
  numberOfStudents: string;
  numberOfTeachers: string;
  implementationPlan: string;
  marketingConsent: boolean;
}

const ForSchools = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    schoolName: '',
    address: '',
    townCity: '',
    lga: '',
    country: 'United Kingdom',
    schoolType: '',
    subjects: {
      maths: false,
      english: false,
      science: false,
    },
    studentYearLevels: '',
    numberOfStudents: '',
    numberOfTeachers: '',
    implementationPlan: '',
    marketingConsent: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/quote-requests', formData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Quote Request Submitted',
        text: 'We will contact you soon with pricing information.',
      });
      navigate('/subscription');
    } catch (error) {
      console.error('Error submitting quote request:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit quote request. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-500 text-white rounded-t-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4">Request a quote</h1>
          <p className="text-center">
            As soon as you submit your quote request, one of our dedicated account managers will contact you immidiately.
          </p>
          
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-b-lg px-8 pt-6 pb-8 mb-4">
          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your contact information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  E-mail address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                  Position
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select a position</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your school information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schoolName">
                  School
                </label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="townCity">
                    Town/City
                  </label>
                  <input
                    type="text"
                    id="townCity"
                    name="townCity"
                    value={formData.townCity}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lga">
                    LGA
                  </label>
                  <input
                    type="text"
                    id="lga"
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ireland">Ireland</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your implementation</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schoolType">
                  Type of School
                </label>
                <select
                  id="schoolType"
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select school type</option>
                  <option value="Private">Private</option>
                  <option value="Government Public School">Government Public School</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Subjects
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maths"
                      name="maths"
                      checked={formData.subjects.maths}
                      onChange={handleSubjectChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maths" className="ml-2 block text-sm text-gray-900">
                      Maths (Reception-Year 13)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="english"
                      name="english"
                      checked={formData.subjects.english}
                      onChange={handleSubjectChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="english" className="ml-2 block text-sm text-gray-900">
                      English (Reception-Year 13)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="science"
                      name="science"
                      checked={formData.subjects.science}
                      onChange={handleSubjectChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="science" className="ml-2 block text-sm text-gray-900">
                      Science (Years 1-9)
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentYearLevels">
                  Student year levels
                </label>
                <input
                  type="text"
                  id="studentYearLevels"
                  name="studentYearLevels"
                  value={formData.studentYearLevels}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Reception-Year 6"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfStudents">
                  Number of students
                </label>
                <input
                  type="number"
                  id="numberOfStudents"
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="100"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfTeachers">
                  Number of teachers
                </label>
                <input
                  type="number"
                  id="numberOfTeachers"
                  name="numberOfTeachers"
                  value={formData.numberOfTeachers}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="implementationPlan">
                  Tell us how you plan to use Ebedmas?
                </label>
                <textarea
                  id="implementationPlan"
                  name="implementationPlan"
                  value={formData.implementationPlan}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Consent and Submit */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-500">
                I consent to receiving e-mails from Ebedmas about its product and promotions.
              </label>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Get a quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForSchools;
