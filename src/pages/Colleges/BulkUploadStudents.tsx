import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import collegeService from '../../services/collegeService';
import batchService from '../../services/batchService';
import studentService from '../../services/studentService';
import { ApiCollege, ApiBatch } from '../../types/college';
import { BulkCreateStudentItem } from '../../types/student';

interface ParsedStudent {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  department?: string;
  batchId?: string;
  isValid: boolean;
  errors: string[];
}

const BulkUploadStudents: React.FC = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [college, setCollege] = useState<ApiCollege | null>(null);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [uploadResults, setUploadResults] = useState<{
    successCount: number;
    errorCount: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);

  // Fetch college and batches
  const fetchData = useCallback(async () => {
    if (!collegeId) return;

    setIsLoading(true);
    try {
      const [collegeResponse, batchesResponse] = await Promise.all([
        collegeService.getCollegeById(collegeId),
        batchService.getBatches(collegeId),
      ]);

      if (collegeResponse.success && collegeResponse.data) {
        setCollege(collegeResponse.data.college);
      }
      if (batchesResponse.success && batchesResponse.data) {
        setBatches(batchesResponse.data.batches);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('error', 'Failed to load college data');
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateStudent = (student: Partial<ParsedStudent>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!student.name || student.name.length < 3) {
      errors.push('Name must be at least 3 characters');
    }
    if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      errors.push('Invalid email format');
    }
    if (!student.password || student.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    return { isValid: errors.length === 0, errors };
  };

  const parseCSV = (content: string): ParsedStudent[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const students: ParsedStudent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const student: Partial<ParsedStudent> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'name':
            student.name = value;
            break;
          case 'email':
            student.email = value;
            break;
          case 'password':
            student.password = value;
            break;
          case 'phonenumber':
          case 'phone':
            student.phoneNumber = value || undefined;
            break;
          case 'department':
            student.department = value || undefined;
            break;
          case 'batchid':
          case 'batch':
            student.batchId = value || undefined;
            break;
        }
      });

      const validation = validateStudent(student);
      students.push({
        name: student.name || '',
        email: student.email || '',
        password: student.password || '',
        phoneNumber: student.phoneNumber,
        department: student.department,
        batchId: student.batchId,
        isValid: validation.isValid,
        errors: validation.errors,
      });
    }

    return students;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast('error', 'Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content);
      setParsedStudents(parsed);
      setUploadResults(null);

      if (parsed.length === 0) {
        addToast('error', 'No valid data found in file');
      } else {
        const validCount = parsed.filter(s => s.isValid).length;
        addToast('info', `Parsed ${parsed.length} students, ${validCount} valid`);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!collegeId) return;

    const validStudents = parsedStudents.filter(s => s.isValid);
    if (validStudents.length === 0) {
      addToast('error', 'No valid students to upload');
      return;
    }

    setIsUploading(true);
    try {
      const studentsToCreate: BulkCreateStudentItem[] = validStudents.map(s => ({
        collegeId,
        name: s.name,
        email: s.email,
        password: s.password,
        phoneNumber: s.phoneNumber,
        department: s.department,
        batchId: s.batchId,
      }));

      const response = await studentService.bulkCreateStudents({ students: studentsToCreate });

      if (response.success && response.data) {
        setUploadResults({
          successCount: response.data.successCount,
          errorCount: response.data.errorCount,
          errors: response.data.errors,
        });

        if (response.data.successCount > 0) {
          addToast('success', `${response.data.successCount} students created successfully`);
        }
        if (response.data.errorCount > 0) {
          addToast('warning', `${response.data.errorCount} students failed to create`);
        }
      } else {
        addToast('error', response.error?.message || 'Failed to upload students');
      }
    } catch (error: unknown) {
      console.error('Failed to upload students:', error);
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      addToast('error', axiosError.response?.data?.error?.message || 'Failed to upload students');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleFormat = () => {
    const headers = ['name', 'email', 'password', 'phoneNumber', 'department', 'batchId'];
    const sampleRows = [
      ['John Doe', 'john@example.com', 'Password123', '9876543210', 'Computer Science', ''],
      ['Jane Smith', 'jane@example.com', 'Password456', '9876543211', 'Electronics', ''],
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addToast('success', 'Sample format downloaded');
  };

  const clearData = () => {
    setParsedStudents([]);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">error</span>
        <h3 className="text-lg font-medium text-gray-600">College not found</h3>
        <button onClick={() => navigate('/colleges')} className="mt-4 text-primary-600 hover:underline">
          Go back to colleges
        </button>
      </div>
    );
  }

  const validCount = parsedStudents.filter(s => s.isValid).length;
  const invalidCount = parsedStudents.length - validCount;

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate(`/colleges/${collegeId}/students`)}
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload Students</h1>
        <p className="text-sm text-gray-500 mt-1">Upload multiple students at once for {college.name}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined">info</span>
          Upload Instructions
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
            Upload a CSV file with columns: name, email, password, phoneNumber, department, batchId
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
            Required fields: name (min 3 chars), email (valid format), password (min 8 chars)
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
            Optional fields: phoneNumber, department, batchId
          </li>
        </ul>
        <button
          onClick={downloadSampleFormat}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Download Sample Template
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">
          Upload CSV File
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined">upload_file</span>
            Choose CSV File
          </label>
          {parsedStudents.length > 0 && (
            <button
              onClick={clearData}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {parsedStudents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Preview ({parsedStudents.length} students)</h3>
              <p className="text-sm text-gray-500">
                <span className="text-green-600">{validCount} valid</span>
                {invalidCount > 0 && <span className="text-red-600 ml-2">{invalidCount} invalid</span>}
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading || validCount === 0}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Upload {validCount} Students
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">#</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Phone</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Department</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {parsedStudents.map((student, idx) => (
                  <tr
                    key={idx}
                    className={`${!student.isValid ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {student.isValid ? (
                        <span className="text-green-600">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </span>
                      ) : (
                        <span className="text-red-600">
                          <span className="material-symbols-outlined text-sm">error</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.phoneNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.department || '-'}</td>
                    <td className="px-4 py-3 text-xs text-red-600">{student.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Upload Results</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{uploadResults.successCount}</p>
              <p className="text-sm text-green-700 dark:text-green-400">Successfully Created</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{uploadResults.errorCount}</p>
              <p className="text-sm text-red-700 dark:text-red-400">Failed</p>
            </div>
          </div>

          {uploadResults.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Errors:</h4>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                {uploadResults.errors.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-600 dark:text-red-400 py-1">
                    <span className="font-medium">{err.email}:</span> {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate(`/colleges/${collegeId}/students`)}
              className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800"
            >
              View Students
            </button>
            <button
              onClick={clearData}
              className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Upload More
            </button>
          </div>
        </div>
      )}

      {/* Available Batches Reference */}
      {batches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-4">
            Available Batch IDs (for reference)
          </h3>
          <div className="space-y-2">
            {batches.map(batch => (
              <div key={batch.id} className="flex items-center gap-3 text-sm">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                  {batch.id}
                </code>
                <span className="text-gray-600 dark:text-gray-300">{batch.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadStudents;
