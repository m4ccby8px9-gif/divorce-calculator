"use client";

import { useState } from "react";
import { Info, Heart, PiggyBank, Users, Home } from "lucide-react";

export default function StepDeductions({ formData, updateFormData }) {
  const deductions = formData.deductions;

  const updateField = (key, value) => {
    updateFormData({
      deductions: {
        ...deductions,
        [key]: value,
      },
    });
  };

  const parentATotal =
    num(deductions.parentAHealthInsurance) +
    num(deductions.parentAChildHealthInsurance) +
    num(deductions.parentARetirement) +
    num(deductions.parentAUnionDues) +
    num(deductions.parentAMortgageInterest);

  const parentBTotal =
    num(deductions.parentBHealthInsurance) +
    num(deductions.parentBChildHealthInsurance) +
    num(deductions.parentBRetirement) +
    num(deductions.parentBUnionDues) +
    num(deductions.parentBMortgageInterest);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <h3 className="text-base font-bold text-slate-800">
            Parent A — Allowable Deductions
          </h3>
        </div>

        <div className="space-y-5">
          <DeductionField
            icon={<Heart size={16} />}
            label="Health insurance premiums"
            tooltip="The monthly amount withheld from Parent A's paycheck for their own health, vision, or dental insurance. Find this on their pay stub under 'Health Insurance' or 'Medical Deduction.' Allowed under CA Family Code § 4059(b). Do NOT include the children's portion — that goes in the field below."
            value={deductions.parentAHealthInsurance}
            onChange={(val) => updateField("parentAHealthInsurance", val)}
            placeholder="e.g. 250"
          />

          <DeductionField
            icon={<Heart size={16} />}
            label="Children's health insurance premiums"
            tooltip="The monthly amount Parent A pays specifically to cover the children on their health insurance plan. Sometimes labeled 'Dependent Coverage' or 'Child Medical' on the pay stub. Allowed under § 4059(d)."
            value={deductions.parentAChildHealthInsurance}
            onChange={(val) => updateField("parentAChildHealthInsurance", val)}
            placeholder="e.g. 150"
          />

          <DeductionField
            icon={<PiggyBank size={16} />}
            label="Mandatory retirement contributions"
            tooltip="Contributions REQUIRED by the employer or union — not voluntary 401(k). Examples: CalPERS, CalSTRS. Voluntary contributions do NOT count. Allowed under § 4059(c)."
            value={deductions.parentARetirement}
            onChange={(val) => updateField("parentARetirement", val)}
            placeholder="e.g. 400"
          />

          <DeductionField
            icon={<Users size={16} />}
            label="Union dues"
            tooltip="Monthly union membership dues withheld from Parent A's paycheck. Only actual dues count — not initiation fees. Allowed under § 4059(c)."
            value={deductions.parentAUnionDues}
            onChange={(val) => updateField("parentAUnionDues", val)}
            placeholder="e.g. 50"
          />

          <DeductionField
            icon={<Home size={16} />}
            label="Mortgage interest & property taxes"
            tooltip="Monthly mortgage interest (not principal) plus property taxes on Parent A's current residence. Find on mortgage statement or Form 1098. Allowed under § 4059(f)."
            value={deductions.parentAMortgageInterest}
            onChange={(val) => updateField("parentAMortgageInterest", val)}
            placeholder="e.g. 1200"
          />
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Parent A — Total monthly deductions
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {formatCurrency(parentATotal)}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Subtracted from Parent A's gross income to estimate net
            disposable income under § 4059.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200" />

      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-500" />
          <h3 className="text-base font-bold text-slate-800">
            Parent B — Allowable Deductions
          </h3>
        </div>

        <div className="space-y-5">
          <DeductionField
            icon={<Heart size={16} />}
            label="Health insurance premiums"
            tooltip="The monthly amount withheld from Parent B's paycheck for their own health, vision, or dental insurance. Find on pay stub under 'Health Insurance' or 'Medical Deduction.' Allowed under § 4059(b)."
            value={deductions.parentBHealthInsurance}
            onChange={(val) => updateField("parentBHealthInsurance", val)}
            placeholder="e.g. 250"
          />

          <DeductionField
            icon={<Heart size={16} />}
            label="Children's health insurance premiums"
            tooltip="The monthly amount Parent B pays to cover the children on their health insurance. Sometimes labeled 'Dependent Coverage' on the pay stub. Allowed under § 4059(d)."
            value={deductions.parentBChildHealthInsurance}
            onChange={(val) => updateField("parentBChildHealthInsurance", val)}
            placeholder="e.g. 150"
          />

          <DeductionField
            icon={<PiggyBank size={16} />}
            label="Mandatory retirement contributions"
            tooltip="Contributions REQUIRED by the employer or union — not voluntary 401(k). Examples: CalPERS, CalSTRS. Voluntary contributions do NOT count. Allowed under § 4059(c)."
            value={deductions.parentBRetirement}
            onChange={(val) => updateField("parentBRetirement", val)}
            placeholder="e.g. 400"
          />

          <DeductionField
            icon={<Users size={16} />}
            label="Union dues"
            tooltip="Monthly union membership dues withheld from Parent B's paycheck. Only actual dues count — not initiation fees. Allowed under § 4059(c)."
            value={deductions.parentBUnionDues}
            onChange={(val) => updateField("parentBUnionDues", val)}
            placeholder="e.g. 50"
          />

          <DeductionField
            icon={<Home size={16} />}
            label="Mortgage interest & property taxes"
            tooltip="Monthly mortgage interest (not principal) plus property taxes on Parent B's current residence. Find on mortgage statement or Form 1098. Allowed under § 4059(f)."
            value={deductions.parentBMortgageInterest}
            onChange={(val) => updateField("parentBMortgageInterest", val)}
            placeholder="e.g. 1200"
          />
        </div>

        <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
            Parent B — Total monthly deductions
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-900">
            {formatCurrency(parentBTotal)}
          </p>
          <p className="mt-1 text-xs text-violet-700">
            Subtracted from Parent B's gross income to estimate net
            disposable income under § 4059.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-sm font-semibold text-emerald-800">
          Almost there — click "Next" to see your estimate.
        </p>
        <p className="mt-1 text-xs text-emerald-700">
          The next screen will apply the CA Family Code § 4055 formula
          (CS = K[HN − (H%)(TN)]) to the figures you've entered.
        </p>
      </div>
    </div>
  );
}

function num(val) {
  return Number(val) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function DeductionField({ icon, label, tooltip, value, onChange, placeholder }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <Tooltip text={tooltip} />
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          $
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

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
        <div className="absolute left-1/2 top-6 z-10 w-72 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
          {text}
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
        </div>
      )}
    </span>
  );
}