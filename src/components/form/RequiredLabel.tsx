import { Asterisk } from "lucide-react";
import type { ReactNode } from "react";

interface RequiredLabelProps {
  children: ReactNode;
  className?: string;
}

const RequiredLabel = ({ children, className }: RequiredLabelProps) => (
  <span className={className}>
    {children}
    <Asterisk aria-label="required" />
  </span>
);

export default RequiredLabel;
