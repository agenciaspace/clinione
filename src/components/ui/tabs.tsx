import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const Tabs = TabsPrimitive.Root

const TabsListWithMobileSupport = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    showScrollButtons?: boolean
  }
>(({ className, showScrollButtons = false, ...props }, ref) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = 150
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  
  const baseClass = "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
  
  return (
    <div className={cn("relative", showScrollButtons && isMobile ? "px-8" : "")}>
      {showScrollButtons && isMobile && (
        <button 
          type="button"
          onClick={() => scroll('left')} 
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-muted/50 text-muted-foreground"
          aria-label="Scroll left"
        >
          ◀
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className={cn("overflow-x-auto scrollbar-none", showScrollButtons && "px-2")}
      >
        <TabsPrimitive.List
          ref={ref}
          className={cn(baseClass, isMobile ? "w-max" : "", className)}
          {...props}
        />
      </div>
      
      {showScrollButtons && isMobile && (
        <button 
          type="button"
          onClick={() => scroll('right')} 
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-muted/50 text-muted-foreground"
          aria-label="Scroll right"
        >
          ▶
        </button>
      )}
    </div>
  )
})
TabsListWithMobileSupport.displayName = "TabsListWithMobileSupport"

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsListWithMobileSupport, TabsTrigger, TabsContent }
