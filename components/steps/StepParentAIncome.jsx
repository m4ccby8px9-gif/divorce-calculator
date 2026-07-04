"use client";

import { Info, Briefcase, Building2, CircleDollarSign } from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// FREQUENCY CONVERSION HELPERS
// These turn whatever the user typed (at whatever pay frequency they picked)
// into a standardized MONTHLY figure, since that's the unit Family Code
// § 4055 requires (HN and TN are both "net monthly disposable income").
//
// Standard conversion factors:
//   Weekly    -> monthly: amount * 52 / 12  (52 paychecks/year)
//   Bi-weekly -> monthly: amount * 26 / 12  (26 paychecks/year)
//   Monthly   -> monthly: amount unchanged
// ---------------------------------------------------------------------------
export const FREQUENCIES = [
  { value: "weekly", label: "Weekly", multiplier: 52 / 12 },
  { value: "biweekly", label: "Bi-weekly", multiplier: 26 / 12 },
  { value: "monthly", label: "Monthly", multiplier: 1 },
];

export function toMonthlyAmount(rawAmount, frequency) {
  const amount = Number(rawAmount) || 0;
  const freq = FREQUENCIES.find((f) => f.value === frequency) || FREQUENCIES[2];
  return amount * freq.multiplier;
}

// ---------------------------------------------------------------------------
// StepParentAIncome
// Collects Parent A's income across 3 categories. Each field stores its raw
// typed amount + chosen frequency in formData.parentA, so toggling frequency
// never throws away what the user already typed.
//
// formData.parentA shape (set in CalculatorWizard's initialFormData):
//   {
//     monthlyGrossWages: "",      -> we'll actually store as { amount, frequency }
//     selfEmploymentIncome: "",
//     otherTaxableIncome: "",
//   }
// This component upgrades each of those fields to an { amount, frequency }
// object the first time the user types, via updateIncomeField below.
// ---------------------------------------------------------------------------
export default function StepParentAIncome({ formData, updateFormData }) {
  const parentA = formData.parentA;

  // Helper to update a single income field's amount or frequency, while
  // leaving the rest of formData.parentA (and formData as a whole) intact.
  const updateIncomeField = (fieldKey, changes) => {
    const currentField = normalizeField(parentA[fieldKey]);
    const updatedField = { ...currentField, ...changes };

    updateFormData({
      parentA: {
        ...parentA,
        [fieldKey]: updatedField,
      },
    });
  };

  const wages = normalizeField(parentA.monthlyGrossWages);
  const selfEmployment = normalizeField(parentA.selfEmploymentIncome);
  const otherIncome = normalizeField(parentA.otherTaxableIncome);

  const totalMonthlyIncome =
    toMonthlyAmount(wages.amount, wages.frequency) +
    toMonthlyAmount(selfEmployment.amount, selfEmployment.frequency) +
    toMonthlyAmount(otherIncome.amount, otherIncome.frequency);

  return (
    <div className="space-y-8">
      <IncomeField
        icon={<Briefcase size={18} />}
        label="Monthly gross wages"
        tooltip="Your gross pay BEFORE taxes and deductions are taken out — not your take-home pay. Find this on your pay stub, usually labeled 'Gross Pay' or 'Gross Earnings.' Under CA Family Code § 4058, this includes salary, hourly wages, bonuses, and commissions."
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
        tooltip="If you own a business or freelance, enter your net business income — gross receipts minus ordinary business expenses (Family Code § 4058(a)(2)). Check Schedule C of your tax return, or your most recent profit-and-loss statement, for this figure."
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

      {/* ------------------------------------------------------------ */}
      {/* LIVE TOTAL — gives immediate feedback that the conversions    */}
      {/* are working, and previews the monthly figure the formula     */}
      {/* will actually use later.                                     */}
      {/* ------------------------------------------------------------ */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Parent A — Estimated total monthly gross income
        </p>
        <p className="mt-1 text-2xl font-bold text-blue-900">
          {formatCurrency(totalMonthlyIncome)}
        </p>
        <p className="mt-1 text-xs text-blue-700">
          Automatically converted to a monthly figure based on the
          frequency selected for each field above.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// normalizeField
// Early on, formData.parentA.monthlyGrossWages etc. start as "" (a plain
// empty string) per CalculatorWizard's initialFormData. The first time a
// user interacts with this step, we want to treat each field as
// { amount, frequency }. This helper bridges both shapes safely so we never
// crash on `.amount` of a string.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// IncomeField
// One full row: icon + label + tooltip, a dollar input, and a 3-way
// frequency toggle (Weekly / Bi-weekly / Monthly). Shows the live converted
// monthly equivalent underneath whenever the chosen frequency isn't already
// "Monthly," so the user can see exactly what's happening to their number.
// ---------------------------------------------------------------------------
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
        {/* Dollar input */}
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
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Frequency toggle */}
        <FrequencyToggle
          value={field.frequency}
          onChange={onFrequencyChange}
        />
      </div>

      {showConversionHint && (
        <p className="mt-1.5 text-xs text-slate-500">
          ≈ {formatCurrency(monthlyEquivalent)} / month
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FrequencyToggle — segmented control for Weekly / Bi-weekly / Monthly
// ---------------------------------------------------------------------------
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
                ? "bg-blue-600 text-white shadow-sm"
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

// ---------------------------------------------------------------------------
// Tooltip — identical pattern to the one in StepFamily.jsx, duplicated here
// so each step file stays fully self-contained and easy to copy/paste or
// hand off. (If this gets repetitive across more steps later, we can move
// it into its own shared components/ui/Tooltip.jsx file.)
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
        <div className="absolute left-1/2 top-6 z-10 w-72 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
          {text}
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
        </div>
      )}
    </span>
  );
}
