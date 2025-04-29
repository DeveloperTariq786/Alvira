const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'inline-block px-6 py-3 font-medium text-center transition-colors duration-200 rounded-full';
  
  const variants = {
    primary: 'bg-primary text-black hover:bg-primary/90',
    secondary: 'bg-secondary text-black hover:bg-secondary/90',
    outline: 'border border-primary text-black hover:bg-primary hover:text-white',
    white: 'bg-white text-black hover:bg-gray-100',
  };

  const buttonClass = `${baseStyle} ${variants[variant]} ${className}`;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button; 