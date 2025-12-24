interface LogoProps {
  height?: number;
  color?: string;
}

const Logo = ({ height = 35, color = '#181D27' }: LogoProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={height} viewBox="0 0 44 44" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 22C13.9836 22 22 13.9836 22 0C22 13.9836 30.0164 22 44 22C30.0164 22 22 30.0164 22 44C22 30.0164 13.9836 22 0 22Z" fill={color}/>
    </svg>
  );
}

export default Logo;