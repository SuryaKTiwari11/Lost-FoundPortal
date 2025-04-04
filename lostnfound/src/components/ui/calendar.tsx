"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Define this outside component to prevent recreation
const defaultClassNames = {
  months: "flex flex-col sm:flex-row gap-2",
  month: "flex flex-col gap-4",
  caption: "flex justify-center pt-1 relative items-center w-full",
  caption_label: "text-sm font-medium",
  nav: "flex items-center gap-1",
  nav_button: cn(
    buttonVariants({ variant: "outline" }),
    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
  ),
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse space-x-1",
  head_row: "flex",
  head_cell: "text-gray-400 rounded-md w-8 font-normal text-[0.8rem]",
  row: "flex w-full mt-2",
  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
  day: cn(
    buttonVariants({ variant: "ghost" }),
    "size-8 p-0 font-normal aria-selected:opacity-100"
  ),
  day_selected:
    "bg-[#FFD166] text-[#121212] hover:bg-[#FFD166] hover:text-[#121212]",
  day_today: "bg-[#333] text-white",
  day_outside: "text-gray-600 opacity-50",
  day_disabled: "text-gray-600 opacity-50",
  day_hidden: "invisible",
};

// Memoize Icon components to prevent recreation
const IconLeft = React.memo(
  ({ className, ...props }: { className?: string }) => (
    <ChevronLeft className={cn("size-4", className)} {...props} />
  )
);
IconLeft.displayName = "IconLeft";

const IconRight = React.memo(
  ({ className, ...props }: { className?: string }) => (
    <ChevronRight className={cn("size-4", className)} {...props} />
  )
);
IconRight.displayName = "IconRight";

const Calendar = React.memo(function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  // Merge default classNames with provided classNames
  const mergedClassNames = React.useMemo(() => {
    return { ...defaultClassNames, ...classNames };
  }, [classNames]);

  // Memoize components object
  const components = React.useMemo(
    () => ({
      IconLeft,
      IconRight,
    }),
    []
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={mergedClassNames}
      components={components}
      {...props}
    />
  );
});

Calendar.displayName = "Calendar";

export { Calendar };
