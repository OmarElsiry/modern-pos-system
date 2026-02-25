export const isElectron = () => {
    // Check if we're running in Electron
    return typeof window !== 'undefined' &&
        window.process !== undefined &&
        window.process.type === 'renderer' ||
        (typeof window !== 'undefined' && (window as any).electronAPI !== undefined);
};

export const getPlatform = (): 'electron' | 'web' => {
    return isElectron() ? 'electron' : 'web';
};
