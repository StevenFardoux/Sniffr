import React from 'react';
import './Button.scss';

/**
 * Button component props extending native HTML button attributes
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    
}

/**
 * Custom Button component that wraps HTML button with additional styling capabilities
 * @param props - Button props extending HTML button attributes
 * @returns {JSX.Element} Button element with children
 */
const Button: React.FC<ButtonProps> = (props) => {
    const { className, children, ...rest } = props;
    return <button {...rest} className={`std-btn${className ? ' ' + className : ''}`}>{children}</button>;
}

export default Button;