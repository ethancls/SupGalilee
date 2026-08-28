"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface PersistentTabsPropsWithTabs {
  storageKey: string;
  defaultValue: string;
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
  }[];
  children: React.ReactNode;
  className?: string;
  tabsListClassName?: string;
  /** If provided, the tab value will also be synced with this URL search param */
  urlParam?: string;
  value?: never;
  onValueChange?: never;
}

interface PersistentTabsPropsControlled {
  storageKey: string;
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  /** If provided, the tab value will also be synced with this URL search param */
  urlParam?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  tabs?: never;
  tabsListClassName?: never;
}

type PersistentTabsProps = PersistentTabsPropsWithTabs | PersistentTabsPropsControlled;

export function PersistentTabs(props: PersistentTabsProps) {
  const { storageKey, defaultValue, children, className, urlParam } = props;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get initial value from URL param, localStorage, or default
  const getInitialValue = () => {
    if (typeof window === "undefined") return defaultValue;
    if (urlParam) {
      const urlValue = searchParams.get(urlParam);
      if (urlValue) return urlValue;
    }
    return localStorage.getItem(storageKey) || defaultValue;
  };
  
  // Internal state for uncontrolled mode
  const [internalTab, setInternalTab] = useState<string>(getInitialValue);

  // Determine if controlled
  const isControlled = 'value' in props && props.value !== undefined;
  const activeTab = isControlled ? props.value : internalTab;
  
  const handleValueChange = (value: string) => {
    localStorage.setItem(storageKey, value);
    
    // Update URL if urlParam is provided
    if (urlParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(urlParam, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    
    if (isControlled && props.onValueChange) {
      props.onValueChange(value);
    } else {
      setInternalTab(value);
    }
  };

  // Sync with URL param changes
  useEffect(() => {
    if (urlParam) {
      const urlValue = searchParams.get(urlParam);
      if (urlValue && urlValue !== activeTab) {
        if (isControlled && props.onValueChange) {
          props.onValueChange(urlValue);
        } else {
          setInternalTab(urlValue);
        }
        localStorage.setItem(storageKey, urlValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, urlParam]);

  // Sync localStorage on mount for controlled mode
  useEffect(() => {
    if (isControlled && !urlParam) {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved !== (props as PersistentTabsPropsControlled).value) {
        const onValueChange = (props as PersistentTabsPropsControlled).onValueChange;
        if (onValueChange) {
          onValueChange(saved);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If tabs prop is provided, render with built-in TabsList
  if ('tabs' in props && props.tabs) {
    return (
      <Tabs value={activeTab} onValueChange={handleValueChange} className={className}>
        <TabsList className={cn("w-full justify-start flex-wrap h-auto gap-1 p-1", props.tabsListClassName)}>
          {props.tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    );
  }

  // Otherwise, render just the Tabs wrapper and let children define TabsList
  return (
    <Tabs value={activeTab} onValueChange={handleValueChange} className={className}>
      {children}
    </Tabs>
  );
}

export { TabsContent };
