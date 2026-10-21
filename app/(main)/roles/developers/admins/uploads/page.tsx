'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Clock, Plus, X, Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Loading from '@/components/loading';

// Type definitions
interface FormData {
  title: string;
  flag: string;
  description: string;
  points: string;
  category: string;
  link: string;
  challengeType: 'link' | 'file';
  isTimeLimited: boolean;
  timeLimit: string;
  timeLimitUnit: 'hours' | 'days' | 'weeks';
  uploadedBy: string;
  difficulty: string;
}

interface DifficultyFactors {
  multifacetedSkills: number;
  complexCode: number;
  multipleSteps: number;
  dynamicElements: number;
  hiddenAttackVectors: number;
}

interface Hint {
  id: number;
  text: string;
  pointsDeduction: string;
}

interface SubmissionData extends FormData {
  hints: Hint[];
  expiryDate: Date | null;
  createdAt: string;
}

// Common styles
const styles = {
  input: "w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition duration-200 placeholder-gray-500 dark:placeholder-gray-400",
  label: "block uppercase tracking-wide text-gray-700 dark:text-gray-300 text-xs font-bold mb-2",
  button: "px-6 py-2 rounded-lg font-medium transition duration-200",
  section: "border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700",
  alert: "p-4 border rounded-lg text-center"
};

// Categories array
const CATEGORIES = [
  'All', 'Web Exploitation', 'Cryptography', 'Reverse Engineering',
  'Forensics', 'General Skills', 'Binary Exploitation', 'Privilege Escalation',
  'IOT', 'OSINT', 'Miscellaneous', 'Steganography'
];

// Time units
const TIME_UNITS = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' }
];

// Difficulty factor descriptions
const FACTOR_DESCRIPTIONS = {
  multifacetedSkills: "Does this challenge require multiple skill sets? (e.g., web + crypto, forensics + reverse engineering)",
  complexCode: "Does it involve complex code analysis, custom payloads, or advanced bypasses?",
  multipleSteps: "Are there multiple distinct steps to solve this challenge?",
  dynamicElements: "Does the challenge have dynamic or changing elements? (e.g., rotating flags, time-based components)",
  hiddenAttackVectors: "Does it require finding non-obvious or hidden attack vectors?"
};

const calculateDifficulty = (factors: DifficultyFactors) => {
  // Weighted calculation based on the GitHub calculator
  const weights = {
    multifacetedSkills: 0.20,
    complexCode: 0.25,
    multipleSteps: 0.20,
    dynamicElements: 0.20,
    hiddenAttackVectors: 0.15
  };

  const totalScore = (
    factors.multifacetedSkills * weights.multifacetedSkills +
    factors.complexCode * weights.complexCode +
    factors.multipleSteps * weights.multipleSteps +
    factors.dynamicElements * weights.dynamicElements +
    factors.hiddenAttackVectors * weights.hiddenAttackVectors
  );

  const normalizedScore = totalScore;
  
  const points = Math.round(30 + (normalizedScore / 5) * 120);
  
  // Determine difficulty level
  let difficulty = 'Easy';
  let stars = 1;
  
  if (normalizedScore >= 4.2) {
    difficulty = 'Expert';
    stars = 5;
  } else if (normalizedScore >= 3.5) {
    difficulty = 'Hard';
    stars = 4;
  } else if (normalizedScore >= 2.5) {
    difficulty = 'Medium';
    stars = 3;
  } else if (normalizedScore >= 1.5) {
    difficulty = 'Easy-Medium';
    stars = 2;
  }
  
  return { points, difficulty, score: normalizedScore.toFixed(2), stars };
};

const DifficultySlider = ({ label, value, onChange, description }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <span className="text-sm font-bold text-rose-500 dark:text-rose-400">{value}</span>
    </div>
    <div className="group relative">
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
      <span>{description}</span>
    </p>
  </div>
);

const DifficultyDisplay = ({ score, difficulty, points, stars }: {
  score: string;
  difficulty: string;
  points: number;
  stars: number;
}) => {
  const percentage = (parseFloat(score) / 5) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-rose-200 dark:border-rose-800">
      <div className="relative w-32 h-32 mb-4">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-600"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
            className="text-rose-500 dark:text-rose-400 transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">{Math.round(percentage)}%</span>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          points: {score}/5.00
        </p>
        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{difficulty}</p>
        <div className="flex gap-1 justify-center">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-xl ${i < stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
              ★
            </span>
          ))}
        </div>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{points} pts</p>
      </div>
    </div>
  );
};

