'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from "@/components/Sidebar";
import TabSystem from "@/components/TabSystem";
import { toast } from 'sonner';
import { useSettings } from '../lib/SettingsContext'; 

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Application() {
    const { settings, loading: settingsLoading } = useSettings(); 
    const [openTabs, setOpenTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fileSystemVersion, setFileSystemVersion] = useState(0);
    const saveTimeoutRef = useRef(null);
    const iseSavingRef = useRef(false);

    // Load user's open tabs from database
    const loadUserTabs = useCallback(async (userId) => {
        try {
            const { data: tabData, error } = await supabase
                .from('user_tabs')
                .select(`
                    *,
                    file_tree (
                        id,
                        name,
                        path,
                        type
                    )
                `)
                .eq('user_id', userId)
                .order('tab_order');

            if (error) {
                console.error('Error loading tabs:', error);
                return;
            }

            const tabs = tabData?.map(tab => ({
                id: tab.file_tree.id,
                name: tab.file_tree.name,
                path: tab.file_tree.path,
                isActive: tab.is_active
            })) || [];

            setOpenTabs(tabs);
            
            // Set active tab
            const activeTab = tabs.find(tab => tab.isActive);
            if (activeTab) {
                setActiveTabId(activeTab.id);
            } else if (tabs.length > 0) {
                setActiveTabId(tabs[0].id);
            }
        } catch (error) {
            console.error('Unexpected error loading tabs:', error);
            setOpenTabs([]);
            setActiveTabId(null);
        }
    }, []);

    // Save tabs to database with race condition protection
    const saveUserTabs = useCallback(async (tabsToSave, activeId = null) => {
        if (!user?.id) {
            console.log('No user ID available for saving tabs');
            return;
        }

        // Prevent concurrent saves
        if (iseSavingRef.current) {
            console.log('Save already in progress, skipping...');
            return;
        }

        iseSavingRef.current = true;

        try {
            console.log('Saving tabs for user:', user.id);

            if (tabsToSave && tabsToSave.length > 0) {
                // Filter out special tabs since they shouldn't be persisted to database
                const validTabs = tabsToSave.filter(tab => tab && tab.id && !tab.isSpecial);
                
                if (validTabs.length === 0) {
                    console.log('No valid file tabs to save (only special tabs)');
                    // Still clear existing tabs since user might have closed all file tabs
                    const { error: deleteError } = await supabase
                        .from('user_tabs')
                        .delete()
                        .eq('user_id', user.id);
                
                    if (deleteError) {
                        console.error('Error clearing tabs:', deleteError);
                    }
                    return;
                }

                // First, delete all existing tabs for this user
                const { error: deleteError } = await supabase
                    .from('user_tabs')
                    .delete()
                    .eq('user_id', user.id);

                if (deleteError) {
                    console.error('Error clearing existing tabs:', deleteError);
                    return;
                }

                // Only save file tabs, not special tabs
                // Also check if activeId is a special tab
                const activeFileId = activeId && !tabsToSave.find(tab => tab.id === activeId)?.isSpecial ? activeId : null;

                // Then insert new tabs
                const tabsData = validTabs.map((tab, index) => ({
                    user_id: user.id,
                    file_id: tab.id,
                    tab_order: index,
                    is_active: activeFileId ? tab.id === activeFileId : index === 0
                }));

                console.log('Inserting tabs:', tabsData);

                const { error: insertError } = await supabase
                    .from('user_tabs')
                    .insert(tabsData);

                if (insertError) {
                    console.error('Error inserting tabs:', insertError);
                    if (settings.showNotifications) {
                        toast.error(`Failed to save tabs: ${insertError.message}`);
                    }
                    return;
                }

                console.log('Successfully saved tabs');
            } else {
                // No tabs to save, just clear existing ones
                const { error: deleteError } = await supabase
                    .from('user_tabs')
                    .delete()
                    .eq('user_id', user.id);
            
                if (deleteError) {
                    console.error('Error clearing tabs:', deleteError);
                }
            }
        } catch (err) {
            console.error('Unexpected error saving tabs:', err);
            if (settings.showNotifications) {
                toast.error(`Unexpected error: ${err.message}`);
            }
        } finally {
            iseSavingRef.current = false;
        }
    }, [user]);

    // Debounced save function to prevent race conditions
    const debouncedSaveUserTabs = useCallback((tabsToSave, activeId = null) => {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Set a new timeout
        saveTimeoutRef.current = setTimeout(() => {
            saveUserTabs(tabsToSave, activeId);
        }, 300); // 300ms debounce
    }, [saveUserTabs]);

    // Close tab
    const closeTab = useCallback(async (tabId) => {
        setOpenTabs(prevTabs => {
            const newTabs = prevTabs.filter(tab => tab.id !== tabId);
            
            // Handle active tab update
            if (activeTabId === tabId) {
                const newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
                setActiveTabId(newActiveId);
                debouncedSaveUserTabs(newTabs, newActiveId);
            } else {
                debouncedSaveUserTabs(newTabs, activeTabId);
            }
            
            return newTabs;
        });
    }, [activeTabId, debouncedSaveUserTabs]);

    // Close multiple tabs at once
    const closeMultipleTabs = useCallback(async (tabIdsToClose) => {
        setOpenTabs(prevTabs => {
            const newTabs = prevTabs.filter(tab => !tabIdsToClose.includes(tab.id));
            
            // If active tab is being closed, switch to another
            if (tabIdsToClose.includes(activeTabId)) {
                const newActiveId = newTabs.length > 0 ? newTabs[0].id : null;
                setActiveTabId(newActiveId);
                debouncedSaveUserTabs(newTabs, newActiveId);
            } else {
                debouncedSaveUserTabs(newTabs, activeTabId);
            }
            
            return newTabs;
        });
    }, [activeTabId, debouncedSaveUserTabs]);

    // Close all other tabs except the specified one
    const closeOtherTabs = useCallback(async (keepTabId) => {
        setOpenTabs(prevTabs => {
            const newTabs = prevTabs.filter(tab => tab.id === keepTabId);
            
            // Set the kept tab as active
            setActiveTabId(keepTabId);
            debouncedSaveUserTabs(newTabs, keepTabId);
            
            return newTabs;
        });
    }, [debouncedSaveUserTabs]);

    // Close all tabs
    const closeAllTabs = useCallback(async () => {
        setOpenTabs([]);
        setActiveTabId(null);
        debouncedSaveUserTabs([], null);
    }, [debouncedSaveUserTabs]);

    // Function to trigger file system refresh
    const triggerFileSystemRefresh = useCallback(() => {
        setFileSystemVersion(prev => prev + 1);
    }, []);

    // Enhanced file update handler
    const handleFileUpdate = useCallback(async (updatedFile, action) => {
        if (action === 'rename') {
            // Update tabs immediately
            setOpenTabs(prevTabs => {
                const hasTab = prevTabs.some(tab => tab.id === updatedFile.id);
                if (hasTab) {
                    const updatedTabs = prevTabs.map(tab => 
                        tab.id === updatedFile.id 
                            ? { ...tab, name: updatedFile.name, path: updatedFile.path }
                            : tab
                    );
                    debouncedSaveUserTabs(updatedTabs, activeTabId);
                    return updatedTabs;
                }
                return prevTabs;
            });
            
            // Trigger file system refresh for sidebar
            triggerFileSystemRefresh();
            
        } else if (action === 'delete') {
            if (settings.closeTabsOnDelete) {
                // Close the tab if the file was deleted - use functional update
                setOpenTabs(prevTabs => {
                    const tabToClose = prevTabs.find(tab => tab.id === updatedFile.id);
                    if (tabToClose) {
                        const newTabs = prevTabs.filter(tab => tab.id !== updatedFile.id);
                        
                        // Handle active tab if the deleted file was active
                        if (activeTabId === updatedFile.id) {
                            const newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
                            setActiveTabId(newActiveId);
                            debouncedSaveUserTabs(newTabs, newActiveId);
                        } else {
                            debouncedSaveUserTabs(newTabs, activeTabId);
                        }
                        
                        return newTabs;
                    }
                    return prevTabs;
                });
            }
        }
    }, [activeTabId, debouncedSaveUserTabs, triggerFileSystemRefresh, settings.closeTabsOnDelete, settings.showNotifications]); // Fixed dependencies

    // Handle file selection from sidebar
    const handleFileSelect = useCallback(async (file) => {
        if (!file || file.type === 'folder') return;

        setOpenTabs(prevTabs => {
            // Check if tab is already open
            const existingTab = prevTabs.find(tab => tab.id === file.id);
            
            if (existingTab) {
                // Just switch to existing tab
                setActiveTabId(file.id);
                debouncedSaveUserTabs(prevTabs, file.id);
                return prevTabs; // No change to tabs
            } else {
                // Create new tab
                const newTab = {
                    id: file.id,
                    name: file.name,
                    path: file.path
                };

                const newTabs = [...prevTabs, newTab];
                setActiveTabId(file.id);
                debouncedSaveUserTabs(newTabs, file.id);
                return newTabs;
            }
        });
    }, [debouncedSaveUserTabs]);

    // Switch tab
    const switchTab = useCallback(async (tabId) => {
        setActiveTabId(tabId);
        setOpenTabs(prevTabs => {
            debouncedSaveUserTabs(prevTabs, tabId);
            return prevTabs; // No change to tabs, just switching active
        });
    }, [debouncedSaveUserTabs]);

    // Reorder tabs
    const reorderTabs = useCallback(async (startIndex, endIndex) => {
        setOpenTabs(prevTabs => {
            const newTabs = [...prevTabs];
            const [removed] = newTabs.splice(startIndex, 1);
            newTabs.splice(endIndex, 0, removed);
            
            debouncedSaveUserTabs(newTabs, activeTabId);
            return newTabs;
        });
    }, [activeTabId, debouncedSaveUserTabs]);

    // Enhanced tab update function
    const updateTabName = useCallback((tabId, newName) => {
        setOpenTabs(prevTabs => {
            const updatedTabs = prevTabs.map(tab => 
                tab.id === tabId 
                    ? { ...tab, name: newName }
                    : tab
            );
            debouncedSaveUserTabs(updatedTabs, activeTabId);
            return updatedTabs;
        });
        
        // Trigger file system refresh for sidebar
        triggerFileSystemRefresh();
    }, [activeTabId, debouncedSaveUserTabs, triggerFileSystemRefresh]);

    // In Application.jsx, fix the closeTabsForFile function
    const closeTabsForFile = useCallback((fileId) => {
        setOpenTabs(prevTabs => {
            const updatedTabs = prevTabs.filter(tab => tab.id !== fileId);
            
            // If the active tab was closed, switch to another tab or clear selection
            if (activeTabId === fileId) {
                if (updatedTabs.length > 0) {
                    setActiveTabId(updatedTabs[0].id);
                } else {
                    setActiveTabId(null);
                }
            }
            
            return updatedTabs;
        });
    }, [activeTabId]);

    // Make the function available globally for the Sidebar to use
    useEffect(() => {
        window.closeTabsForFile = closeTabsForFile;
        
        return () => {
            delete window.closeTabsForFile;
        };
    }, [closeTabsForFile]);

    // Add function to open special tabs (account, settings, etc.)
    const openSpecialTab = useCallback((specialTab) => {
        setOpenTabs(prevTabs => {
            // Check if special tab is already open
            const existingTab = prevTabs.find(tab => tab.id === specialTab.id);
            
            if (existingTab) {
                // Just switch to existing tab
                setActiveTabId(specialTab.id);
                return prevTabs;
            } else {
                // Create new special tab
                const newTab = {
                    id: specialTab.id,
                    name: specialTab.name,
                    type: specialTab.type, // 'account', 'settings', etc.
                    path: specialTab.path,
                    isSpecial: true // Flag to identify special tabs
                };

                const newTabs = [...prevTabs, newTab];
                setActiveTabId(specialTab.id);
                return newTabs;
            }
        });
    }, []);

    // Make the function available globally
    useEffect(() => {
        window.openSpecialTab = openSpecialTab;
        
        return () => {
            delete window.openSpecialTab;
        };
    }, [openSpecialTab]);

    // Initialize user and load tabs
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user && !settingsLoading && settings.restoreTabsOnStartup) {
                await loadUserTabs(user.id);
            }
            setLoading(false);
        };
        
        if (!settingsLoading) {
            fetchUser();
        }
    }, [loadUserTabs, settingsLoading, settings.restoreTabsOnStartup]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen">
                <div className="w-72 border-r border-border bg-background animate-pulse" />
                <div className="flex-1 bg-background animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar 
                key={fileSystemVersion} // Re-render when file system changes
                onFileSelect={handleFileSelect} 
                onFileUpdate={handleFileUpdate}
            />
            <main className="flex-1 flex flex-col min-w-0">
                <TabSystem
                    tabs={openTabs}
                    activeTabId={activeTabId}
                    onTabClose={closeTab}
                    onTabSwitch={switchTab}
                    onTabReorder={reorderTabs}
                    onCloseOthers={closeOtherTabs}
                    onCloseAll={closeAllTabs}
                    onTabUpdate={updateTabName}
                    user={user}
                />
            </main>
        </div>
    );
}