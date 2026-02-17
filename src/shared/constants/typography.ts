import { TextStyle } from 'react-native';

// Font family constants
export const FontFamily = {
    regular: 'System',
    medium: 'Sytem',
    bodl: 'Sytem',
} as const;

// Font size scale
export const FontSize = {
    xxs: 10,      // Extra small labels, captions                                                                                          
    xs: 12,      // Small labels, captions                                                                                          
    sm: 14,      // Secondary text, buttons                                                                                         
    md: 16,      // Body text (default)                                                                                             
    lg: 18,      // Subtitles                                                                                                       
    xl: 20,      // Section titles                                                                                                  
    xxl: 24,     // Screen titles                                                                                                   
    xxxl: 32,    // Hero text                                                                                                       
} as const;   

  // Line height multipliers                                                                                                        
  export const LineHeight = {                                                                                                       
    tight: 1.2,    // Headings                                                                                                      
    normal: 1.5,   // Body text                                                                                                     
    relaxed: 1.75, // Long paragraphs                                                                                               
  } as const;    

   // Pre-defined text styles ready to use                                                                                           
  export const Typography: Record<string, TextStyle> = {                                                                            
    // Headings                                                                                                                     
    h1: {                                                                                                                           
      fontSize: FontSize.xxxl,                                                                                                      
      fontWeight: 'bold',                                                                                                           
      lineHeight: FontSize.xxxl * LineHeight.tight,                                                                                 
    },                                                                                                                              
    h2: {                                                                                                                           
      fontSize: FontSize.xxl,                                                                                                       
      fontWeight: 'bold',                                                                                                           
      lineHeight: FontSize.xxl * LineHeight.tight,                                                                                  
    },                                                                                                                              
    h3: {                                                                                                                           
      fontSize: FontSize.xl,                                                                                                        
      fontWeight: '600',     // Semi-bold                                                                                           
      lineHeight: FontSize.xl * LineHeight.tight,                                                                                   
    },                                                                                                                              
                                                                                                                                    
    // Body text                                                                                                                    
    body: {                                                                                                                         
      fontSize: FontSize.md,                                                                                                        
      fontWeight: 'normal',                                                                                                         
      lineHeight: FontSize.md * LineHeight.normal,                                                                                  
    },                                                                                                                              
    bodySmall: {                                                                                                                    
      fontSize: FontSize.sm,                                                                                                        
      fontWeight: 'normal',                                                                                                         
      lineHeight: FontSize.sm * LineHeight.normal,                                                                                  
    },                                                                                                                              
                                                                                                                                    
    // Labels and captions                                                                                                          
    label: {                                                                                                                        
      fontSize: FontSize.sm,                                                                                                        
      fontWeight: '500',                                                                                                            
      lineHeight: FontSize.sm * LineHeight.tight,                                                                                   
    },                                                                                                                              
    caption: {                                                                                                                      
      fontSize: FontSize.xs,                                                                                                        
      fontWeight: 'normal',                                                                                                         
      lineHeight: FontSize.xs * LineHeight.normal,                                                                                  
    },
    captionBis: {                                                                                                                      
      fontSize: FontSize.xxs,                                                                                                        
      fontWeight: 'normal',                                                                                                         
      lineHeight: FontSize.xxs * LineHeight.normal,                                                                                  
    },                                                                                                                              
                                                                                                                                    
    // Buttons                                                                                                                      
    button: {                                                                                                                       
      fontSize: FontSize.md,                                                                                                        
      fontWeight: '600',                                                                                                            
      lineHeight: FontSize.md * LineHeight.tight,                                                                                   
    },                                                                                                                              
    buttonSmall: {                                                                                                                  
      fontSize: FontSize.sm,                                                                                                        
      fontWeight: '600',                                                                                                            
      lineHeight: FontSize.sm * LineHeight.tight,                                                                                   
    },                                                                                                                              
  } as const; 