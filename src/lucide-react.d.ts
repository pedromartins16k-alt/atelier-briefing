declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';
  type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const CircleAlert: ComponentType<IconProps>;
  export const CircleCheck: ComponentType<IconProps>;
  export const Compass: ComponentType<IconProps>;
  export const Layers3: ComponentType<IconProps>;
  export const Sparkles: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
}
