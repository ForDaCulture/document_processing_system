interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive";
}

export function Button({ variant = "default", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md ${variant === "default" ? "bg-blue-500 text-white hover:bg-blue-600" :
        variant === "outline" ? "border border-blue-500 text-blue-500 hover:bg-blue-100" :
          "bg-red-500 text-white hover:bg-red-600"}`}
    />
  );
}