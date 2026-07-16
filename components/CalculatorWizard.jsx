"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import StepFamily from "./steps/StepFamily";
import StepParentAIncome from "./steps/StepParentAIncome";
import StepParentBIncome from "./steps/StepParentBIncome";
import StepDeductions from "./steps/StepDeductions";
import StepResults from "./steps/StepResults";

// ---------------------------------------------------------------------------
// STEP CONFIG
// Centralizing the step labels here means if you ever rename a step or add a
// 5th one later, you only edit this array — the progress bar and the
// next/back logic both read from it automatically.
// ---------------------------------------------------------------------------
const STEPS = [
  { id: 1, label: "Family" },
  { id: 2, label: "Parent A Income" },
  { id: 3, label: "Parent B Income" },
  { id: 4, label: "Deductions" },
  { id: 5, label: "Results" }, 
];

// ---------------------------------------------------------------------------
// SHARED FORM STATE SHAPE
// This is the "single source of truth" object. Every step's inputs write
// into this same object, so data typed in Step 2 is still there if the user
// goes back to Step 1, then forward to Step 2 again, then jumps to Step 4.
// We will expand this shape in later steps (Parent A/B income fields,
// deductions, etc.) — for now it's just enough to prove persistence works.
// ---------------------------------------------------------------------------
const initialFormData = {
  // Step 1: Family
  numberOfChildren: 1,
  parentAFilingStatus: "single",
  parentBFilingStatus: "single",
  highEarnerTimesharePercent: 50,

  // Step 2: Parent A Income (placeholder fields, built out in next step)
  parentA: {
    monthlyGrossWages: "",
    selfEmploymentIncome: "",
    otherTaxableIncome: "",
  },

  // Step 3: Parent B Income (placeholder fields, built out in next step)
  parentB: {
    monthlyGrossWages: "",
    selfEmploymentIncome: "",
    otherTaxableIncome: "",
  },

  // Step 4: Deductions (placeholder fields, built out in next step)
  deductions: {
    parentAHealthInsurance: "",
    parentAChildHealthInsurance: "",
    parentARetirement: "",
    parentAUnionDues: "",
    parentAMortgageInterest: "",
    parentBHealthInsurance: "",
    parentBChildHealthInsurance: "",
    parentBRetirement: "",
    parentBUnionDues: "",
    parentBMortgageInterest: "",
  },
};

export default function CalculatorWizard() {
  // currentStep drives which step component renders, and which progress
  // dot is "active". It's just a number from 1 to STEPS.length.
  const [currentStep, setCurrentStep] = useState(1);

  // formData is the single object holding everything the user has typed
  // across ALL steps. Because this useState lives in CalculatorWizard
  // (the parent), and not inside an individual step, it survives step
  // changes — that's the "lifting state up" pattern.
  const [formData, setFormData] = useState(initialFormData);

  const totalSteps = STEPS.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // ---------------------------------------------------------------------
  // updateFormData: the ONE function every step component will call to
  // save its inputs back into the shared formData object.
  //
  // Usage from a child step looks like:
  //   updateFormData({ numberOfChildren: 3 })
  //   updateFormData({ parentA: { ...formData.parentA, monthlyGrossWages: "5000" } })
  //
  // Using the functional form of setFormData (prev => ...) avoids stale
  // state bugs if multiple updates happen quickly.
  // ---------------------------------------------------------------------
  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    if (!isLastStep) setCurrentStep((step) => step + 1);
  };
  const resetForm = () => { setCurrentStep(1); setFormData(initialFormData); };

  const goBack = () => {
    
    if (!isFirstStep) setCurrentStep((step) => step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* ---------------------------------------------------------- */}
        {/* PROGRESS BAR */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-8 text-center">
  <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 mb-3">
    <span className="text-xs font-semibold text-white uppercase tracking-wide">California Family Code § 4055</span>
  </div>
  <h1 className="text-3xl font-extrabold text-slate-900">California Child Support and Spousal Support</h1>
  <h1 className="text-3xl font-extrabold text-blue-600">Calculator</h1>
  <p className="mt-2 text-sm text-slate-500">Enter your financial information below to get an estimated monthly child and spousal support amount.</p>
</div>
        <ProgressBar steps={STEPS} currentStep={currentStep} />

        {/* ---------------------------------------------------------- */}
        {/* MAIN CONTENT CARD */}
        {/* Each step component receives formData (to read) and
            updateFormData (to write). This is a temporary placeholder
            until Step 2 builds the real Step 1-4 components. */}
        {/* ---------------------------------------------------------- */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <p className="text-sm font-medium text-blue-600">
              Step {currentStep} of {totalSteps}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {STEPS[currentStep - 1].label}
            </h2>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {currentStep === 1 && (
              <StepFamily
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <StepParentAIncome
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 3 && (
            <StepParentBIncome
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
              <StepDeductions formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 5 && (
              <StepResults formData={formData} resetForm={resetForm} />
            )}
            
          </div>

          {/* -------------------------------------------------------- */}
          {/* NAV BUTTONS */}
          {/* -------------------------------------------------------- */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirstStep}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={isLastStep}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              {isLastStep ? "Done" : "Next"}
            </button>
          </div>
        </div>

        {/* Dev-only helper so you can SEE state persisting across steps
            while you're testing. Safe to delete once you trust it works. */}
        
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS BAR SUBCOMPONENT
// Pure presentation — it just looks at currentStep vs each step's id to
// decide whether a dot is "done" (checkmark), "active" (filled blue), or
// "upcoming" (gray outline).
// ---------------------------------------------------------------------------
function ProgressBar({ steps, currentStep }) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isLastInList = index === steps.length - 1;

        return (
          <li
            key={step.id}
            className={`flex items-center ${
              isLastInList ? "" : "flex-1"
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isActive
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={18} /> : step.id}
              </div>
              <span
                className={`mt-2 whitespace-nowrap text-xs font-medium ${
                  isActive || isCompleted ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLastInList && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  isCompleted ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}


 