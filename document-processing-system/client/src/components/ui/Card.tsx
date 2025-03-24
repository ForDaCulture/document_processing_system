interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

export function Card({ children, onClick, ...props }: CardProps) {
  return (
    <div
      {...props}
      onClick={onClick}
      className="p-4 border rounded-md shadow-md cursor-pointer hover:shadow-lg"
    >
      {children}
    </div>
  );
}