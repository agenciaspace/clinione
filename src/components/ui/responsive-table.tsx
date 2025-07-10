import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const ResponsiveTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <div className={cn("relative w-full", isMobile ? "overflow-x-auto" : "")}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          isMobile ? "min-w-[640px]" : "",
          className
        )}
        {...props}
      />
    </div>
  )
})
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
ResponsiveTableHeader.displayName = "ResponsiveTableHeader"

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
ResponsiveTableBody.displayName = "ResponsiveTableBody"

const ResponsiveTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
ResponsiveTableFooter.displayName = "ResponsiveTableFooter"

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        isMobile ? "text-xs" : "",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableRow.displayName = "ResponsiveTableRow"

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        isMobile ? "px-2 text-xs" : "",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableHead.displayName = "ResponsiveTableHead"

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        isMobile ? "p-2 text-xs" : "",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableCell.displayName = "ResponsiveTableCell"

const ResponsiveTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
ResponsiveTableCaption.displayName = "ResponsiveTableCaption"

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableFooter,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableCaption,
}