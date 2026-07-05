import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DatePicker from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { createTransaction } from '@/features/transaction/action';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import FileDropzoneInput from '../../_components/file-dropzone-input';
import { CATEGORIES } from '@/constants/transaction-constant';

const typeItems = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  type: z.enum(['income', 'expense'], {
    error: 'Type is required',
  }),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
});

type FormSchema = z.infer<typeof formSchema>;

export default function CreateTransactionCard({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      type: 'income',
      category: '',
      date: '',
      description: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) => {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      return createTransaction(formattedData);
    },
    onSuccess: () => {
      form.reset();
      refetch();
      toast.success('Transaction created successfully!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create transaction',
      );
    },
  });

  function onSubmit(data: FormSchema) {
    mutate(data);
  }

  return (
    <Card className="gap-2 w-full h-fit">
      <CardHeader className="gap-0">
        <CardTitle>Create Transaction</CardTitle>
        <CardDescription>Add a new financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <FileDropzoneInput setValues={form.setValues} refetch={refetch} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-3">
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-create-amount">Amount</FieldLabel>
                  <Input
                    {...field}
                    id="form-create-amount"
                    aria-invalid={fieldState.invalid}
                    placeholder="0,00"
                    autoComplete="off"
                    type="number"
                    min="0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-create-type">Type</FieldLabel>
                  <Select
                    name={field.name}
                    items={typeItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-create-type"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {typeItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-create-category">
                    Category
                  </FieldLabel>
                  <Select
                    name={field.name}
                    // items={categoryItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-create-category"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-create-date">Date</FieldLabel>
                  <DatePicker
                    id="form-create-date"
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) =>
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-create-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="form-create-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter description"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button size="lg" type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Transaction'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
