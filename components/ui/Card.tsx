/**
 * Card.tsx - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility by re-exporting Container components.
 * New code should import from Container.tsx directly.
 * 
 * @deprecated Use Container.tsx directly
 */

export {
  Container as Card,
  ContainerHeader as CardHeader,
  ContainerTitle as CardTitle,
  ContainerDescription as CardDescription,
  ContainerContent as CardContent,
  ContainerFooter as CardFooter,
  ContainerGrid as CardGrid,
  type CardProps
} from './Container';

export { Container as default } from './Container';