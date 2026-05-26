"use client";

import React from 'react';
import { FileText, Upload, ChevronRight } from 'lucide-react';

interface SalarySlipUploadProps {
  file: File | null;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onBack: () => void;
  showBackButton?: boolean;
}

export const SalarySlipUpload: React.FC<SalarySlipUploadProps> = ({
  file,
  uploading,
  onFileChange,
  onUpload,
  onBack,
  showBackButton = true,
}) => {
  return (
    <div className="max-w-xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Upload Salary Slip</h3>
          <p className="text-slate-400 text-xs mt-0.5">Please provide your recent salary statement to attach to your loan file.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-850 hover:border-indigo-500/40 bg-slate-950/40 rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center group">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center group-hover:scale-105 transition-all">
              <Upload className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Choose a file or drag here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepts PDF, JPG, PNG formats up to 5 MB
              </p>
            </div>
          </label>

          {file && (
            <div className="mt-4 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold">
              Selected size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pt-2">
          {showBackButton && (
            <button
              onClick={onBack}
              disabled={uploading}
              className="flex-1 py-3 px-4 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Back to Details
            </button>
          )}
          <button
            onClick={onUpload}
            disabled={!file || uploading}
            className="flex-[2] flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>Submit & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default SalarySlipUpload;
