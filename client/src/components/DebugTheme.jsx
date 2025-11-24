// src/components/DebugTheme.jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const DebugTheme = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-2 text-xs rounded">
      <div>Theme: {theme}</div>
      <div>Is Dark: {isDark.toString()}</div>
      <div>HTML Class: {document.documentElement.className}</div>
    </div>
  );
};

export default DebugTheme;