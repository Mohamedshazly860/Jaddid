// src/components/ui/alert.jsx (Alternative without class-variance-authority)
import * as React from "react";

const alertVariants = {
  default: "bg-background text-foreground border-gray-200",
  destructive: "border-red-500/50 text-red-600 bg-red-50 dark:border-red-500",
};

const Alert = React.forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = alertVariants[variant] || alertVariants.default;

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses} ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={`mb-1 font-medium leading-none tracking-tight ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </h5>
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm [&_p]:leading-relaxed ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
