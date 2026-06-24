'use server';

import { createClient } from '@/lib/supabase/server';

export async function getBalanceSummary() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type');

  if (error) {
    throw new Error(error.message);
  }

  const { totalIncome, totalExpense, savings } = (data || []).reduce(
    (acc, tx) => {
      if (tx.type === 'income') acc.totalIncome += tx.amount;
      else if (tx.type === 'expense') acc.totalExpense += tx.amount;
      acc.savings = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    {
      totalIncome: 0,
      totalExpense: 0,
      savings: 0,
    },
  );

  return {
    totalIncome,
    totalExpense,
    savings,
  };
}
