import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { IconContext } from '@phosphor-icons/react';
import { ThemeProvider } from '@/lib/theme-provider';
import { ToastProvider } from '@/components/toast';
import { queryClient } from '@/lib/query-client';
import { Route as Root } from '@/routes/__root';
import { Route as Project } from '@/routes/projects/$projectId/route';
import { Route as Write } from '@/routes/projects/$projectId/write';
import { installPreviewData, projectId } from './data';
import './preview.css';
import { ModeController } from './mode-controller';

if (!crypto.randomUUID) crypto.randomUUID = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};
installPreviewData();
queryClient.setDefaultOptions({ queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } });
const project = Project.update({ id: '/projects/$projectId', path: '/projects/$projectId', getParentRoute: () => Root });
const WriteScreen = Write.options.component;
const write = Write.update({ id: '/write', path: '/write', getParentRoute: () => project, component: () => <><ModeController /><WriteScreen /></> });
const routeTree = Root.addChildren([project.addChildren([write])]);
const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [`/projects/${projectId}/write`] }) });
createRoot(document.getElementById('root')).render(<IconContext.Provider value={{ weight:'bold' }}><QueryClientProvider client={queryClient}><ThemeProvider><ToastProvider><RouterProvider router={router} /></ToastProvider></ThemeProvider></QueryClientProvider></IconContext.Provider>);
