import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconProps: IconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

export const LockIcon = (props: IconProps) => (
    <svg {...iconProps} {...props}><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>
);

export const UserIcon = (props: IconProps) => (
    <svg {...iconProps} {...props}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>
);

export const EyeIcon = (props: IconProps) => (
    <svg {...iconProps} {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
);

export const EyeOffIcon = (props: IconProps) => (
    <svg {...iconProps} {...props}><path d="m3 3 18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"/><path d="M10.2 10.2a2.5 2.5 0 0 0 3.6 3.6"/></svg>
);

export const SignInIcon = (props: IconProps) => (
    <svg {...iconProps} {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/></svg>
);
