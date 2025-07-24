"use client";

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';


export default function Home() {
  // Initialize dark mode based on localStorage or system preference
  useEffect(() => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      html.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      html.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Ramen Bae
          </h1>
          <p className="text-muted-foreground">
            Project Setup Complete! 🎉
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              shadcn/ui Components Test
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Button Sizes
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <Button onClick={toggleDarkMode} variant="outline" size="sm">
            Toggle Dark Mode
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>✅ Next.js 15.3.4 with TypeScript</p>
          <p>✅ Tailwind CSS v4 configured</p>
          <p>✅ ESLint and Prettier setup</p>
          <p>✅ shadcn/ui components ready</p>
        </div>
      </div>
    </div>
  );
}
