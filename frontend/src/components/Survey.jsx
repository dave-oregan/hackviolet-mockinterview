import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeContent from './FadeContent';
import '../css/Survey.css'; 

const COMPANIES = ['Meta', 'Apple', 'Amazon', 'Netflix', 'Google'];

const Survey = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    major: '',
    school: '',
    companies: [],
    resume: null
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCompany = (company) => {
    setFormData(prev => {
      const exists = prev.companies.includes(company);
      if (exists) {
        return { ...prev, companies: prev.companies.filter(c => c !== company) };
      } else {
        return { ...prev, companies: [...prev.companies, company] };
      }
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Send formData to your backend here
    // const dataToSend = new FormData();
    // dataToSend.append('resume', formData.resume);
    // dataToSend.append('age', formData.age); ...etc
    
    console.log("Submitting Survey Data:", formData);

    // Simulate network delay then redirect home
    setTimeout(() => {
      setLoading(false);
      navigate('/home');
    }, 1500);
  };

  return (
    <FadeContent blur={true} duration={0.8}>
      <div className="survey-container">
        <motion.div 
          className="survey-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="survey-header">
            <h2>Complete Your Profile</h2>
            <p>Help us tailor your interview prep.</p>
          </div>

          <form onSubmit={handleSubmit} className="survey-form">
            {/* Row 1: Age & Gender */}
            <div className="form-row">
              <div className="form-group half">
                <label>Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 21" 
                  required 
                />
              </div>
              <div className="form-group half">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Row 2: School & Major */}
            <div className="form-group">
              <label>School / University (Optional)</label>
              <input 
                type="text" 
                name="school" 
                value={formData.school} 
                onChange={handleInputChange} 
                placeholder="e.g. Virginia Tech" 
              />
            </div>
            
            <div className="form-group">
              <label>Major (Optional)</label>
              <input 
                type="text" 
                name="major" 
                value={formData.major} 
                onChange={handleInputChange} 
                placeholder="e.g. Computer Science" 
              />
            </div>

            {/* Target Companies */}
            <div className="form-group">
              <label>Target Companies</label>
              <div className="companies-grid">
                {COMPANIES.map(company => (
                  <button
                    key={company}
                    type="button"
                    className={`company-pill ${formData.companies.includes(company) ? 'active' : ''}`}
                    onClick={() => toggleCompany(company)}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="form-group">
              <label>Upload Resume (PDF)</label>
              <div className="file-upload-wrapper">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  id="resume-upload"
                  className="hidden-input"
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  {formData.resume ? (
                    <span className="file-name">📄 {formData.resume.name}</span>
                  ) : (
                    <span className="placeholder">Click to upload or drag and drop</span>
                  )}
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Setting up Profile...' : 'Complete Setup'}
            </button>
          </form>
        </motion.div>
      </div>
    </FadeContent>
  );
};

export default Survey;