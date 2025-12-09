import { useForm } from 'react-hook-form';
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
} from '@/components/ui/form';
import type { CalculatorInputs } from '../types';

const formSchema = z.object({
  scenarioName: z.string().optional(),
  initialInvestment: z.coerce.number().min(0, 'Must be positive'),
  annualReturn: z.coerce.number().min(0).max(100),
  inflationRate: z.coerce.number().min(0).max(100),
  years: z.coerce.number().min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onCalculate: (inputs: CalculatorInputs, name: string) => void;
}

export function CalculatorForm({ onCalculate }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenarioName: '',
      initialInvestment: 10000,
      annualReturn: 7,
      inflationRate: 3,
      years: 30,
    },
  });

  const onSubmit = (values: FormValues) => {
    const inputs: CalculatorInputs = {
      initialInvestment: values.initialInvestment,
      annualReturn: values.annualReturn,
      inflationRate: values.inflationRate,
      years: values.years,
    };
    const name = values.scenarioName?.trim() || `$${inputs.initialInvestment.toLocaleString()} @ ${inputs.annualReturn}%`;
    onCalculate(inputs, name);
    form.setValue('scenarioName', '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="calculator-form">
        <div className="form-fields">
          <FormField
            control={form.control}
            name="scenarioName"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="form-label">
                  Scenario Name
                  <span className="form-label-hint">optional</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Conservative Portfolio"
                    className="form-input"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialInvestment"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="form-label">Initial Investment</FormLabel>
                <FormControl>
                  <div className="input-with-addon">
                    <span className="input-addon left">$</span>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="any"
                      className="form-input with-left-addon"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="annualReturn"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="form-label">
                  Annual Return
                  <span className="form-label-hint">expected</span>
                </FormLabel>
                <FormControl>
                  <div className="input-with-addon">
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="form-input with-right-addon"
                    />
                    <span className="input-addon right">%</span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inflationRate"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="form-label">
                  Inflation Rate
                  <span className="form-label-hint">expected</span>
                </FormLabel>
                <FormControl>
                  <div className="input-with-addon">
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="form-input with-right-addon"
                    />
                    <span className="input-addon right">%</span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="years"
            render={({ field }) => (
              <FormItem className="form-item">
                <FormLabel className="form-label">Time Horizon</FormLabel>
                <FormControl>
                  <div className="input-with-addon">
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="100"
                      className="form-input with-right-addon"
                    />
                    <span className="input-addon right">yrs</span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="form-item form-submit">
            <Button type="submit" className="btn-add-scenario">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Scenario
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
