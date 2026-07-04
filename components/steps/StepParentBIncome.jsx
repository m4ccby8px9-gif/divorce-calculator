"use client";

import { Info, Briefcase, Building2, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { FREQUENCIES, toMonthlyAmount } from "./StepParentAIncome";

// ---------------------------------------------------------------------------
// StepParentBIncome
// Mirrors StepParentAIncome field-for-field, but reads/writes
// formData.parentB instead of formData.parentA.
//
// We import FREQUENCIES + toMonthlyAmount from StepParentAIncome.jsx rather
// than redefining them here, so the weekly/bi-weekly/monthly conversion
// math lives in exactly one place. If that math ever needs a fix (say, a
// different bi-weekly assumption), both Step 2 and Step 3 update together.
// ---------------------------------------------------------------------------
export default function StepParentBIncome({ formData, updateFormData }) {
  const parentB = formData.parentB;

  const updateIncomeField = (fieldKey, changes) => {
    const currentField = normalizeField(parentB[fieldKey]);
    const updatedField = { ...currentField, ...changes };

    updateFormData({
      parentB: {
        ...parentB,
        [fieldKey]: updatedField,
      },
    });
  };

  const wages = normalizeField(parentB.monthlyGrossWages);
  const selfEmployment = normalizeField(parentB.selfEmploymentIncome);
  const otherIncome = normalizeField(parentB.otherTaxableIncome);

  const totalMonthlyIncome =
    toMonthlyAmount(wages.amount, wages.frequency) +
    toMonthlyAmount(selfEmployment.amount, selfEmployment.frequency) +
    toMonthlyAmount(otherIncome.amount, otherIncome.frequency);

  return (
    <div className="space-y-8">
      <IncomeField
        icon={<Briefcase size={18} />}
        label="Monthly gross wages"
        tooltip="Gross pay BEFORE taxes and deductions — not take-home pay. Find this on Parent B's pay stub, usually labeled 'Gross Pay' or 'Gross Earnings.' Under CA Family Code § 4058, this includes salary, hourly wages, bonuses, and commissions."
        placeholder="e.g. 5000"
        field={wages}
        onAmountChange={(val) =>
          updateIncomeField("monthlyGrossWages", { amount: val })
        }
        onFrequencyChange={(val) =>
          updateIncomeField("monthlyGrossWages", { frequency: val })
        }
      />

      <IncomeField
        icon={<Building2 size={18} />}
        label="Self-employment income"
        tooltip="If Parent B owns a business or freelances, enter net business income — gross receipts minus ordinary business expenses (Family Code § 4058(a)(2)). Check Schedule C of their tax return, or a recent profit-and-loss statement."
        placeholder="e.g. 1200"
        field={selfEmployment}
        onAmountChange={(val) =>
          updateIncomeField("selfEmploymentIncome", { amount: val })
        }
        onFrequencyChange={(val) =>
          updateIncomeField("selfEmploymentIncome", { frequency: val })
        }
      />

      <IncomeField
        icon={<CircleDollarSign size={18} />}
        label="Other taxable income"
        tooltip="Any other income from § 4058(a)(1): commissions, bonuses, rental income, dividends, interest, pensions, or annuities. Do NOT include child support received or means-tested public assistance — those are excluded under § 4058(c)."
        placeholder="e.g. 300"
        field={otherIncome}
        onAmountChange={(val) =>
          updateIncomeField("otherTaxableIncome", { amount: val })
        }
        onFrequencyChange={(val) =>
          updateIncomeField("otherTaxableIncome", { frequency: val })
        }
      />

      <div className="rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
          Parent B — Estimated total monthly gross income
        </p>
        <p className="mt-1 text-2xl font-bold text-violet-900">
          {formatCurrency(totalMonthlyIncome)}
        </p>
        <p className="mt-1 text-xs text-violet-700">
          Automatically converted to a monthly figure based on the
          frequency selected for each field above.
        </p>
      </div>
    </div>
  );
}

// Same normalize/format helpers as Step 2 — small enough that duplicating
// them locally is simpler than sharing, and keeps this file self-contained.
function normalizeField(field) {
  if (field && typeof field === "object") {
    return {
      amount: field.amount ?? "",
      frequency: field.frequency ?? "monthly",
    };
  }
  return { amount: field ?? "", frequency: "monthly" };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function IncomeField({
  icon,
  label,
  tooltip,
  placeholder,
  field,
  onAmountChange,
  onFrequencyChange,
}) {
  const monthlyEquivalent = toMonthlyAmount(field.amount, field.frequency);
  const showConversionHint = field.frequency !== "monthly" && field.amount !== "";

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <Tooltip text={tooltip} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            $
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={field.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <FrequencyToggle value={field.frequency} onChange={onFrequencyChange} />
      </div>

      {showConversionHint && (
        <p className="mt-1.5 text-xs text-slate-500">
          ≈ {formatCurrency(monthlyEquivalent)} / month
        </p>
      )}
    </div>
  );
}

function FrequencyToggle({ value, onChange }) {
  return (
    <div className="flex shrink-0 rounded-lg border border-slate-300 bg-slate-50 p-1">
      {FREQUENCIES.map((freq) => {
        const isActive = value === freq.value;
        return (
          <button
            key={freq.value}
            type="button"
            onClick={() => onChange(freq.value)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {freq.label}
          </button>
        );
      })}
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
        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-violet-600"
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