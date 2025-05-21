
/**
 * Reexports useToast and toast from the hooks folder
 * 
 * This is to maintain backward compatibility with existing code
 * while following the shadcn convention of moving use-toast to hooks
 */
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