const InputField = ({ id, type = "text", placeholder, required = false, children, formData, handleChange, disabled = false }: {
  id: keyof FormData;
  type?: string;
  placeholder?: string;
  required?: boolean;
  children?: React.ReactNode;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className={styles.label}>{children || id.charAt(0).toUpperCase() + id.slice(1)}</label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={formData[id] as string}
      onChange={handleChange}
      className={`${styles.input} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      required={required}
      disabled={disabled}
      {...(type === "number" && { min: id === "points" ? "1" : "0" })}
    />
  </div>
);

const Alert = ({ type, message }: { type: 'error' | 'success'; message: string }) => (
  <div className={`${styles.alert} ${type === 'error' ? 'bg-white dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
    {message}
  </div>
);

const DetailRow = ({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) => (
  <div>
    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>
    <p className={`text-gray-600 dark:text-gray-400 break-words ${isMono ? 'font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all' : ''}`}>
      {value || "Not specified"}
    </p>
  </div>
);

const UploadPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "", flag: "", description: "", points: "", category: "All",
    link: "", challengeType: "link", isTimeLimited: false, timeLimit: "", timeLimitUnit: "days", uploadedBy: "", difficulty: ""
  });
  
  const [difficultyFactors, setDifficultyFactors] = useState<DifficultyFactors>({
    multifacetedSkills: 2,
    complexCode: 2,
    multipleSteps: 2,
    dynamicElements: 2,
    hiddenAttackVectors: 2
  });
  
  const [hints, setHints] = useState<Hint[]>([{ id: 1, text: "", pointsDeduction: "" }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState<boolean>(true);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  // Calculate difficulty whenever factors change
  useEffect(() => {
    const result = calculateDifficulty(difficultyFactors);
    setFormData(prev => ({
      ...prev,
      points: result.points.toString(),
      difficulty: result.difficulty
    }));
  }, [difficultyFactors]);

  // Authentication and admin check
  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        router.push('/roles/developers/admins/auth');
        return;
      }

      try {
        setAdminCheckLoading(true);
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        });
        
        const data = await response.json();
        
        if (response.ok && data.isAdmin) {
          setIsAuthenticated(true);
          const username = session.user.name || session.user.email?.split('@')[0] || 'admin';
          setFormData(prev => ({ ...prev, uploadedBy: username }));
        } else {
          router.push('/roles/developers/admins/auth');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/roles/developers/admins/auth');
        return;
      } finally {
        setAdminCheckLoading(false);
        setLoading(false);
      }
    };

    checkAuthAndAdmin();
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === 'checkbox' ? checked : value 
    }));
  };

  const updateDifficultyFactor = (factor: keyof DifficultyFactors, value: number) => {
    setDifficultyFactors(prev => ({ ...prev, [factor]: value }));
  };

  const addHint = (): void => {
    const newId = hints.length > 0 ? Math.max(...hints.map(h => h.id)) + 1 : 1;
    setHints([...hints, { id: newId, text: "", pointsDeduction: "" }]);
  };

  const removeHint = (id: number): void => {
    if (hints.length > 1) {
      setHints(hints.filter(hint => hint.id !== id));
    }
  };

  const updateHint = (id: number, field: keyof Omit<Hint, 'id'>, value: string): void => {
    setHints(hints.map(hint => 
      hint.id === id ? { ...hint, [field]: value } : hint
    ));
  };

  const calculateExpiryDate = (): Date | null => {
    if (!formData.isTimeLimited || !formData.timeLimit) return null;
    
    const now = new Date();
    const amount = parseInt(formData.timeLimit);
    const multiplier = { hours: 60 * 60 * 1000, days: 24 * 60 * 60 * 1000, weeks: 7 * 24 * 60 * 60 * 1000 };
    
    return new Date(now.getTime() + amount * multiplier[formData.timeLimitUnit]);
  };

  const resetForm = () => {
    setFormData({
      title: "", flag: "", description: "", points: "", category: "All",
      link: "", challengeType: "link", isTimeLimited: false, timeLimit: "", timeLimitUnit: "days",
      uploadedBy: formData.uploadedBy, difficulty: ""
    });
    setDifficultyFactors({
      multifacetedSkills: 2,
      complexCode: 2,
      multipleSteps: 2,
      dynamicElements: 2,
      hiddenAttackVectors: 2
    });
    setHints([{ id: 1, text: "", pointsDeduction: "" }]);
    setSelectedFile(null);
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validHints = hints.filter(hint => hint.text.trim() !== "");
    for (const hint of validHints) {
      if (!hint.pointsDeduction || parseInt(hint.pointsDeduction) < 0) {
        setError("All hints must have a valid points deduction value.");
        return;
      }
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const validHints = hints.filter(hint => hint.text.trim() !== "");
      
      let response;

      if (formData.challengeType === 'file') {
        // Handle file upload
        if (!selectedFile) {
          setError('Please select a file to upload');
          setIsSubmitting(false);
          return;
        }

        const fileFormData = new FormData();
        fileFormData.append('title', formData.title);
        fileFormData.append('flag', formData.flag);
        fileFormData.append('description', formData.description);
        fileFormData.append('points', formData.points);
        fileFormData.append('category', formData.category);
        fileFormData.append('link', formData.link);
        fileFormData.append('addilinks', formData.link); // For backward compatibility
        fileFormData.append('isTimeLimited', formData.isTimeLimited.toString());
        fileFormData.append('timeLimit', formData.timeLimit);
        fileFormData.append('timeLimitUnit', formData.timeLimitUnit);
        fileFormData.append('hints', JSON.stringify(validHints));
        fileFormData.append('challengeFile', selectedFile);
        
        const expiryDate = calculateExpiryDate();
        if (expiryDate) {
          fileFormData.append('expiryDate', expiryDate.toISOString());
        }

        response = await fetch("/api/problems", {
          method: "POST",
          body: fileFormData,
        });
      } else {
        // Handle JSON data (link-based challenge)
        const submissionData: SubmissionData = {
          ...formData,
          hints: validHints,
          expiryDate: calculateExpiryDate(),
          createdAt: new Date().toISOString(),
        };

        response = await fetch("/api/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        });
      }

      if (response.ok) {
        setSuccess("CTF challenge uploaded successfully!");
        setShowConfirmation(false);
        resetForm();
        
        setTimeout(() => {
          router.push("/problems");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred.");
        setShowConfirmation(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/roles/developers/admins/auth');
  };

  const ConfirmationPopup = () => {
    if (!showConfirmation) return null;

    const validHints = hints.filter(hint => hint.text.trim() !== "");
    const expiryDate = calculateExpiryDate();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Confirm Submission</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">Please review your CTF challenge details before submitting:</p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailRow label="Title" value={formData.title} />
                  <DetailRow label="Category" value={formData.category} />
                  <DetailRow label="Points" value={formData.points} />
                  <DetailRow label="Difficulty" value={formData.difficulty} />
                  <DetailRow label="Uploaded by" value={formData.uploadedBy} />
                </div>
                
                <DetailRow label="Flag" value={formData.flag} isMono />
                
                {formData.description && <DetailRow label="Description" value={formData.description} />}
                {formData.link && <DetailRow label="Resource Link" value={formData.link} />}
                
                {formData.isTimeLimited && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Time Limit:</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.timeLimit} {formData.timeLimitUnit}
                      {expiryDate && (
                        <span className="block text-sm text-amber-600 dark:text-amber-400">
                          Expires: {expiryDate.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {validHints.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Hints ({validHints.length}):</span>
                    <div className="space-y-2 mt-2">
                      {validHints.map((hint) => (
                        <div key={hint.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{hint.text}</p>
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                              -{hint.pointsDeduction} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className={`${styles.button} border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className={`${styles.button} bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading || adminCheckLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !session?.user) {
    return null;
  }

  const difficultyResult = calculateDifficulty(difficultyFactors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-rose-500 dark:text-rose-400">
            Upload CTF Challenge
          </h1>
          <button
            onClick={handleLogout}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    id="title" 
                    placeholder="CTF Challenge Title" 
                    required 
                    formData={formData} 
                    handleChange={handleChange}
                  >
                    Title/Heading
                  </InputField>
                  <InputField 
                    id="flag" 
                    placeholder="flag{example_flag_here}" 
                    required 
                    formData={formData} 
                    handleChange={handleChange}
                  >
                    Flag
                  </InputField>
                </div>

                {/* Description */}
                <div>
                  <label className={styles.label}>Description</label>
                  <textarea
                    id="description"
                    placeholder="Detailed description of the CTF challenge..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`${styles.input} resize-none`}
                    required
                  />
                </div>

                {/* Category and Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={styles.label}>Category</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={styles.input}
                    >
                      {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  
                  {/* Challenge Type Selector */}
                  <div className="mb-6">
                    <label className={styles.label}>Challenge Type *</label>
                    <select
                      id="challengeType"
                      value={formData.challengeType}
                      onChange={handleChange}
                      className={styles.input}
                    >
                      <option value="link">External Link</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>

                  {formData.challengeType === 'link' ? (
                    <InputField 
                      id="link" 
                      type="url" 
                      placeholder="https://example.com/resource" 
                      formData={formData} 
                      handleChange={handleChange}
                    >
                      Resource Link
                    </InputField>
                  ) : (
                    <div className="mb-6">
                      <label className={styles.label}>Challenge File *</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-900/20 dark:file:text-rose-300"
                          accept=".zip,.pdf,.txt,.png,.jpg,.jpeg"
                          required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Supported formats: ZIP, PDF, TXT, PNG, JPG (Max: 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Limit Section */}
                <div className={styles.section}>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Time Limit Settings</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="isTimeLimited"
                        type="checkbox"
                        checked={formData.isTimeLimited}
                        onChange={handleChange}
                        className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500"
                      />
                      <label htmlFor="isTimeLimited" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable time-limited room
                      </label>
                    </div>
                    
                    {formData.isTimeLimited && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField 
                          id="timeLimit" 
                          type="number" 
                          placeholder="1" 
                          required={formData.isTimeLimited} 
                          formData={formData} 
                          handleChange={handleChange}
                        >
                          Duration
                        </InputField>
                        
                        <div>
                          <label className={styles.label}>Unit</label>
                          <select
                            id="timeLimitUnit"
                            value={formData.timeLimitUnit}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition duration-200"
                          >
                            {TIME_UNITS.map(unit => (
                              <option key={unit.value} value={unit.value}>{unit.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {formData.isTimeLimited && formData.timeLimit && calculateExpiryDate() && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          <strong>Room will expire:</strong> {calculateExpiryDate()?.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hints Section */}
                <div className={styles.section}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hints</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addHint}
                      className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Hint
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {hints.map((hint, index) => (
                      <div key={hint.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hint {index + 1}</h4>
                          {hints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHint(hint.id)}
                              className="text-red-500 hover:text-red-700 transition duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hint Text</label>
                            <textarea
                              placeholder="Enter hint text..."
                              value={hint.text}
                              onChange={(e) => updateHint(hint.id, 'text', e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition duration-200 resize-none placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Points Deduction</label>
                            <input
                              type="number"
                              placeholder="10"
                              min="0"
                              value={hint.pointsDeduction}
                              onChange={(e) => updateHint(hint.id, 'pointsDeduction', e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 transition duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    onClick={handleInitialSubmit}
                    disabled={isSubmitting}
                    className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-xl px-8 py-3 text-white font-bold text-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-rose-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Challenge 🚀
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Calculator - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Difficulty Display */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                Challenge Rating
              </h2>
              <DifficultyDisplay 
                score={difficultyResult.score}
                difficulty={difficultyResult.difficulty}
                points={difficultyResult.points}
                stars={difficultyResult.stars}
              />
            </div>

            {/* Difficulty Factors */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Difficulty Factors
              </h2>
              <div className="space-y-6">
                <DifficultySlider
                  label="Multifaceted Skills Needed"
                  value={difficultyFactors.multifacetedSkills}
                  onChange={(val) => updateDifficultyFactor('multifacetedSkills', val)}
                  description={FACTOR_DESCRIPTIONS.multifacetedSkills}
                />
                
                <DifficultySlider
                  label="Complex Code/Payload/Bypass"
                  value={difficultyFactors.complexCode}
                  onChange={(val) => updateDifficultyFactor('complexCode', val)}
                  description={FACTOR_DESCRIPTIONS.complexCode}
                />
                
                <DifficultySlider
                  label="Multiple Steps of Complexity"
                  value={difficultyFactors.multipleSteps}
                  onChange={(val) => updateDifficultyFactor('multipleSteps', val)}
                  description={FACTOR_DESCRIPTIONS.multipleSteps}
                />
                
                <DifficultySlider
                  label="Dynamic Elements and Updates"
                  value={difficultyFactors.dynamicElements}
                  onChange={(val) => updateDifficultyFactor('dynamicElements', val)}
                  description={FACTOR_DESCRIPTIONS.dynamicElements}
                />
                
                <DifficultySlider
                  label="Hidden Attack Vectors"
                  value={difficultyFactors.hiddenAttackVectors}
                  onChange={(val) => updateDifficultyFactor('hiddenAttackVectors', val)}
                  description={FACTOR_DESCRIPTIONS.hiddenAttackVectors}
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>💡 Tip:</strong> Adjust the sliders based on the complexity of your challenge. The points and difficulty rating will automatically update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {ConfirmationPopup()}
    </div>
  );
};

export default UploadPage;