import React, { createContext, useContext, useMemo, useState } from 'react';
import { AccountType } from '@/shared/types';

// ============================================
// ACCOUNT TYPE PROVIDER
// Holds the role of the current account ('user' | 'professional') for the
// whole app, so every screen (profile today, tab bar tomorrow) reads the same
// value and re-renders when it changes.
//
// TEMPORARY: until authentication exists, the role comes from the mock user
// and can be switched by hand through a development-only control. The auth
// store will replace this provider; screens will keep calling useAccountType().
// ============================================

interface AccountTypeContextValue {
    accountType: AccountType;
    isProfessional: boolean;
    setAccountType: (accountType: AccountType) => void;
}

// null default: using the hook outside the provider is a bug, reported below
const AccountTypeContext = createContext<AccountTypeContextValue | null>(null);

interface AccountTypeProviderProps {
    initialAccountType: AccountType;
    children: React.ReactNode;
}

export const AccountTypeProvider: React.FC<AccountTypeProviderProps> = ({
    initialAccountType,
    children,
}) => {
    const [accountType, setAccountType] = useState<AccountType>(initialAccountType);

    // Memoized so consumers re-render only when the role actually changes
    const value = useMemo(
        () => ({
            accountType,
            isProfessional: accountType === 'professional',
            setAccountType,
        }),
        [accountType],
    );

    return <AccountTypeContext.Provider value={value}>{children}</AccountTypeContext.Provider>;
};

/**
 * Reads the current account role.
 * @returns accountType, isProfessional shortcut, and the setter (dev control only)
 * @throws if called outside <AccountTypeProvider>, to surface the mistake early
 */
export const useAccountType = (): AccountTypeContextValue => {
    const context = useContext(AccountTypeContext);
    if (!context) {
        throw new Error('useAccountType must be used inside <AccountTypeProvider>');
    }
    return context;
};
