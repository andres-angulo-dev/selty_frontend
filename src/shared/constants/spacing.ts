// Base unit for spacing (8px grid system) standar in UI design  
const BASE_UNIT = 8;

// Spacing scale (multiples of 8)                                                                                                 
export const Spacing = {                                                                                                          
  none: 0,                                                                                                                        
  xs: BASE_UNIT * 0.5,    // 4px  - Tiny gaps                                                                                     
  sm: BASE_UNIT,          // 8px  - Small gaps                                                                                    
  md: BASE_UNIT * 2,      // 16px - Default padding                                                                               
  lg: BASE_UNIT * 3,      // 24px - Section spacing                                                                               
  xl: BASE_UNIT * 4,      // 32px - Large sections                                                                                
  xxl: BASE_UNIT * 5,     // 40px - Screen padding top/bottom                                                                     
  xxxl: BASE_UNIT * 6,    // 48px - Hero sections                                                                                 
} as const;                                                                                                                       
                                                                                                                                  
// Border radius values                                                                                                           
export const BorderRadius = {                                                                                                     
  none: 0,                                                                                                                        
  sm: 4,         // Subtle rounding                                                                                               
  md: 8,         // Buttons, inputs                                                                                               
  lg: 12,        // Cards                                                                                                         
  xl: 16,        // Large cards, modals                                                                                           
  full: 9999,    // Circular (pills, avatars)                                                                                     
} as const;                                                                                                                       
                                                                                                                                  
// Common layout values                                                                                                           
export const Layout = {                                                                                                           
  screenPaddingHorizontal: Spacing.md,   // 16px                                                                                  
  screenPaddingVertical: Spacing.lg,     // 24px                                                                                  
  cardPadding: Spacing.md,               // 16px                                                                                  
  inputHeight: 48,                        // Standard input height                                                                
  buttonHeight: 48,                       // Standard button height                                                               
  buttonHeightSmall: 36,                  // Small button height                                                                  
  iconSize: 24,                           // Default icon size                                                                    
  iconSizeSmall: 20,                      // Small icon size                                                                      
  avatarSize: 48,                         // Default avatar size                                                                  
  avatarSizeLarge: 80,                    // Large avatar (profile)                                                               
} as const; 