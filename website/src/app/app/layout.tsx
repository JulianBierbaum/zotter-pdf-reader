
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useHistory } from '../../hooks/use-history';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSkeleton,
  SidebarMenuAction,
  useSidebar,
} from '../../components/ui/sidebar';
import { Logo } from '../../components/logo';
import { logout } from '../../lib/actions';
import { History, LogOut, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

function DeleteHistoryItemDialog({ id, pdfName, onConfirm }: { id: string, pdfName: string, onConfirm: (id: string) => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <SidebarMenuAction showOnHover>
                    <Trash2 />
                    <span className="sr-only">Eintrag löschen</span>
                </SidebarMenuAction>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Möchten Sie den Analyse-Eintrag für "{pdfName}" wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Löschen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Await the server action to ensure it completes before redirecting.
    await logout();
    // Redirect on the client-side after the server action is complete.
    router.push('/login');
  };

  return (
    <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <LogOut className="h-4 w-4" />
        )}
        <span>{isLoggingOut ? 'Abmelden...' : 'Abmelden'}</span>
    </Button>
  );
}

function AppSidebar() {
  const { history, isLoading, deleteHistoryItem } = useHistory();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleDelete = (id: string) => {
    if (pathname === `/app/history/${id}`) {
        router.push('/app');
    }
    deleteHistoryItem(id);
    handleLinkClick();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-primary" asChild>
            <Link href="/app" onClick={handleLinkClick}>
                <Logo className="h-6 w-6" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">ZOTTER-PDF</h2>
            <p className="text-xs text-muted-foreground">PDF-Analyse</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/app'} onClick={handleLinkClick}>
              <Link href="/app">
                <PlusCircle />
                <span>Neue Analyse</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
            <History className="h-4 w-4" />
            <span>Verlauf</span>
        </div>
        <SidebarMenu className="mt-2">
          {!isClient || isLoading ? (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          ) : history.length > 0 ? (
            history.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild size="lg" isActive={pathname === `/app/history/${item.id}`} tooltip={{children: item.pdfName, className: "max-w-xs whitespace-normal break-words", align: "start" }} onClick={handleLinkClick}>
                  <Link href={`/app/history/${item.id}`} className="w-full">
                    <div className="flex w-full flex-col items-start gap-1.5 truncate">
                        <span className="font-medium leading-tight truncate">{item.pdfName}</span>
                        {isClient && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: de })}
                          </span>
                        )}
                    </div>
                  </Link>
                </SidebarMenuButton>
                <DeleteHistoryItemDialog id={item.id} pdfName={item.pdfName} onConfirm={handleDelete} />
              </SidebarMenuItem>
            ))
          ) : (
            <div className="px-3 text-sm text-muted-foreground">Kein Verlauf vorhanden.</div>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
            <div className="p-4 sm:p-6 md:p-8 flex-1 w-full flex flex-col items-center">
                <div className="flex w-full max-w-6xl md:hidden items-center justify-between mb-4">
                    <SidebarTrigger className="-ml-2" />
                     <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6 text-primary" />
                        <h1 className="font-semibold text-lg">PDF-ZOTTER</h1>
                    </div>
                </div>
                <div className="flex-1 w-full">
                  {children}
                </div>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
