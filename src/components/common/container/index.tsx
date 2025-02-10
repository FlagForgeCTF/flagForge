import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
    children: ReactNode
    className?:string
}

const Container = ({ children, className }: Props) => {
    return (
        <div className={clsx("max-w-screen-2xl mx-auto px-6 rounded-lg", className)}>
            {children}
        </div>
    );
}

export default Container;
