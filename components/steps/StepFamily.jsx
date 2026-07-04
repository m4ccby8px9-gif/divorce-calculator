"use client";

import { useState } from "react";
import { Info, Users, Scale, Percent } from "lucide-react";

// ---------------------------------------------------------------------------
// StepFamily
// Captures the inputs the CA guideline formula needs that aren't dollar
// amounts: number of children, each parent's tax filing status, and the
// high earner's timeshare percentage (H% in Family Code § 4055).
//
// Props:
//   formData       - the full shared form state object (from CalculatorWizard)
//   updateFormData - function to write changes back into that shared state
// ---------------------------------------------------------------------------
export default function StepFamily({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------ */}
      {/* NUMBER OF CHILDREN */}
      {/* ------------------------------------------------------------ */}
      <FieldGroup
        icon={<Users size={18} />}
        label="Number of children"
        tooltip="Count every child you and the other parent share together. This number changes the support multiplier under CA Family Code § 4055 — for example, support for 2 children is calculated at 1.6x the base amount for 1 child, not simply double."
      >
        <div className="flex items-center gap-3">
          <StepperButton
            onClick={() =>
              updateFormData({
                numberOfChildren: Math.max(1, formData.numberOfChildren - 1),
              })
            }
            ariaLabel="Decrease number of children"
          >
            −
          </StepperButton>

          <input
            type="number"
            min={1}
            max={10}
            value={formData.numberOfChildren}
            onChange={(e) => {
              const val = Math.min(
                10,
                Math.max(1, Number(e.target.value) || 1)
              );
              updateFormData({ numberOfChildren: val });
            }}
            className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <StepperButton
            onClick={() =>
              updateFormData({
                numberOfChildren: Math.min(10, formData.numberOfChildren + 1),
              })
            }
            ariaLabel="Increase number of children"
          >
            +
          </StepperButton>
        </div>
      </FieldGroup>

      {/* ------------------------------------------------------------ */}
      {/* FILING STATUS — PARENT A */}
      {/* ------------------------------------------------------------ */}
      <FieldGroup
        icon={<Scale size={18} />}
        label="Parent A — Tax filing status"
        tooltip="Use the filing status each parent expects to use on their next tax return (e.g. your most recent Form 1040, line 1). This affects the tax withholding estimate used to calculate net disposable income."
      >
        <FilingStatusSelect
          value={formData.parentAFilingStatus}
          onChange={(val) => updateFormData({ parentAFilingStatus: val })}
        />
      </FieldGroup>

      {/* ------------------------------------------------------------ */}
      {/* FILING STATUS — PARENT B */}
      {/* ------------------------------------------------------------ */}
      <FieldGroup
        icon={<Scale size={18} />}
        label="Parent B — Tax filing status"
        tooltip="Same as above — the filing status Parent B expects to use on their own, separate tax return."
      >
        <FilingStatusSelect
          value={formData.parentBFilingStatus}
          onChange={(val) => updateFormData({ parentBFilingStatus: val })}
        />
      </FieldGroup>

      {/* ------------------------------------------------------------ */}
      {/* HIGH EARNER TIMESHARE % */}
      {/* ------------------------------------------------------------ */}
      <FieldGroup
        icon={<Percent size={18} />}
        label="High earner's timeshare percentage"
        tooltip='This is the "H%" value in the official CA formula (Family Code § 4055). It is the approximate percentage of time the higher-earning parent has primary physical responsibility for the children — not just overnights, but day-to-day caretaking time. If parents split time 50/50, enter 50. If the higher earner has the kids about 3 days a week, enter roughly 43.'
      >
        <div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={formData.highEarnerTimesharePercent}
              onChange={(e) =>
                updateFormData({
                  highEarnerTimesharePercent: Number(e.target.value),
                })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
            />
            <div className="flex w-20 shrink-0 items-center justify-center rounded-lg border border-slate-300 px-2 py-2 text-sm font-semibold text-slate-900">
              {formData.highEarnerTimesharePercent}%
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-400">
            <span>0% (never with kids)</span>
            <span>50% (equal time)</span>
            <span>100% (always with kids)</span>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldGroup
// Shared wrapper for every field on this step: an icon, a label, an info
// tooltip a layperson can hover/tap to get plain-English guidance, and a
// slot for the actual input control.
// ---------------------------------------------------------------------------
function FieldGroup({ icon, label, tooltip, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <Tooltip text={tooltip} />
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tooltip
// A small "i" icon that reveals plain-English help text on hover (desktop)
// or tap (mobile), so a layperson knows exactly what to enter and why.
// Built with plain useState + onMouseEnter/Leave + onClick so it works on
// both mouse and touch devices without any extra dependency.
// ---------------------------------------------------------------------------
function Tooltip({ text }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-blue-600"
        aria-label="More information"
      >
        <Info size={14} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-6 z-10 w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
          {text}
          {/* little triangle pointer */}
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
        </div>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// StepperButton — the small +/- buttons next to the children count input
// ---------------------------------------------------------------------------
function StepperButton({ onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// FilingStatusSelect — shared dropdown used for both Parent A and Parent B
// ---------------------------------------------------------------------------
function FilingStatusSelect({ value, onChange }) {
  const options = [
    { value: "single", label: "Single" },
    { value: "head_of_household", label: "Head of Household" },
    { value: "married_filing_jointly", label: "Married Filing Jointly" },
    { value: "married_filing_separately", label: "Married Filing Separately" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
