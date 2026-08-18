import { Asterisk } from "lucide-react";
import type { ReactNode } from "react";

interface RequiredFieldLabelProps {
  children: ReactNode;
  className?: string;
}

const RequiredFieldLabel = ({children, className}: RequiredFieldLabelProps) => (
  <span className={className}>
    {children}
    <Asterisk aria-label="required" />
  </span>
);

export default RequiredFieldLabel;
