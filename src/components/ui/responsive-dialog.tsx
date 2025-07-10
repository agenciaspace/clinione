import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

const ResponsiveDialog = DialogPrimitive.Root

const ResponsiveDialogTrigger = DialogPrimitive.Trigger

const ResponsiveDialogPortal = DialogPrimitive.Portal

const ResponsiveDialogClose = DialogPrimitive.Close

const ResponsiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ResponsiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface ResponsiveDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResponsiveDialogContentProps
>(({ className, children, size = 'md', ...props }, ref) => {
  const isMobile = useIsMobile()
  
  const getSizeClasses = () => {
    if (isMobile) {
      return "w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] m-4"
    }
    
    switch (size) {
      case 'sm':
        return "w-[90vw] max-w-md"
      case 'md':
        return "w-[90vw] max-w-lg"
      case 'lg':
        return "w-[90vw] max-w-2xl"
      case 'xl':
        return "w-[95vw] max-w-4xl h-[90vh] max-h-[90vh]"
      case 'full':
        return "w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh]"
      default:
        return "w-[90vw] max-w-lg"
    }
  }

  return (
    <ResponsiveDialogPortal>
      <ResponsiveDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[100] grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          isMobile ? "rounded-lg p-4 overflow-y-auto" : "p-6",
          getSizeClasses(),
          className
        )}
        {...props}
      >
        <div className={cn("flex flex-col", isMobile ? "h-full" : "max-h-[80vh]")}>
          <div className={cn("flex-1", isMobile ? "overflow-y-auto" : "overflow-y-auto")}>
            {children}
          </div>
        </div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ResponsiveDialogPortal>
  )
})
ResponsiveDialogContent.displayName = DialogPrimitive.Content.displayName

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        isMobile ? "pb-4" : "pb-2",
        className
      )}
      {...props}
    />
  )
}
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader"

const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      className={cn(
        "flex",
        isMobile ? "flex-col space-y-2 pt-4" : "flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter"

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
ResponsiveDialogTitle.displayName = DialogPrimitive.Title.displayName

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ResponsiveDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  ResponsiveDialog,
  ResponsiveDialogPortal,
  ResponsiveDialogOverlay,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
}