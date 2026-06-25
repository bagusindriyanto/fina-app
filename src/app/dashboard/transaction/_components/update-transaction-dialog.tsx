import { Transaction } from '@/app/types/transaction';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { updateTransaction } from '@/features/transaction/action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const typeItems = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

const categoryItems = [
  { label: 'Food & Drink', value: 'Food & Drink' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Entertaiment', value: 'Entertaiment' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Housing', value: 'Housing' },
  { label: 'Salary', value: 'Salary' },
  { label: 'Others', value: 'Others' },
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

export default function UpdateTransactionDialog({
  selectedTransaction,
  setSelectedTransaction,
  refetch,
}: {
  selectedTransaction: {
    data: Omit<Transaction, 'user_id' | 'embedding'>;
    action: 'update' | 'delete';
  } | null;
  setSelectedTransaction: Dispatch<
    SetStateAction<{
      data: Omit<Transaction, 'user_id' | 'embedding'>;
      action: 'update' | 'delete';
    } | null>
  >;
  refetch: () => void;
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: selectedTransaction
        ? String(selectedTransaction.data.amount)
        : '',
      type: selectedTransaction ? selectedTransaction.data.type : 'income',
      category: selectedTransaction ? selectedTransaction.data.category : '',
      date: selectedTransaction ? String(selectedTransaction.data.date) : '',
      description: selectedTransaction
        ? selectedTransaction.data.description
        : '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormSchema }) => {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      return updateTransaction(id, formattedData);
    },
    onSuccess: () => {
      setSelectedTransaction(null);
      refetch();
      form.reset();
      toast.success('Transaction updated successfully!');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update transaction',
      );
    },
  });

  useEffect(() => {
    if (selectedTransaction) {
      form.reset({
        amount: String(selectedTransaction.data.amount),
        type: selectedTransaction.data.type,
        category: selectedTransaction.data.category,
        date: String(selectedTransaction.data.date),
        description: selectedTransaction.data.description,
      });
    }
  }, [selectedTransaction, form]);

  function onSubmit(data: FormSchema) {
    mutate({
      id: String(selectedTransaction?.data.id),
      data,
    });
  }

  return (
    <Dialog
      open={!!selectedTransaction && selectedTransaction.action === 'update'}
      onOpenChange={() => setSelectedTransaction(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction data below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="form-update-transaction"
        >
          <FieldGroup className="gap-3">
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-update-amount">Amount</FieldLabel>
                  <Input
                    {...field}
                    id="form-update-amount"
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
                  <FieldLabel htmlFor="form-update-type">Type</FieldLabel>
                  <Select
                    name={field.name}
                    items={typeItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-update-type"
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
                  <FieldLabel htmlFor="form-update-category">
                    Category
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={categoryItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-update-category"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryItems.map((item) => (
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
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-update-date">Date</FieldLabel>
                  <DatePicker
                    id="form-update-date"
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
                  <FieldLabel htmlFor="form-update-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="form-update-description"
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
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setSelectedTransaction(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            form="form-update-transaction"
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? 'Updating...' : 'Update Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
