import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
<<<<<<< HEAD
      position="bottom-center"
      duration={2000}
      offset="84px"
      className="toaster group"
      toastOptions={{
        duration: 2000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-glass group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3 text-sm font-medium",
=======
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
