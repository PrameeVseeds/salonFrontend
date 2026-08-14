import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: ReactNode;
    endAdornment?: ReactNode;
}

const FormField = ({ label, icon, endAdornment, id, ...inputProps }: FormFieldProps) => (
    <div className="form-field">
        <label htmlFor={id}>{label}</label>
        <div className="form-field__control">
            <span className="form-field__icon" aria-hidden="true">{icon}</span>
            <input id={id} {...inputProps} />
            {endAdornment}
        </div>
    </div>
);

export default FormField;
