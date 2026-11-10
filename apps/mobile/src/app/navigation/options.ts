// Common navigation options for consistent styling
import { Colors, Typography } from '@/shared/constants';

// Default header style for all stacks
export const defaultStackScreenOptions = {
    headerStyle: {
        backgroundColor: Colors.neutral.white,
    },
    headerTitleAlign: 'left' as const, // Tells TypeScript that 'left' is exactly 'left', not just a string
    headerTitleStyle: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false, // Hides the "Back" text on iOS (only keeps the arrow)
};

// Header with transparent background (for screens with custom headers)
export const transparentHeaderOptions = {
    headerTransparent: true,
    headerTitle: '',
    headerShadowVisible: true,
};