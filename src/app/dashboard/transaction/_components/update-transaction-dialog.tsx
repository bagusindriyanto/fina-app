import { Transaction } from '@/app/types/transaction';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateTransaction } from '@/features/transaction/action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

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

  const onSubmit = (data: FormSchema) => {
    mutate({
      id: String(selectedTransaction?.data.id),
      data,
    });
  };

  return (
    <Dialog
      open={!!selectedTransaction && selectedTransaction.action === 'update'}
      onOpenChange={() => setSelectedTransaction(null)}
    >
      <DialogContent className="gap-4">
        <DialogHeader className="gap-4">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            transaction from the database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setSelectedTransaction(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!!selectedTransaction) mutate(selectedTransaction.data.id);
            }}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
