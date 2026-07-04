// ---------------------------------------------------------------------------
// lib/childSupportCalculator.js
// California Child Support Guideline Calculator
// Implements CA Family Code §§ 4055, 4058, 4059
//
// Formula: CS = K[HN - (H%)(TN)]
// ---------------------------------------------------------------------------

const CHILD_MULTIPLIERS = {
    1: 1.0,
    2: 1.6,
    3: 2.0,
    4: 2.3,
    5: 2.5,
    6: 2.625,
    7: 2.75,
    8: 2.813,
    9: 2.844,
    10: 2.86,
  };
  
  function calculateKFraction(TN) {
    if (TN <= 0) return 0.165;
    if (TN <= 2900) return 0.165 + TN / 82857;
    if (TN <= 5000) return 0.131 + TN / 42149;
    if (TN <= 10000) return 0.250;
    if (TN <= 15000) return 0.10 + 1499 / TN;
    return 0.12 + 1200 / TN;
  }
  
  function calculateK(Hpercent, TN) {
    const fraction = calculateKFraction(TN);
    const multiplier = Hpercent <= 0.5 ? (1 + Hpercent) : (2 - Hpercent);
    return multiplier * fraction;
  }
  
  function estimateMonthlyTax(monthlyGrossIncome, filingStatus) {
    const annualIncome = monthlyGrossIncome * 12;
    if (annualIncome <= 0) return 0;
  
    let federalTax = 0;
    if (filingStatus === "married_filing_jointly") {
      if (annualIncome <= 23200) federalTax = annualIncome * 0.10;
      else if (annualIncome <= 94300) federalTax = 2320 + (annualIncome - 23200) * 0.12;
      else if (annualIncome <= 201050) federalTax = 10294 + (annualIncome - 94300) * 0.22;
      else if (annualIncome <= 383900) federalTax = 33807 + (annualIncome - 201050) * 0.24;
      else if (annualIncome <= 487450) federalTax = 77891 + (annualIncome - 383900) * 0.32;
      else if (annualIncome <= 731200) federalTax = 111099 + (annualIncome - 487450) * 0.35;
      else federalTax = 196669 + (annualIncome - 731200) * 0.37;
    } else if (filingStatus === "head_of_household") {
      if (annualIncome <= 16550) federalTax = annualIncome * 0.10;
      else if (annualIncome <= 63100) federalTax = 1655 + (annualIncome - 16550) * 0.12;
      else if (annualIncome <= 100500) federalTax = 7241 + (annualIncome - 63100) * 0.22;
      else if (annualIncome <= 191950) federalTax = 15469 + (annualIncome - 100500) * 0.24;
      else if (annualIncome <= 243700) federalTax = 37417 + (annualIncome - 191950) * 0.32;
      else if (annualIncome <= 609350) federalTax = 53977 + (annualIncome - 243700) * 0.35;
      else federalTax = 181954 + (annualIncome - 609350) * 0.37;
    } else {
      if (annualIncome <= 11600) federalTax = annualIncome * 0.10;
      else if (annualIncome <= 47150) federalTax = 1160 + (annualIncome - 11600) * 0.12;
      else if (annualIncome <= 100525) federalTax = 5426 + (annualIncome - 47150) * 0.22;
      else if (annualIncome <= 191950) federalTax = 17168 + (annualIncome - 100525) * 0.24;
      else if (annualIncome <= 243725) federalTax = 39110 + (annualIncome - 191950) * 0.32;
      else if (annualIncome <= 609350) federalTax = 55678 + (annualIncome - 243725) * 0.35;
      else federalTax = 183647 + (annualIncome - 609350) * 0.37;
    }
  
    let stateTax = 0;
    if (annualIncome <= 10412) stateTax = annualIncome * 0.01;
    else if (annualIncome <= 24684) stateTax = 104 + (annualIncome - 10412) * 0.02;
    else if (annualIncome <= 38959) stateTax = 390 + (annualIncome - 24684) * 0.04;
    else if (annualIncome <= 54081) stateTax = 961 + (annualIncome - 38959) * 0.06;
    else if (annualIncome <= 68350) stateTax = 1868 + (annualIncome - 54081) * 0.08;
    else if (annualIncome <= 349137) stateTax = 3009 + (annualIncome - 68350) * 0.093;
    else if (annualIncome <= 418961) stateTax = 29122 + (annualIncome - 349137) * 0.103;
    else if (annualIncome <= 698271) stateTax = 36314 + (annualIncome - 418961) * 0.113;
    else stateTax = 67869 + (annualIncome - 698271) * 0.123;
  
    const sdi = annualIncome * 0.009;
    const socialSecurity = Math.min(annualIncome, 168600) * 0.062;
    const medicare = annualIncome * 0.0145;
  
    const totalAnnualTax = federalTax + stateTax + sdi + socialSecurity + medicare;
    return totalAnnualTax / 12;
  }
  
  function calculateNetDisposableIncome(grossMonthlyIncome, deductions, filingStatus) {
    const totalDeductions =
      (Number(deductions.healthInsurance) || 0) +
      (Number(deductions.childHealthInsurance) || 0) +
      (Number(deductions.retirement) || 0) +
      (Number(deductions.unionDues) || 0) +
      (Number(deductions.mortgageInterest) || 0);
  
    const adjustedGross = Math.max(0, grossMonthlyIncome - totalDeductions);
    const estimatedTax = estimateMonthlyTax(adjustedGross, filingStatus);
    const netDisposable = Math.max(0, adjustedGross - estimatedTax);
  
    return {
      grossMonthlyIncome,
      totalDeductions,
      adjustedGross,
      estimatedTax,
      netDisposable,
    };
  }
  
  function toMonthlyAmount(field) {
    if (!field || field === "") return 0;
    if (typeof field === "object") {
      const amount = Number(field.amount) || 0;
      const freq = field.frequency || "monthly";
      if (freq === "weekly") return amount * 52 / 12;
      if (freq === "biweekly") return amount * 26 / 12;
      return amount;
    }
    return Number(field) || 0;
  }
  
  export function calculateChildSupport(formData) {
    const {
      numberOfChildren,
      parentAFilingStatus,
      parentBFilingStatus,
      highEarnerTimesharePercent,
      parentA,
      parentB,
      deductions,
    } = formData;
  
    const parentAGross =
      toMonthlyAmount(parentA.monthlyGrossWages) +
      toMonthlyAmount(parentA.selfEmploymentIncome) +
      toMonthlyAmount(parentA.otherTaxableIncome);
  
    const parentBGross =
      toMonthlyAmount(parentB.monthlyGrossWages) +
      toMonthlyAmount(parentB.selfEmploymentIncome) +
      toMonthlyAmount(parentB.otherTaxableIncome);
  
    const parentADeductions = {
      healthInsurance: deductions.parentAHealthInsurance,
      childHealthInsurance: deductions.parentAChildHealthInsurance,
      retirement: deductions.parentARetirement,
      unionDues: deductions.parentAUnionDues,
      mortgageInterest: deductions.parentAMortgageInterest,
    };
  
    const parentBDeductions = {
      healthInsurance: deductions.parentBHealthInsurance,
      childHealthInsurance: deductions.parentBChildHealthInsurance,
      retirement: deductions.parentBRetirement,
      unionDues: deductions.parentBUnionDues,
      mortgageInterest: deductions.parentBMortgageInterest,
    };
  
    const parentANet = calculateNetDisposableIncome(
      parentAGross,
      parentADeductions,
      parentAFilingStatus
    );
  
    const parentBNet = calculateNetDisposableIncome(
      parentBGross,
      parentBDeductions,
      parentBFilingStatus
    );
  
    const parentAIsHighEarner = parentANet.netDisposable >= parentBNet.netDisposable;
  
    const HN = parentAIsHighEarner
      ? parentANet.netDisposable
      : parentBNet.netDisposable;
  
    const TN = parentANet.netDisposable + parentBNet.netDisposable;
    const Hpercent = highEarnerTimesharePercent / 100;
    const K = calculateK(Hpercent, TN);
    const baseCS = K * (HN - Hpercent * TN);
  
    const numChildren = Math.min(Math.max(1, numberOfChildren), 10);
    const multiplier = CHILD_MULTIPLIERS[numChildren] || 1.0;
    const finalCS = baseCS * multiplier;
  
    const childSupportAmount = Math.abs(finalCS);
    const highEarnerPays = finalCS >= 0;
  
    return {
      childSupportAmount,
      highEarnerPays,
      payorName: highEarnerPays
        ? (parentAIsHighEarner ? "Parent A" : "Parent B")
        : (parentAIsHighEarner ? "Parent B" : "Parent A"),
      payeeName: highEarnerPays
        ? (parentAIsHighEarner ? "Parent B" : "Parent A")
        : (parentAIsHighEarner ? "Parent A" : "Parent B"),
      formula: {
        K,
        HN,
        Hpercent,
        TN,
        baseCS,
        multiplier,
        numberOfChildren: numChildren,
      },
      parentA: {
        ...parentANet,
        isHighEarner: parentAIsHighEarner,
        label: "Parent A",
      },
      parentB: {
        ...parentBNet,
        isHighEarner: !parentAIsHighEarner,
        label: "Parent B",
      },
    };
  }