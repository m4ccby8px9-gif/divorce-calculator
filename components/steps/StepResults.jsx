"use client";

import { calculateChildSupport } from "../../lib/childSupportCalculator";
import { calculateTemporarySpousalSupport } from "../../lib/spousalSupportCalculator";
import { Scale, DollarSign, Calculator, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function StepResults({ formData, resetForm }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const result = calculateChildSupport(formData);
  const highEarnerNet = result.parentA.isHighEarner
    ? result.parentA.netDisposable
    : result.parentB.netDisposable;
  const lowEarnerNet = result.parentA.isHighEarner
    ? result.parentB.netDisposable
    : result.parentA.netDisposable;

  const spousalSupport = calculateTemporarySpousalSupport({
    highEarnerNet,
    lowEarnerNet,
    childSupport: result.childSupportAmount,
  });

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-700">
          <Scale size={20} />
          <p className="text-sm font-semibold uppercase tracking-wide">
            Estimated Monthly Child Support
          </p>
        </div>
        <p className="mt-3 text-5xl font-bold text-emerald-900">
          {formatCurrency(result.childSupportAmount)}
        </p>
        <p className="mt-3 text-sm text-emerald-700">
          <span className="font-semibold">{result.payorName}</span> pays{" "}
          <span className="font-semibold">{result.payeeName}</span> per month
        </p>
        <p className="mt-1 text-xs text-emerald-600">
          Based on CA Family Code § 4055 — CS = K[HN − (H%)(TN)]
        </p>
      </div>
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-indigo-700">
            <DollarSign size={20} />
            <p className="text-sm font-semibold uppercase tracking-wide">
              Estimated Temporary Spousal Support
            </p>
          </div>
          <p className="mt-3 text-5xl font-bold text-indigo-900">
            {formatCurrency(spousalSupport)}
          </p>
          <p className="mt-3 text-sm text-indigo-700">
            <span className="font-semibold">{result.payorName}</span> pays{" "}
            <span className="font-semibold">{result.payeeName}</span> per month
          </p>
          <p className="mt-1 text-xs text-indigo-600">
          Santa Clara guideline — 40% of the high earner net minus 50% of the low earner net, after child support
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">This is a temporary estimate only.</span>{" "}
            Temporary spousal support applies while a divorce is pending. Long-term
            support after judgment has no formula — a judge decides it using the
            factors in Family Code § 4320. Courts also vary by county and may use
            different guidelines. This tool is not legal advice.
          </p>
        </div>

      <div className="grid grid-cols-2 gap-4">
        <NetIncomeCard
          label="Parent A"
          color="blue"
          isHighEarner={result.parentA.isHighEarner}
          gross={result.parentA.grossMonthlyIncome}
          deductions={result.parentA.totalDeductions}
          tax={result.parentA.estimatedTax}
          net={result.parentA.netDisposable}
        />
        <NetIncomeCard
          label="Parent B"
          color="violet"
          isHighEarner={result.parentB.isHighEarner}
          gross={result.parentB.grossMonthlyIncome}
          deductions={result.parentB.totalDeductions}
          tax={result.parentB.estimatedTax}
          net={result.parentB.netDisposable}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              How this number was calculated
            </span>
          </div>
          {showBreakdown
            ? <ChevronUp size={16} className="text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />
          }
        </button>

        {showBreakdown && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-4 text-sm">

            <FormulaRow
              label="TN — Total net monthly disposable income"
              value={formatCurrency(result.formula.TN)}
              note={`Parent A (${formatCurrency(result.parentA.netDisposable)}) + Parent B (${formatCurrency(result.parentB.netDisposable)})`}
              statute="§ 4055(b)(1)(E)"
            />

            <FormulaRow
              label="HN — High earner's net monthly disposable income"
              value={formatCurrency(result.formula.HN)}
              note={`${result.parentA.isHighEarner ? "Parent A" : "Parent B"} has the higher net income`}
              statute="§ 4055(b)(1)(C)"
            />

            <FormulaRow
              label="H% — High earner's timeshare percentage"
              value={`${formData.highEarnerTimesharePercent}%`}
              note="Percentage of time the high earner has primary physical responsibility for the children"
              statute="§ 4055(b)(1)(D)"
            />

            <FormulaRow
              label="K — Income allocation factor"
              value={result.formula.K.toFixed(4)}
              note={`= (${formData.highEarnerTimesharePercent <= 50 ? "1 + H%" : "2 − H%"}) × income fraction from § 4055(b)(3) table`}
              statute="§ 4055(b)(3)"
            />

            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-700">
                Base CS = K × [HN − (H%)(TN)]
              </p>
              <p className="mt-1 text-slate-500">
                = {result.formula.K.toFixed(4)} × [{formatCurrency(result.formula.HN)} − ({formData.highEarnerTimesharePercent}% × {formatCurrency(result.formula.TN)})]
              </p>
              <p className="mt-1 text-slate-500">
                = {result.formula.K.toFixed(4)} × [{formatCurrency(result.formula.HN)} − {formatCurrency(result.formula.Hpercent * result.formula.TN)}]
              </p>
              <p className="mt-1 font-semibold text-slate-700">
                = {formatCurrency(Math.abs(result.formula.baseCS))}
              </p>
            </div>

            {result.formula.numberOfChildren > 1 && (
              <FormulaRow
                label={`Multi-child multiplier (${result.formula.numberOfChildren} children)`}
                value={`× ${result.formula.multiplier}`}
                note={`Base CS × ${result.formula.multiplier} = ${formatCurrency(result.childSupportAmount)}`}
                statute="§ 4055(b)(4)"
              />
            )}

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="font-bold text-emerald-800">
                Final CS = {formatCurrency(result.childSupportAmount)} / month
              </p>
            </div>
          </div>
        )}
      </div>
      <button type="button" onClick={resetForm} className="w-full rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600">Start Over — Run a New Calculation</button>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
            
              This is an estimate, not legal advice
            </p>
            <p className="mt-1 text-xs text-amber-700 leading-relaxed">
              This calculator applies the CA Family Code § 4055 guideline formula to
              the figures you entered. Actual court-ordered support may differ based
              on additional factors, judicial discretion, rebuttal factors under
              § 4057, or information not captured here. Tax estimates are
              approximations. Always consult a licensed California family law
              attorney before relying on this figure.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function NetIncomeCard({ label, color, isHighEarner, gross, deductions, tax, net }) {
  const borderColor = color === "blue" ? "border-blue-100" : "border-violet-100";
  const bgColor = color === "blue" ? "bg-blue-50" : "bg-violet-50";
  const textColor = color === "blue" ? "text-blue-900" : "text-violet-900";
  const labelColor = color === "blue" ? "text-blue-600" : "text-violet-600";
  const dotColor = color === "blue" ? "bg-blue-500" : "bg-violet-500";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} px-4 py-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <p className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
          {label}
          {isHighEarner && (
            <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-amber-700 normal-case tracking-normal">
              high earner
            </span>
          )}
        </p>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Gross income</span>
          <span className="font-medium text-slate-700">{formatCurrency(gross)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Deductions</span>
          <span className="font-medium text-slate-700">− {formatCurrency(deductions)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Est. taxes</span>
          <span className="font-medium text-slate-700">− {formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
          <span className={`font-semibold ${labelColor}`}>Net disposable</span>
          <span className={`font-bold ${textColor}`}>{formatCurrency(net)}</span>
        </div>
      </div>
    </div>
  );
}

function FormulaRow({ label, value, note, statute }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-medium text-slate-700">{label}</p>
        {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
        {statute && (
          <p className="mt-0.5 text-xs text-blue-500">{statute}</p>
        )}
      </div>
      <p className="shrink-0 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}