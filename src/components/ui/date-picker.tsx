'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function DatePicker({
  id,
  value,
  onChange,
}: {
  id?: string;
  value?: Date;
  onChange?: (date: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            id={id}
            data-empty={!value}
            className="justify-start bg-input/50 text-left font-normal data-[empty=true]:text-muted-foreground"
          />
        }
      >
        <CalendarIcon />
        {value ? format(value, 'M/d/yyyy') : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar required mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
