import { useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { CalculatorInputs } from '../types';
import { useI18nStore } from '../stores/i18nStore';

const createFormSchema = (t: { nameRequired: string; mustBePositive: string }) =>
  z.object({
    scenarioName: z.string().min(1, t.nameRequired),
    initialInvestment: z.number().min(0, t.mustBePositive),
    monthlyContribution: z.number().min(0, t.mustBePositive),
    annualReturn: z.number().min(0).max(100),
    inflationRate: z.number().min(0).max(100),
    years: z.number().min(1).max(100),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface Props {
  onCalculate: (inputs: CalculatorInputs, name: string) => void;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

function NumberInput({ value, onChange, min = 0, max, step = 1, prefix, suffix }: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const increment = () => {
    const newValue = value + step;
    if (max === undefined || newValue <= max) {
      onChange(Math.round(newValue * 100) / 100);
    }
  };

  const decrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(Math.round(newValue * 100) / 100);
    }
  };

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Parse string back to number (remove commas)
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    return parseFloat(cleaned) || 0;
  };

  return (
    <div className="number-input">
      <button
        type="button"
        className="number-input-btn left"
        onClick={decrement}
        disabled={value <= min}
        tabIndex={-1}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
      {prefix && <span className="number-input-addon left">{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={isFocused ? value : formatNumber(value)}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="number-input-field"
      />
      {suffix && <span className="number-input-addon right">{suffix}</span>}
      <button
        type="button"
        className="number-input-btn right"
        onClick={increment}
        disabled={max !== undefined && value >= max}
        tabIndex={-1}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function CalculatorForm({ onCalculate }: Props) {
  const { t } = useI18nStore();

  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenarioName: '',
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      inflationRate: 3,
      years: 30,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const inputs: CalculatorInputs = {
      initialInvestment: values.initialInvestment,
      monthlyContribution: values.monthlyContribution,
      annualReturn: values.annualReturn,
      inflationRate: values.inflationRate,
      years: values.years,
    };
    onCalculate(inputs, values.scenarioName.trim());
    form.setValue('scenarioName', '');
  };

  const addRandomScenario = () => {
    const randomName = t.randomNames[Math.floor(Math.random() * t.randomNames.length)];
    const randomInvestment = Math.round((Math.random() * 90000 + 10000) / 1000) * 1000;
    const randomMonthly = Math.round((Math.random() * 1500 + 100) / 100) * 100;
    const randomReturn = Math.round((Math.random() * 12 + 3) * 10) / 10;
    const randomInflation = Math.round((Math.random() * 4 + 1) * 10) / 10;
    const randomYears = Math.floor(Math.random() * 35 + 5);

    const inputs: CalculatorInputs = {
      initialInvestment: randomInvestment,
      monthlyContribution: randomMonthly,
      annualReturn: randomReturn,
      inflationRate: randomInflation,
      years: randomYears,
    };
    onCalculate(inputs, `${randomName} ${t.currencySymbol}${randomInvestment.toLocaleString()}`);
  };

  const isDev = import.meta.env.DEV;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="calculator-form">
        <div className="form-fields">
          <FormField
            control={form.control}
            name="scenarioName"
            render={({ field }) => (
              <FormItem className="form-item form-item-name">
                <FormLabel className="form-label">
                  {t.scenarioName}
                  <span className="form-label-hint">{t.required}</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t.scenarioNamePlaceholder}
                    className="form-input"
                  />
                </FormControl>
                <FormMessage className="form-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialInvestment"
            render={({ field }) => (
              <FormItem className="form-item form-item-contribution">
                <FormLabel className="form-label">{t.initialInvestment}</FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    step={1000}
                    prefix={t.currencySymbol}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyContribution"
            render={({ field }) => (
              <FormItem className="form-item form-item-contribution">
                <FormLabel className="form-label">{t.monthlyContribution}</FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    step={100}
                    prefix={t.currencySymbol}
                    suffix={t.perMonth}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="annualReturn"
            render={({ field }) => (
              <FormItem className="form-item form-item-config">
                <FormLabel className="form-label">
                  {t.annualReturn}
                  <span className="form-label-hint">{t.expected}</span>
                </FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    max={100}
                    step={0.5}
                    suffix="%"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inflationRate"
            render={({ field }) => (
              <FormItem className="form-item form-item-config">
                <FormLabel className="form-label">
                  {t.inflationRate}
                  <span className="form-label-hint">{t.expected}</span>
                </FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    max={100}
                    step={0.5}
                    suffix="%"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="years"
            render={({ field }) => (
              <FormItem className="form-item form-item-config">
                <FormLabel className="form-label">{t.timeHorizon}</FormLabel>
                <FormControl>
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    min={1}
                    max={100}
                    step={1}
                    suffix={t.years}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="form-item form-submit">
            <div className="form-buttons">
              <Button type="submit" className="btn-add-scenario">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t.addScenario}
              </Button>
              {isDev && (
                <Button
                  type="button"
                  variant="outline"
                  className="btn-random"
                  onClick={addRandomScenario}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="8" height="8" rx="1" />
                    <rect x="14" y="2" width="8" height="8" rx="1" />
                    <rect x="2" y="14" width="8" height="8" rx="1" />
                    <rect x="14" y="14" width="8" height="8" rx="1" />
                    <circle cx="5" cy="5" r="1" fill="currentColor" />
                    <circle cx="19" cy="5" r="1" fill="currentColor" />
                    <circle cx="17" cy="7" r="1" fill="currentColor" />
                    <circle cx="5" cy="17" r="1" fill="currentColor" />
                    <circle cx="5" cy="19" r="1" fill="currentColor" />
                    <circle cx="17" cy="17" r="1" fill="currentColor" />
                    <circle cx="19" cy="19" r="1" fill="currentColor" />
                  </svg>
                  {t.random}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
